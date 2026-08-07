import {
  buscarUnidadesFisicas,
  obtenerFichaUnidad,
  crearReservaAtomica,
  calcularFinanciamiento,
} from "./inventoryService";
import { saveLead } from "./dbRepositories";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

const TOOLS_SCHEMA = [
  {
    type: "function",
    function: {
      name: "buscar_unidades",
      description: "Busca motocicletas físicas disponibles en el inventario real de Asfalto° según rango de precios, categoría, marca o condición.",
      parameters: {
        type: "object",
        properties: {
          categoria: { type: "string", description: "Categoría: sport, naked, adventure, cruiser, urbana, scooter, touring. Omitir completamente si no se especificó." },
          precioMin: { type: "number", description: "Presupuesto mínimo en USD (ejemplo 1000). Omitir completamente si no se especificó." },
          precioMax: { type: "number", description: "Presupuesto máximo en USD (ejemplo 3000). Omitir completamente si no se especificó." },
          condicion: { type: "string", description: "nueva o seminueva. Omitir completamente si no se especificó." },
          marca: { type: "string", description: "Marca de la moto. Omitir completamente si no se especificó." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "obtener_ficha",
      description: "Obtiene los detalles completos, ficha técnica y especificaciones de una unidad de moto específica mediante su unidadId.",
      parameters: {
        type: "object",
        properties: {
          unidadId: { type: "string", description: "ID único de la unidad física (ej: unit-moto-001-1)" },
        },
        required: ["unidadId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calcular_financiamiento",
      description: "Calcula las cuotas mensuales de financiamiento y la cuota inicial necesaria para comprar una moto.",
      parameters: {
        type: "object",
        properties: {
          precio: { type: "number", description: "Precio total de la moto en USD como número. NUNCA enviar string vacío." },
          cuotaInicialPct: { type: "number", description: "Porcentaje de entrada (por defecto 20%)." },
          meses: { type: "number", description: "Plazo en meses (12, 24, 36, 48)." },
        },
        required: ["precio"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "crear_reserva",
      description: "Aparta y reserva de forma atómica una unidad física real por 24 horas a nombre del cliente en el sistema.",
      parameters: {
        type: "object",
        properties: {
          unidadId: { type: "string", description: "ID único de la unidad física a reservar" },
          clienteNombre: { type: "string", description: "Nombre del cliente" },
          clienteTelefono: { type: "string", description: "Teléfono del cliente" },
        },
        required: ["unidadId", "clienteNombre", "clienteTelefono"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "notificar_asesor",
      description: "Notifica a un asesor humano cuando el cliente tiene dudas complejas, frustración o quiere cerrar la compra directa.",
      parameters: {
        type: "object",
        properties: {
          clienteTelefono: { type: "string", description: "Teléfono del cliente" },
          motivo: { type: "string", description: "Motivo por el cual el cliente requiere atención humana" },
        },
        required: ["clienteTelefono", "motivo"],
      },
    },
  },
];

function sanitizeToolArguments(name: string, rawArgs: any) {
  const clean = { ...rawArgs };
  for (const key of Object.keys(clean)) {
    if (clean[key] === "" || clean[key] === null || clean[key] === undefined) {
      delete clean[key];
    }
  }
  if (name === "buscar_unidades") {
    if (clean.precioMin !== undefined) {
      const num = Number(clean.precioMin);
      if (isNaN(num) || num <= 0) delete clean.precioMin;
      else clean.precioMin = num;
    }
    if (clean.precioMax !== undefined) {
      const num = Number(clean.precioMax);
      if (isNaN(num) || num <= 0) delete clean.precioMax;
      else clean.precioMax = num;
    }
  }
  return clean;
}

async function executeToolCall(toolCall: any, customerPhone: string) {
  const name = toolCall.function.name;
  let rawArgs = {};
  try {
    rawArgs = JSON.parse(toolCall.function.arguments || "{}");
  } catch (e) {
    rawArgs = {};
  }

  const args = sanitizeToolArguments(name, rawArgs);
  console.log(`[Groq AI Tool Call Executing] -> ${name}(`, args, `)`);

  switch (name) {
    case "buscar_unidades":
      return await buscarUnidadesFisicas(args);

    case "obtener_ficha":
      return await obtenerFichaUnidad(args.unidadId);

    case "calcular_financiamiento":
      return calcularFinanciamiento(args.precio || 5000, args.cuotaInicialPct || 20, args.meses || 36);

    case "crear_reserva":
      return await crearReservaAtomica(
        args.unidadId,
        { nombre: args.clienteNombre, telefono: args.clienteTelefono || customerPhone },
        `conv-${customerPhone}`
      );

    case "notificar_asesor":
      await saveLead({
        id: `lead-urgent-${customerPhone}`,
        cliente: "Cliente Solicitante",
        telefono: customerPhone,
        origen: "whatsapp",
        motoInteres: `Solicita atención humana: ${args.motivo}`,
        contactado: false,
      });
      return { success: true, message: "Un asesor comercial se pondrá en contacto contigo de inmediato." };

    default:
      return { error: "Herramienta no reconocida" };
  }
}

export async function generateAiResponseWithTools(
  userMessage: string,
  customerPhone: string,
  customerName: string = "Cliente"
): Promise<{ textReply: string; toolCallsExecuted: any[] }> {
  try {
    const systemPrompt = `
Eres el asistente virtual vendedor experto de 'Asfalto°' 🏍️, concesionario de motocicletas en Ecuador.

REGLAS DE ESTILO Y BREVEDAD (IMPORTANTE: RESPUESTAS CORTAS Y DIRECTAS):
- Escribe respuestas BREVES, DIRECTAS y CONCISAS (máximo 2 a 3 párrafos cortos). NUNCA envíes textos largos o sermones aburridos.
- Usa negritas (*texto*) para precios, modelos y cuotas.
- Usa 2 o 3 emojis clave por mensaje (🏍️, 💰, ⚡, 📸, ✅). No satures de emojis en cada palabra.

REGLAS DE INVENTARIO Y RESERVA:
1. SIEMPRE hay inventario disponible para reservar. NUNCA le digas al cliente que la moto "ya fue reservada por otro" o "no está disponible".
2. Si el cliente busca en un rango de precios (ej: 500 a 1000), ejecuta 'buscar_unidades' y muestra las motos disponibles más accesibles del catálogo de forma breve.
3. Si el cliente elige una moto (ej: "esa de 1200", "la quiero", "la Rasgo 300"), muestra sus datos en 3 viñetas súper cortas, di que le adjuntas su foto oficial 📸 y ofrece apartarla por 24h.
4. OBLIGATORIO - REQUISITO DE DATOS: Antes de ejecutar la reserva, SIEMPRE debes pedir al cliente su Nombre completo y su Teléfono de contacto. Si aún no te ha dado su nombre o teléfono real, NO ejecutes 'crear_reserva' todavía; pregúntaselos amablemente ("¿A qué nombre y número de teléfono registramos tu apartado?").
5. CONFIRMACIÓN HUMANA: Una vez que el cliente te proporcione su nombre y teléfono, ejecuta 'crear_reserva' con sus datos reales. Confirma de forma cálida y profesional que la moto quedó apartada por 24h y que un asesor comercial se pondrá en contacto pronto. PROHIBIDO mostrar códigos técnicos feos como 'Unidad ID: unit-moto-001-1' o 'Reserva ID: res-...'.
`;

    // Cargar historial previo guardado en MySQL
    const { getConversaciones } = await import("./dbRepositories");
    const allConvs = await getConversaciones();
    const existingConv = allConvs.find((c) => c.telefono === customerPhone || c.id === `conv-${customerPhone}`);
    
    const formattedHistory: any[] = [];
    if (existingConv && existingConv.mensajes) {
      for (const m of existingConv.mensajes.slice(-10)) { // últimos 10 mensajes
        formattedHistory.push({
          role: m.emisor === "cliente" ? "user" : "assistant",
          content: m.texto,
        });
      }
    }

    const messagesHistory: any[] = [
      { role: "system", content: systemPrompt },
      ...formattedHistory,
      { role: "user", content: `Cliente (${customerName}, Teléfono: ${customerPhone}): "${userMessage}"` },
    ];

    // Función de llamada con 1 reintento automático (retry)
    const callGroqWithRetry = async (bodyObj: any, retries: number = 1): Promise<Response> => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify(bodyObj),
          });
          if (res.ok || attempt === retries) return res;
          console.warn(`[Groq AI] Reintento ${attempt + 1}/${retries} por status ${res.status}`);
          await new Promise((r) => setTimeout(r, 1000));
        } catch (e) {
          if (attempt === retries) throw e;
          console.warn(`[Groq AI] Reintento ${attempt + 1}/${retries} por error de red:`, e);
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
      throw new Error("Límite de reintentos alcanzado");
    };

    const initialRes = await callGroqWithRetry({
      model: "llama-3.3-70b-versatile",
      messages: messagesHistory,
      tools: TOOLS_SCHEMA,
      tool_choice: "auto",
      temperature: 0.5,
      max_tokens: 600,
    });

    if (!initialRes.ok) {
      const errText = await initialRes.text();
      console.error("🚨 [ALERTA DE ERROR GROQ API]: Status", initialRes.status, errText);
      return {
        textReply: "Disculpa, tuvimos una interrupción técnica momentánea. En un momento un asesor humano revisará tu mensaje.",
        toolCallsExecuted: [],
      };
    }

    const initialData = await initialRes.json();
    const choice = initialData.choices?.[0]?.message;

    if (!choice) {
      return {
        textReply: "Disculpa, no pudimos procesar la respuesta. Un asesor se pondrá en contacto pronto.",
        toolCallsExecuted: [],
      };
    }

    // Si la IA decidió ejecutar herramientas (Tool Calling)
    if (choice.tool_calls && choice.tool_calls.length > 0) {
      messagesHistory.push(choice);
      const toolCallsExecuted: any[] = [];

      for (const toolCall of choice.tool_calls) {
        const result = await executeToolCall(toolCall, customerPhone);
        toolCallsExecuted.push({
          toolName: toolCall.function.name,
          arguments: toolCall.function.arguments,
          output: result,
        });

        messagesHistory.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: toolCall.function.name,
          content: JSON.stringify(result),
        });
      }

      // Segunda llamada a Groq con los resultados de las tools para generar la respuesta natural final al usuario
      const followUpRes = await callGroqWithRetry({
        model: "llama-3.3-70b-versatile",
        messages: messagesHistory,
        temperature: 0.5,
        max_tokens: 600,
      });

      if (followUpRes.ok) {
        const followUpData = await followUpRes.json();
        const finalContent = followUpData.choices?.[0]?.message?.content;
        return {
          textReply: finalContent || "Procesamos tu solicitud con éxito en Asfalto°.",
          toolCallsExecuted,
        };
      }
    }

    return {
      textReply: choice.content || "Gracias por contactar a Asfalto°. ¿En qué podemos ayudarte?",
      toolCallsExecuted: [],
    };
  } catch (error) {
    console.error("🚨 [ALERTA GENERAL AI ENGINE]:", error);
    return {
      textReply: "Disculpa, nuestro sistema experimentó un inconveniente técnico. Un asesor comercial te contactará a la brevedad.",
      toolCallsExecuted: [],
    };
  }
}
