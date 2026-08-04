"use client";

import { useState } from "react";

const CONVERSACION_DEMO = [
  { emisor: "bot", texto: "Hola 👋 ¿Buscas algo específico o quieres que te recomiende según tu presupuesto?" },
  { emisor: "user", texto: "Algo para ciudad, máx $7,000" },
  { emisor: "bot", texto: "Te recomiendo la Rasgo 650 seminueva.", mono: "$6,450 · 8,200KM · Financiable a 36 meses" },
] as const;

export default function ChatWidget() {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? "Cerrar asistente" : "Abrir asistente"}
        className="fixed bottom-6 right-6 z-50 bg-ink text-ivory w-14 h-14 flex items-center justify-center shadow-lg hover:bg-oxblood transition-colors"
      >
        {abierto ? "✕" : "💬"}
      </button>

      {abierto && (
        <div className="fixed bottom-24 right-6 z-50 w-[320px] bg-[#151517] border border-white/10 shadow-2xl">
          <div className="bg-[#1c1c1f] px-4 py-3.5 flex items-center gap-2.5 font-mono text-xs text-steel-light border-b border-white/10">
            <span className="w-2 h-2 rounded-full bg-amber" />
            Asistente Asfalto · en línea
          </div>
          <div className="p-4 flex flex-col gap-3 min-h-[220px]">
            {CONVERSACION_DEMO.map((m, i) => (
              <div
                key={i}
                className={`text-[13px] leading-relaxed px-3.5 py-2.5 max-w-[85%] ${
                  m.emisor === "bot"
                    ? "bg-[#26262a] text-ivory self-start rounded-tr-md rounded-b-md"
                    : "bg-oxblood text-ivory self-end rounded-tl-md rounded-b-md"
                }`}
              >
                {m.texto}
                {"mono" in m && m.mono && (
                  <span className="block mt-1.5 font-mono text-[11px] text-amber">{m.mono}</span>
                )}
              </div>
            ))}
          </div>
          <form
            className="flex border-t border-white/10"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-steel focus:outline-none"
            />
            <button type="submit" className="px-4 text-amber font-mono text-xs">
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  );
}
