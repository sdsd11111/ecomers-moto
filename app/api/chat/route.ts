import { NextResponse } from "next/server";
import { generateAiResponseWithTools } from "@/lib/aiChatbot";
import { saveConversacion, saveLead } from "@/lib/dbRepositories";

export async function POST(request: Request) {
  try {
    const { message, customerPhone, customerName } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ status: "error", error: "Mensaje vacío" }, { status: 400 });
    }

    const phone = customerPhone && customerPhone.trim() ? customerPhone.replace(/\D/g, "") : "web-visitante";
    const name = customerName && customerName.trim() ? customerName.trim() : "Cliente Web";

    console.log(`[Web Bot] Mensaje recibido de ${phone} (${name}): "${message}"`);

    // Invocación al motor de IA Groq
    const { textReply, toolCallsExecuted } = await generateAiResponseWithTools(message, phone, name);

    // Persistencia en MySQL con origen web-chat
    const timestamp = new Date().toISOString();
    await saveConversacion({
      id: `conv-web-${phone}`,
      cliente: name,
      telefono: phone,
      canal: "web-chat" as any,
      estado: "activa",
      ultimoMensaje: textReply,
      actualizadoEn: timestamp,
      mensajes: [
        { id: `m-${Date.now()}-1`, emisor: "cliente", texto: message, hora: timestamp },
        {
          id: `m-${Date.now()}-2`,
          emisor: "bot",
          texto: textReply,
          hora: timestamp,
          toolCalls: toolCallsExecuted,
        } as any,
      ],
    });

    if (phone !== "web-visitante" && phone.length > 5) {
      await saveLead({
        id: `lead-web-${phone}`,
        cliente: name,
        telefono: phone,
        origen: "web-chat",
        motoInteres: toolCallsExecuted.length > 0 ? `Herramientas: ${toolCallsExecuted.map((t) => t.toolName).join(", ")}` : "Consulta en Chat Web",
        contactado: true,
      });
    }

    // Extraer imagen si la herramienta buscar_unidades u obtener_ficha trajo info
    let imageUrl = null;
    if (toolCallsExecuted && toolCallsExecuted.length > 0) {
      for (const t of toolCallsExecuted) {
        if (t.output && Array.isArray(t.output) && t.output.length > 0 && t.output[0].imagenPrincipal) {
          imageUrl = t.output[0].imagenPrincipal;
          break;
        } else if (t.output && t.output.imagenPrincipal) {
          imageUrl = t.output.imagenPrincipal;
          break;
        }
      }
    }

    // Garantizar que la imagen nunca se envíe nula o rota cuando el usuario o bot hablan de motos o fotos
    const lower = message.toLowerCase();
    const replyLower = textReply.toLowerCase();
    if (!imageUrl && (lower.includes("moto") || lower.includes("rasgo") || lower.includes("foto") || lower.includes("si") || lower.includes("quiero") || lower.includes("reservar") || replyLower.includes("foto") || replyLower.includes("aprecies"))) {
      imageUrl = "/motos/cruiser.png";
    }

    return NextResponse.json({
      status: "success",
      reply: textReply,
      imageUrl,
      toolCallsExecuted,
    });
  } catch (error: any) {
    console.error("Error en Web Chat API:", error);
    return NextResponse.json({ status: "error", error: error.message }, { status: 500 });
  }
}
