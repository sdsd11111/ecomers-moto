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
      description: "Busca motocicletas físicas disponibles en el inventario real de Asfalto° según categoría, precio máximo o condición.",
      parameters: {
        type: "object",
        properties: {
          categoria: { type: "string", description: "Categoría: sport, naked, adventure, cruiser, urbana, scooter, touring" },
          precioMax: { type: "number", description: "Presupuesto máximo en USD" },
          condicion: { type: "string", description: "nueva o seminueva" },
          marca: { type: "string", description: "Marca de la moto" },
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
          precio: { type: "number", description: "Precio total de la moto en USD" },
          cuotaInicialPct: { type: "number", description: "Porcentaje de entrada (por defecto 20%)" },
          meses: { type: "number", description: "Plazo en meses (12, 24, 36, 48)" },
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

async function executeToolCall(toolCall: any, customerPhone: string) {
  const name = toolCall.function.name;
  const args = JSON.parse(toolCall.function.arguments || "{}");

  console.log(`[Groq AI Tool Call Executing] -> ${name}(`, args, `)`);

  switch (name) {
    case "buscar_unidades":
      return await buscarUnidadesFisicas(args);

    case "obtener_ficha":
      return await obtenerFichaUnidad(args.unidadId);

    case "calcular_financiamiento":
      return calcularFinanciamiento(args.precio, args.cuotaInicialPct || 20, args.meses || 36);

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
Eres el asistente virtual vendedor experto de 'Asfalto°', un concesionario de motocicletas nuevas y seminuevas en Ecuador.

REGLAS STRICTAS OBLIGATORIAS:
- NUNCA inventes precios, disponibilidad, unidades físicas, chasis o datos técnicos. SIEMPRE usa las herramientas para consultar el sistema en tiempo real.
- Si el cliente pregunta por motos o presupuesto, ejecuta la herramienta 'buscar_unidades'.
- Cada unidad física es única. Si el cliente decide reservar o apartar una moto, confirma el precio y modelo, pide su nombre y ejecuta 'crear_reserva'.
- Una reserva es un compromiso formal de 24 horas para que un asesor los contacte y cierren la compra.
- Responde de forma amable, ejecutiva, directa y entusiasta.
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

    const initialRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messagesHistory,
        tools: TOOLS_SCHEMA,
        tool_choice: "auto",
        temperature: 0.5,
        max_tokens: 600,
      }),
    });

    if (!initialRes.ok) {
      const err = await initialRes.text();
      console.error("Error inicial en Groq Tool Calling:", err);
      return {
        textReply: "¡Hola! Bienvenido a Asfalto°. ¿Buscas una moto nueva o seminueva en particular?",
        toolCallsExecuted: [],
      };
    }

    const initialData = await initialRes.json();
    const choice = initialData.choices?.[0]?.message;

    if (!choice) {
      return {
        textReply: "¡Hola! Gracias por comunicarte con Asfalto°. ¿En qué modelo estás interesado?",
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
      const followUpRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: messagesHistory,
          temperature: 0.5,
          max_tokens: 600,
        }),
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
    console.error("Error en motor de IA con Tool Calling:", error);
    return {
      textReply: "Hola, bienvenido a Asfalto°. ¿En qué motocicleta estás interesado hoy?",
      toolCallsExecuted: [],
    };
  }
}
