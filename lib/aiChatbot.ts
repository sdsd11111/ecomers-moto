import { getMotos } from "./motosRepository";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

export async function generateAiResponse(userMessage: string, customerName: string = "Cliente") {
  try {
    const motos = await getMotos();
    const inventorySummary = motos
      .slice(0, 10)
      .map(
        (m) =>
          `- ${m.nombre} (${m.condicion.toUpperCase()} ${m.anio}): $${m.precio} USD, ${m.cilindrada}cc, ${m.potencia}hp, stock: ${m.stock}`
      )
      .join("\n");

    const systemPrompt = `
Eres el asistente virtual experto de 'Asfalto°', un concesionario exclusivo de motocicletas nuevas y seminuevas en Ecuador.
Tu objetivo es ser amable, profesional, conciso y ayudar al cliente a encontrar la moto ideal, brindar precios, financiamiento y agendar pruebas de manejo.

Inventario actual disponible en la tienda:
${inventorySummary}

Reglas clave:
- Responde de forma clara y ejecutiva (máximo 3-4 párrafos cortos).
- Siempre ofrece información útil de precios y cuotas estimadas si el cliente pregunta por presupuesto.
- Anima al cliente a agendar una visita al showroom o prueba de manejo.
`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `El cliente (${customerName}) dice: "${userMessage}"` },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq API error:", errText);
      return "¡Hola! Gracias por comunicarte con Asfalto°. ¿En qué modelo de motocicleta estás interesado hoy?";
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "Hola, gracias por comunicarte con Asfalto°. ¿En qué podemos ayudarte?";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Hola, con gusto te atendemos en Asfalto°. ¿Buscas una moto nueva o seminueva?";
  }
}
