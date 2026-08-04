"use client";

import { useState } from "react";
import StatusBadge from "@/components/admin/StatusBadge";
import { conversaciones } from "@/data/motos";

const fmtHora = (iso: string) =>
  new Intl.DateTimeFormat("es-EC", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export default function AdminConversaciones() {
  const [seleccionada, setSeleccionada] = useState(conversaciones[0]?.id);
  const activa = conversaciones.find((c) => c.id === seleccionada) ?? conversaciones[0];

  return (
    <div>
      <h1 className="font-display font-bold text-3xl uppercase mb-2">Conversaciones</h1>
      <p className="font-mono text-xs text-steel mb-8">
        {conversaciones.length} conversaciones · web + WhatsApp, un solo hilo por cliente
      </p>

      <div className="grid md:grid-cols-[320px_1fr] gap-px bg-white/10 border border-white/10">
        {/* Lista */}
        <div className="bg-[#101012] max-h-[560px] overflow-y-auto">
          {conversaciones.map((c) => (
            <button
              key={c.id}
              onClick={() => setSeleccionada(c.id)}
              className={`w-full text-left px-4 py-3.5 border-b border-white/5 ${
                c.id === activa?.id ? "bg-white/[.04]" : "hover:bg-white/[.02]"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm text-ivory">{c.cliente}</span>
                <span className="font-mono text-[10px] text-steel uppercase">{c.canal}</span>
              </div>
              <p className="text-xs text-steel-light mt-1 truncate">{c.ultimoMensaje}</p>
              <div className="mt-2">
                <StatusBadge status={c.estado} />
              </div>
            </button>
          ))}
        </div>

        {/* Hilo */}
        <div className="bg-[#101012] p-6 flex flex-col">
          {activa && (
            <>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <div className="font-medium text-ivory">{activa.cliente}</div>
                  <div className="font-mono text-[11px] text-steel mt-0.5">
                    {activa.telefono} · Interesado en {activa.motoInteres}
                  </div>
                </div>
                <StatusBadge status={activa.estado} />
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {activa.mensajes.map((m) => (
                  <div
                    key={m.id}
                    className={`text-[13.5px] leading-relaxed px-3.5 py-2.5 max-w-[75%] ${
                      m.emisor === "cliente"
                        ? "self-end bg-oxblood text-ivory rounded-tl-md rounded-b-md"
                        : "self-start bg-[#26262a] text-ivory rounded-tr-md rounded-b-md"
                    }`}
                  >
                    {m.texto}
                    <span className="block mt-1 font-mono text-[10px] text-steel">{fmtHora(m.hora)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
