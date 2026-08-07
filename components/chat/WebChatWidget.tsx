"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  imageUrl?: string | null;
  time: string;
}

export default function WebChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "bot",
      text: "🌟 ¡Hola! Bienvenido a Asfalto° 🏍️. ¿Qué rango de presupuesto o tipo de moto estás buscando hoy?",
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
      {/* Botón flotante burbuja */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3.5 rounded-full shadow-2xl hover:scale-105 transition-transform duration-200 font-bold border border-white/20"
        aria-label="Abrir Chat Asfalto"
      >
        <span className="text-xl">💬</span>
        <span className="hidden sm:inline font-mono text-sm uppercase tracking-wider">Asistente AI Asfalto°</span>
      </button>

      {/* Modal flotante de Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[92vw] sm:w-[400px] h-[550px] bg-charcoal/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-charcoal to-black p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-lg">
                🏍️
              </div>
              <div>
                <h3 className="font-display font-bold text-white tracking-wide text-base">Asfalto° AI Sales Engine</h3>
                <p className="font-mono text-[10px] text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> En línea 24/7
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white text-xl p-1 font-bold"
            >
              ✕
            </button>
          </div>

          {/* Formulario rápido opcional de Nombre/Teléfono */}
          {showContactModal && (
            <div className="bg-red-950/90 p-3 border-b border-red-500/30 text-xs flex flex-col gap-2">
              <p className="text-white font-mono">Ingresa tus datos para registrar tu reserva:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tu Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/50 border border-white/20 px-2 py-1 rounded text-white text-xs w-1/2"
                />
                <input
                  type="text"
                  placeholder="Tu Teléfono (WhatsApp)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-black/50 border border-white/20 px-2 py-1 rounded text-white text-xs w-1/2"
                />
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="bg-red-600 hover:bg-red-500 text-white font-mono text-[10px] uppercase py-1 rounded"
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
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    m.sender === "user"
                      ? "bg-red-600 text-white rounded-br-none shadow-md"
                      : "bg-white/10 text-ivory border border-white/10 rounded-bl-none shadow-md"
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                  {/* Foto de la moto desplegada dentro del chat web */}
                  {m.imageUrl && (
                    <div className="mt-2.5 rounded-lg overflow-hidden border border-white/20 bg-black/40">
                      <img
                        src={m.imageUrl}
                        alt="Fotografía de Motocicleta"
                        className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <span
                    className={`block text-[9px] mt-1 text-right font-mono ${
                      m.sender === "user" ? "text-white/70" : "text-white/40"
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-white/50 font-mono text-[10px]">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce [animation-delay:0.4s]"></div>
                <span>Consultando inventario en MySQL...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulario de Entrada */}
          <form onSubmit={handleSendMessage} className="p-3 bg-black/80 border-t border-white/10 flex gap-2">
            <input
              type="text"
              placeholder="Escribe tu mensaje o consulta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-white/5 border border-white/15 focus:border-red-500 rounded-xl px-3 py-2 text-white text-xs outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-bold transition-colors text-xs flex items-center justify-center"
            >
              ➔
            </button>
          </form>
        </div>
      )}
    </>
  );
}
