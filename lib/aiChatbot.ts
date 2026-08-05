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
      description: "Busca motocicletas físicas disponibles en el inventario real de Asfalto°. Solo llamar si el cliente solicita explícitamente ver el catálogo, modelos, opciones disponibles o presupuesto.",
      parameters: {
        type: "object",
        properties: {
          categoria: { type: "string", description: "Categoría: sport, naked, adventure, cruiser, urbana, scooter, touring. Omitir completamente este campo si el cliente no lo especificó. NUNCA enviar string vacío." },
          precioMax: { type: "number", description: "Presupuesto máximo en USD como número (ejemplo 5000). Omitir completamente este campo si el cliente no lo especificó. NUNCA enviar string vacío ni texto." },
          condicion: { type: "string", description: "nueva o seminueva. Omitir este campo si no lo especificó. NUNCA enviar string vacío." },
          marca: { type: "string", description: "Marca de la moto. Omitir este campo si no lo especificó. NUNCA enviar string vacío." },
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
    if (clean.precioMax !== undefined) {
      const num = Number(clean.precioMax);
      if (isNaN(num) || num <= 0) {
        delete clean.precioMax;
      } else {
        clean.precioMax = num;
      }
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
Eres el asistente virtual vendedor experto de 'Asfalto°', un concesionario de motocicletas nuevas y seminuevas en Ecuador.

REGLAS STRICTAS Y EJEMPLOS OBLIGATORIOS:
1. NUNCA ejecutes la herramienta 'buscar_unidades' ante saludos genéricos (ej: "Hola", "Buenas tardes", "Hola qué tal") o conversaciones iniciales sin intención concreta. Responde amablemente dando la bienvenida y preguntando qué tipo de moto busca.
2. SOLO ejecuta 'buscar_unidades' cuando el cliente solicite explícitamente ver el catálogo, opciones de modelos, presupuestos específicos o categorías de motos.
3. Si la herramienta requiere parámetros numéricos (como precioMax), pasa únicamente valores numéricos reales (ej: 5000). NUNCA envíes strings vacíos "". Si el cliente no especificó un precio, OMITE totalmente ese parámetro.

EJEMPLOS DE COMPORTAMIENTO (Few-Shot):
- Cliente: "Hola"
  -> Respuesta: Saludo cordial y amable. NO llamar a buscar_unidades.
- Cliente: "Quiero ver el catálogo"
  -> Respuesta: Llamar a buscar_unidades({}).
- Cliente: "Busco una moto de máximo 5000 dólares"
  -> Respuesta: Llamar a buscar_unidades({ precioMax: 5000 }).
- Cliente: "Tienen motos sport seminuevas?"
  -> Respuesta: Llamar a buscar_unidades({ categoria: "sport", condicion: "seminueva" }).
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
