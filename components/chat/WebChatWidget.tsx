"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  mono?: string;
  imageUrl?: string | null;
  time: string;
}

export default function WebChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "bot",
      text: "Hola 👋 ¿Buscas algo específico o quieres que te recomiende motocicletas según tu presupuesto?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userMsgText,
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          customerPhone: phone || "web-visitante",
          customerName: name || "Cliente Web",
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        const botMsg: Message = {
          id: `b-${Date.now()}`,
          sender: "bot",
          text: data.reply,
          imageUrl: data.imageUrl,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: "bot",
            text: "Disculpa, tuvimos un inconveniente de conexión. Por favor intenta nuevamente.",
            time: timeStr,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "bot",
          text: "Disculpa, ocurrió un error de red. Intenta en un momento.",
          time: timeStr,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante al estilo original Asfalto */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Cerrar asistente" : "Abrir asistente"}
        className="fixed bottom-6 right-6 z-50 bg-ink text-ivory w-14 h-14 flex items-center justify-center shadow-2xl hover:bg-oxblood transition-colors rounded-none border border-white/20"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Ventana modal de Chat con estética #151517 Asfalto */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[350px] h-[520px] bg-[#151517] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header minimalista */}
          <div className="bg-[#1c1c1f] px-4 py-3.5 flex items-center justify-between font-mono text-xs text-steel-light border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
              <span>Asistente Asfalto · en línea AI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-steel hover:text-ivory text-sm"
            >
              ✕
            </button>
          </div>

          {/* Formulario rápido opcional de Nombre/Teléfono para la reserva */}
          {showContactModal && (
            <div className="bg-[#1c1c1f] p-3 border-b border-white/10 text-xs flex flex-col gap-2 font-mono">
              <p className="text-steel-light">Ingresa tus datos para registrar tu reserva:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tu Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/50 border border-white/20 px-2 py-1 text-ivory text-xs w-1/2 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Tu Teléfono (WhatsApp)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-black/50 border border-white/20 px-2 py-1 text-ivory text-xs w-1/2 focus:outline-none"
                />
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="bg-oxblood hover:bg-red-700 text-ivory font-mono text-[10px] uppercase py-1"
              >
                Guardar Datos
              </button>
            </div>
          )}

          {/* Cuerpo de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`text-[13px] leading-relaxed px-3.5 py-2.5 max-w-[85%] ${
                    m.sender === "bot"
                      ? "bg-[#26262a] text-ivory self-start rounded-tr-md rounded-b-md"
                      : "bg-oxblood text-ivory self-end rounded-tl-md rounded-b-md"
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                  {/* Fotografía oficial desplegada dentro del chat */}
                  {m.imageUrl && (
                    <div className="mt-2.5 rounded overflow-hidden border border-white/20 bg-black">
                      <img
                        src={m.imageUrl}
                        alt="Fotografía de Motocicleta"
                        className="w-full h-36 object-cover"
                      />
                    </div>
                  )}

                  <span
                    className={`block text-[9px] mt-1 text-right font-mono ${
                      m.sender === "user" ? "text-ivory/60" : "text-steel"
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-steel-light font-mono text-[11px] px-2 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber animate-ping"></span>
                <span>Consultando inventario en MySQL...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulario de Entrada estilo Asfalto */}
          <form onSubmit={handleSendMessage} className="flex border-t border-white/10 bg-[#151517]">
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-steel focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 text-amber hover:text-white disabled:opacity-30 font-mono text-xs transition-colors"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  );
}
