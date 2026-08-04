"use client";

import { useState, useEffect } from "react";

export default function AdminWhatsAppPage() {
  const [instanceName, setInstanceName] = useState("asfalto-motos");
  const [status, setStatus] = useState<string>("cargando");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const checkStatus = async () => {
    try {
      const res = await fetch(`/api/evolution/instance?instance=${instanceName}`);
      const data = await res.json();
      setStatus(data.state || "desconectado");
      if (data.state === "open" || data.state === "CONNECTED") {
        setQrCode(null);
      }
    } catch (e) {
      setStatus("error");
    }
  };

  const handleCreateAndConnect = async () => {
    setLoading(true);
    setMessage("Iniciando instancia en Evolution API...");
    try {
      const res = await fetch("/api/evolution/instance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instance: instanceName }),
      });
      const data = await res.json();

      if (data.qr) {
        setQrCode(data.qr);
        setStatus("connecting");
        setMessage("¡Código QR generado! Escanéalo desde tu aplicación de WhatsApp.");
      } else {
        setMessage("Instancia procesada. Verificando estado...");
        await checkStatus();
      }
    } catch (e: any) {
      setMessage("Error conectando con la API de Evolution: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClean = async () => {
    setLoading(true);
    setMessage("Eliminando sesión previa y generando un nuevo QR fresco...");
    try {
      const res = await fetch("/api/evolution/instance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instance: instanceName, reset: true }),
      });
      const data = await res.json();
      if (data.qr) {
        setQrCode(data.qr);
        setStatus("connecting");
        setMessage("¡Sesión reiniciada con éxito! Escanea el nuevo Código QR inmediatamente.");
      } else {
        setMessage("Instancia reseteada. Obteniendo código...");
        await handleFetchQr();
      }
    } catch (e: any) {
      setMessage("Error al resetear: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchQr = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/evolution/instance?action=qr&instance=${instanceName}`);
      const data = await res.json();
      if (data.base64) {
        setQrCode(data.base64);
        setMessage("Código QR actualizado.");
      } else {
        setMessage("No se pudo obtener el QR. Es posible que ya esté conectado o iniciándose.");
      }
    } catch (e: any) {
      setMessage("Error al obtener QR: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("¿Seguro que deseas desconectar la instancia de WhatsApp?")) return;
    setLoading(true);
    try {
      await fetch(`/api/evolution/instance?instance=${instanceName}`, { method: "DELETE" });
      setQrCode(null);
      setStatus("close");
      setMessage("Instancia desconectada.");
      await checkStatus();
    } catch (e: any) {
      setMessage("Error al desconectar: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(() => {
      checkStatus();
      if (qrCode && status !== "open" && status !== "CONNECTED") {
        fetch(`/api/evolution/instance?action=qr&instance=${instanceName}`)
          .then((r) => r.json())
          .then((d) => {
            if (d.base64) setQrCode(d.base64);
          })
          .catch(() => {});
      }
    }, 9000);
    return () => clearInterval(interval);
  }, [qrCode, status]);

  const isConnected = status === "open" || status === "CONNECTED";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="font-mono text-xs text-amber uppercase tracking-wider mb-1">
          Integración Oficial · WhatsApp Bot
        </div>
        <h1 className="font-display font-black text-3xl md:text-4xl uppercase text-ivory">
          Conexión Evolution API
        </h1>
        <p className="text-steel-light text-sm mt-2">
          Conecta el chatbot de Asfalto Motos a tu número de WhatsApp utilizando la API de Evolution.
        </p>
      </div>

      {/* Tarjeta principal de Estado */}
      <div className="bg-[#18181b] border border-white/10 p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="font-mono text-xs text-steel-light uppercase">Nombre de Instancia</div>
            <div className="font-mono text-lg font-bold text-ivory mt-0.5">{instanceName}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-steel-light uppercase">Estado:</span>
            <span
              className={`font-mono text-xs font-semibold px-3 py-1 uppercase tracking-wider ${
                isConnected
                  ? "bg-green-500/20 text-green-400 border border-green-500/40"
                  : status === "connecting"
                  ? "bg-amber/20 text-amber border border-amber/40"
                  : "bg-oxblood/20 text-red-400 border border-oxblood/40"
              }`}
            >
              {isConnected ? "🟢 Conectado" : status === "connecting" ? "🟡 Esperando QR" : "🔴 Desconectado"}
            </span>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleResetAndClean}
            disabled={loading}
            className="bg-amber text-black font-semibold px-5 py-3 font-mono text-xs uppercase tracking-wider hover:bg-amber/80 transition-colors disabled:opacity-50 cursor-pointer shadow-md"
          >
            {loading ? "Limpiando..." : "⚡ Limpiar Sesión y Generar Nuevo QR Fresco"}
          </button>
          <button
            onClick={handleCreateAndConnect}
            disabled={loading}
            className="border border-white/20 text-ivory px-5 py-3 font-mono text-xs font-semibold uppercase tracking-wider hover:border-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isConnected ? "Reconectar Instancia" : "🚀 Conectar Existente"}
          </button>
          <button
            onClick={checkStatus}
            disabled={loading}
            className="border border-white/20 text-steel-light px-4 py-3 font-mono text-xs hover:text-white transition-colors cursor-pointer"
          >
            🔄 Estado
          </button>
          {isConnected && (
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="ml-auto border border-red-500/50 text-red-400 px-4 py-3 font-mono text-xs hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              Desconectar
            </button>
          )}
        </div>

        {message && (
          <div className="bg-[#222226] border border-white/10 text-ivory px-4 py-3 font-mono text-xs">
            {message}
          </div>
        )}

        {/* Visualizador de Código QR */}
        {qrCode && !isConnected && (
          <div className="bg-[#101012] border border-amber/40 p-6 flex flex-col items-center justify-center gap-4 text-center">
            <div className="font-mono text-xs text-amber uppercase tracking-wider">
              Escanea este código QR con WhatsApp en tu teléfono
            </div>
            <div className="p-4 bg-white rounded-md shadow-lg">
              <img
                src={qrCode.startsWith("data:image") ? qrCode : `data:image/png;base64,${qrCode}`}
                alt="WhatsApp QR Code"
                className="w-64 h-64 object-contain"
              />
            </div>
            <div className="font-mono text-[11px] text-steel-light max-w-sm">
              Ve a WhatsApp en tu celular → Dispositivos vinculados → Vincular un dispositivo.
            </div>
          </div>
        )}
      </div>

      {/* Información de Restricción */}
      <div className="bg-[#18181b] border border-amber/30 p-5 font-mono text-xs text-amber flex items-center gap-3">
        <span className="text-lg">🔒</span>
        <div>
          <b>Filtro de seguridad activo:</b> El chatbot de WhatsApp responderá <b>únicamente al número +593982337491</b>. Los demás mensajes serán ignorados.
        </div>
      </div>
    </div>
  );
}
