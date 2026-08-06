import { NextResponse } from "next/server";
import { generateAiResponseWithTools } from "@/lib/aiChatbot";
import { saveConversacion, saveLead } from "@/lib/dbRepositories";

const EVOLUTION_API_URL = (process.env.EVOLUTION_API_URL || "http://178.238.238.158:8080").replace(/\/$/, "");
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";
const ALLOWED_NUMBER = process.env.ALLOWED_WHATSAPP_NUMBER || "593983237491";
const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || "asfalto-motos";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // Check if event is a message
    const data = payload.data || payload;
    const key = data.key || {};
    const fromMe = key.fromMe;
    const remoteJid = key.remoteJid || "";

    // Ignore messages sent by ourselves or empty JID
    if (fromMe || !remoteJid) {
      return NextResponse.json({ status: "ignored_from_me" });
    }

    // Clean phone number
    const cleanNumber = remoteJid.replace(/@.*$/, "").replace(/\D/g, "");

    // STRICT NUMBER RESTRICTION: ONLY respond to 593982337491
    if (!cleanNumber.includes(ALLOWED_NUMBER) && !ALLOWED_NUMBER.includes(cleanNumber)) {
      console.log(`[WhatsApp Bot] Ignored message from unallowed number: ${cleanNumber}`);
      return NextResponse.json({ status: "ignored_restricted_number", number: cleanNumber });
    }

    // Extract message content
    const message = data.message || {};
    const textMessage =
      message.conversation ||
      message.extendedTextMessage?.text ||
      message.imageMessage?.caption ||
      "";

    if (!textMessage.trim()) {
      return NextResponse.json({ status: "no_text_content" });
    }

    const pushName = data.pushName || "Cliente";

    console.log(`[WhatsApp Bot] Received message from allowed number ${cleanNumber} (${pushName}): "${textMessage}"`);

    // Generate AI response with Groq Tool Calling Engine
    console.log(`[WhatsApp Bot] Calling Groq Tool Calling Engine for "${textMessage}"...`);
    const { textReply, toolCallsExecuted } = await generateAiResponseWithTools(textMessage, cleanNumber, pushName);
    console.log(`[WhatsApp Bot] AI generated response: "${textReply}"`);

    // Send response via Evolution API
    const sendUrl = `${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`;
    console.log(`[WhatsApp Bot] Sending response via Evolution API to ${sendUrl}...`);
    const sendRes = await fetch(sendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: cleanNumber,
        text: textReply,
        delay: 1000,
      }),
    });

    const sendData = await sendRes.json().catch(() => ({}));
    console.log(`[WhatsApp Bot] Evolution sendText result status ${sendRes.status}:`, JSON.stringify(sendData));

    // Si la conversación involucró mostrar el catálogo, motos u opciones, enviamos la foto oficial de la moto
    const lowerMsg = textMessage.toLowerCase();
    const isCatalogInquiry =
      lowerMsg.includes("catalogo") ||
      lowerMsg.includes("catálogo") ||
      lowerMsg.includes("moto") ||
      lowerMsg.includes("opciones") ||
      lowerMsg.includes("ver") ||
      lowerMsg.includes("ficha") ||
      lowerMsg.includes("5") ||
      lowerMsg.includes("1") ||
      toolCallsExecuted.some((t) => t.toolName === "buscar_unidades" || t.toolName === "obtener_ficha");

    if (isCatalogInquiry) {
      const sendMediaUrl = `${EVOLUTION_API_URL}/message/sendMedia/${INSTANCE_NAME}`;
      
      // Obtener URL de imagen o fallback
      let imageUrl = "https://ecomers-moto.vercel.app/motos/cruiser.png";
      let captionText = "🏍️ *Rasgo 650* - ¡Tu próxima moto de aventuras!";

      // Si la tool trajo unidades con imagen, usar la primera
      const searchTool = toolCallsExecuted.find((t) => t.toolName === "buscar_unidades" || t.toolName === "obtener_ficha");
      if (searchTool && Array.isArray(searchTool.output) && searchTool.output.length > 0) {
        const moto = searchTool.output[0];
        if (moto.imagen_principal) {
          imageUrl = moto.imagen_principal.startsWith("http")
            ? moto.imagen_principal
            : `https://ecomers-moto.vercel.app${moto.imagen_principal}`;
        }
        if (moto.nombre) {
          captionText = `🏍️ *${moto.nombre}* - Precio: $${moto.precio?.toLocaleString() || "5,140"}`;
        }
      }

      console.log(`[WhatsApp Bot] Sending motorcycle image via Evolution API: ${imageUrl}...`);

      fetch(sendMediaUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number: cleanNumber,
          mediatype: "image",
          media: imageUrl,
          caption: captionText,
          delay: 1500,
        }),
      }).catch((e) => console.error("Error enviando imagen de la moto:", e));
    }

    // Save conversation & lead in MySQL database
    const timestamp = new Date().toISOString();
    await saveConversacion({
      id: `conv-${cleanNumber}`,
      cliente: pushName,
      telefono: cleanNumber,
      canal: "whatsapp",
      estado: "activa",
      ultimoMensaje: textReply,
      actualizadoEn: timestamp,
      mensajes: [
        { id: `m-${Date.now()}-1`, emisor: "cliente", texto: textMessage, hora: timestamp },
        {
          id: `m-${Date.now()}-2`,
          emisor: "bot",
          texto: textReply,
          hora: timestamp,
          toolCalls: toolCallsExecuted,
        } as any,
      ],
    });

    await saveLead({
      id: `lead-${cleanNumber}`,
      cliente: pushName,
      telefono: cleanNumber,
      origen: "whatsapp",
      motoInteres: toolCallsExecuted.length > 0 ? `Herramientas: ${toolCallsExecuted.map((t) => t.toolName).join(", ")}` : "Consulta por WhatsApp",
      contactado: true,
    });

    return NextResponse.json({
      status: "success",
      repliedTo: cleanNumber,
      reply: textReply,
      sendResult: sendData,
    });
  } catch (error: any) {
    console.error("Error handling WhatsApp webhook:", error);
    return NextResponse.json({ status: "error", error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "online", allowedNumber: ALLOWED_NUMBER });
}
