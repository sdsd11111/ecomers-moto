"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import MotoThumb from "@/components/catalog/MotoThumb";

export default function CheckoutModal() {
  const {
    items,
    subtotal,
    clearCart,
    isCheckoutOpen,
    setIsCheckoutOpen,
  } = useCart();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data Step 2
  const [formData, setFormData] = useState({
    nombre: "",
    cedula: "",
    telefono: "",
    email: "",
    ciudad: "",
    direccion: "",
    tipoEntrega: "envio", // "envio" | "retiro"
  });

  // Step 3 Payment choice
  const [metodoPago, setMetodoPago] = useState<"transferencia" | "tarjeta">("transferencia");
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");

  if (!isCheckoutOpen) return null;

  const handleNextStep = () => {
    if (step === 2) {
      if (!formData.nombre.trim() || !formData.telefono.trim()) {
        alert("Por favor completa al menos tu nombre y número de WhatsApp.");
        return;
      }
    }
    if (step < 4) {
      setStep((prev) => (prev + 1) as any);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as any);
    }
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    const newOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(newOrderId);

    // Save order data to MySQL via API
    try {
      await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: newOrderId,
          nombre: formData.nombre,
          cedula: formData.cedula,
          telefono: formData.telefono,
          email: formData.email,
          ciudad: formData.ciudad,
          direccion: formData.direccion,
          tipoEntrega: formData.tipoEntrega,
          metodoPago,
          items,
          subtotal,
        }),
      });
    } catch (e) {
      console.error("Error enviando datos de orden a la DB:", e);
    } finally {
      setIsSubmitting(false);
      setOrderConfirmed(true);
      setStep(4);
    }
  };

  const handleClose = () => {
    if (orderConfirmed) {
      clearCart();
      setOrderConfirmed(false);
      setStep(1);
    }
    setIsCheckoutOpen(false);
  };

  const itemsSummaryText = items
    .map((i) => `• ${i.nombre} (x${i.cantidad}) - $${(i.precio * i.cantidad).toLocaleString()}`)
    .join("%0A");

  const whatsappMessage = `Hola Asfalto°! 👋 Acabo de realizar el pedido *#${orderId}*%0A%0A*Cliente:* ${formData.nombre}%0A*Teléfono:* ${formData.telefono}%0A*Ciudad:* ${formData.ciudad || "Ecuador"}%0A*Total:* $${subtotal.toLocaleString()}%0A%0A*Productos:*%0A${itemsSummaryText}%0A%0AAdjunto mi comprobante de transferencia bancaria. 📄`;

  const whatsappLink = `https://wa.me/593983237491?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-steel-light overflow-hidden text-ink flex flex-col max-h-[90vh]">
        
        {/* Modal Header con Fondo Oscuro y Texto Blanco de Alto Contraste */}
        <div className="bg-[#0e0e10] px-6 py-5 text-white flex items-center justify-between border-b border-steel/20">
          <div>
            <h3 className="font-extrabold text-xl tracking-tight text-white">Finalizar Compra</h3>
            <p className="text-xs text-steel-light mt-0.5 font-medium">Paso {step} de 4</p>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-oxblood transition-colors text-xl font-bold bg-white/10 hover:bg-white/20 w-9 h-9 rounded-full flex items-center justify-center border border-white/20"
            title="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Steps Indicator Bar */}
        <div className="bg-[#f5f2ec] px-6 py-3 border-b border-steel-light flex justify-between items-center text-xs font-semibold">
          {[
            { num: 1, label: "1. Carrito" },
            { num: 2, label: "2. Envío/Cliente" },
            { num: 3, label: "3. Pago" },
            { num: 4, label: "4. Confirmación" },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-1.5 ${
                step === s.num
                  ? "text-oxblood font-bold"
                  : step > s.num
                  ? "text-ink font-semibold"
                  : "text-steel"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step === s.num
                    ? "bg-oxblood text-white shadow-sm"
                    : step > s.num
                    ? "bg-ink text-white"
                    : "bg-steel-light/60 text-steel"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* PASO 1: Resumen de Carrito */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-bold text-lg text-ink flex items-center gap-2">
                <span>🛒</span> Paso 1: Resumen de tu Compra
              </h4>
              <div className="divide-y divide-steel-light border border-steel-light rounded-xl overflow-hidden bg-ivory/40">
                {items.map((item) => (
                  <div key={item.id} className="p-4 flex items-center gap-4">
                    <div className="w-16 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-steel-light bg-silver">
                      <MotoThumb
                        src={item.imagen}
                        categoria={item.categoria}
                        alt={item.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-sm text-ink">{item.nombre}</h5>
                      <p className="text-xs text-oxblood font-semibold">
                        ${item.precio.toLocaleString()} x {item.cantidad}
                      </p>
                    </div>
                    <span className="font-bold text-base text-ink">
                      ${(item.precio * item.cantidad).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-oxblood/10 border border-oxblood/30 flex justify-between items-center">
                <span className="font-bold text-steel">Total a Pagar:</span>
                <span className="text-2xl font-extrabold text-oxblood">${subtotal.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* PASO 2: Datos de Contacto y Envío */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-bold text-lg text-ink flex items-center gap-2">
                <span>📍</span> Paso 2: Información del Cliente y Entrega
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-steel mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-steel-light focus:border-oxblood focus:ring-1 focus:ring-oxblood outline-none text-sm bg-white text-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-steel mb-1">Teléfono WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 0991234567"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-steel-light focus:border-oxblood focus:ring-1 focus:ring-oxblood outline-none text-sm bg-white text-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-steel mb-1">Cédula / RUC</label>
                  <input
                    type="text"
                    placeholder="Ej. 1712345678"
                    value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-steel-light focus:border-oxblood focus:ring-1 focus:ring-oxblood outline-none text-sm bg-white text-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-steel mb-1">Ciudad</label>
                  <input
                    type="text"
                    placeholder="Ej. Quito, Guayaquil, Cuenca"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-steel-light focus:border-oxblood focus:ring-1 focus:ring-oxblood outline-none text-sm bg-white text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-steel mb-1">Dirección de Entrega / Referencia</label>
                <textarea
                  rows={2}
                  placeholder="Calle principal, secundaria y número de casa / referencia"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-steel-light focus:border-oxblood focus:ring-1 focus:ring-oxblood outline-none text-sm bg-white text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-steel mb-2">Modo de Entrega</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink">
                    <input
                      type="radio"
                      name="tipoEntrega"
                      value="envio"
                      checked={formData.tipoEntrega === "envio"}
                      onChange={() => setFormData({ ...formData, tipoEntrega: "envio" })}
                    />
                    🚚 Envío a Domicilio / Agencia
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink">
                    <input
                      type="radio"
                      name="tipoEntrega"
                      value="retiro"
                      checked={formData.tipoEntrega === "retiro"}
                      onChange={() => setFormData({ ...formData, tipoEntrega: "retiro" })}
                    />
                    🏢 Retiro en Showroom (Quito)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: Método de Pago */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-bold text-lg text-ink flex items-center gap-2">
                <span>💳</span> Paso 3: Selección de Método de Pago
              </h4>

              <div className="space-y-3">
                {/* Option 1: Tarjeta de Crédito (Disabled as requested) */}
                <div className="p-4 rounded-xl border border-steel-light bg-ivory/50 opacity-60 cursor-not-allowed flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="radio" disabled checked={metodoPago === "tarjeta"} />
                    <div>
                      <h5 className="font-bold text-sm text-ink flex items-center gap-2">
                        💳 Tarjeta de Crédito / Débito
                        <span className="text-[10px] bg-steel-light text-ink font-semibold px-2 py-0.5 rounded">
                          Próximamente
                        </span>
                      </h5>
                      <p className="text-xs text-steel">Cobro con pasarela bancaria directa en mantenimiento.</p>
                    </div>
                  </div>
                </div>

                {/* Option 2: Transferencia Bancaria (Active) */}
                <div
                  onClick={() => setMetodoPago("transferencia")}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    metodoPago === "transferencia"
                      ? "border-oxblood bg-oxblood/5 ring-1 ring-oxblood"
                      : "border-steel-light hover:border-oxblood/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={metodoPago === "transferencia"}
                      onChange={() => setMetodoPago("transferencia")}
                    />
                    <div>
                      <h5 className="font-bold text-sm text-ink flex items-center gap-2">
                        🏦 Transferencia Bancaria (Recomendado)
                        <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded">
                          ACTIVO
                        </span>
                      </h5>
                      <p className="text-xs text-steel">Transferencia directa a cuenta de empresa Asfalto°.</p>
                    </div>
                  </div>

                  {/* Bank Details Box */}
                  {metodoPago === "transferencia" && (
                    <div className="mt-4 p-4 rounded-lg bg-white border border-oxblood/20 text-xs space-y-2">
                      <p className="font-bold text-ink border-b border-steel-light pb-1">
                        📋 Datos para realizar la Transferencia:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-steel">
                        <div><strong className="text-ink">Banco:</strong> Banco Pichincha</div>
                        <div><strong className="text-ink">Tipo:</strong> Cuenta Corriente</div>
                        <div><strong className="text-ink">Nº Cuenta:</strong> 2100485912</div>
                        <div><strong className="text-ink">Titular:</strong> ASFALTO MOTOS S.A.S.</div>
                        <div><strong className="text-ink">RUC:</strong> 1793148592001</div>
                        <div><strong className="text-ink">Email:</strong> pagos@asfalto-motos.ec</div>
                      </div>
                      <p className="text-[11px] text-oxblood font-medium pt-1">
                        * Al finalizar, podrás enviar tu comprobante directamente a nuestro WhatsApp oficial para validación inmediata.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PASO 4: Confirmación & WhatsApp Link */}
          {step === 4 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto">
                ✓
              </div>
              <div>
                <h4 className="font-extrabold text-2xl text-ink">¡Pedido Registrado con Éxito!</h4>
                <p className="text-sm font-semibold text-oxblood mt-1">Número de Orden: #{orderId}</p>
                <p className="text-xs text-steel mt-2 max-w-md mx-auto">
                  Gracias por tu compra en **Asfalto°**. Tus datos se han registrado correctamente en nuestra base de datos.
                </p>
              </div>

              {/* Order Summary Card */}
              <div className="bg-ivory/60 p-4 rounded-xl text-left border border-steel-light text-xs space-y-2">
                <div className="flex justify-between font-bold border-b border-steel-light pb-1 text-ink">
                  <span>Cliente: {formData.nombre}</span>
                  <span>Tel: {formData.telefono}</span>
                </div>
                <div className="flex justify-between text-steel">
                  <span>Método de Pago: Transferencia Bancaria</span>
                  <span className="font-bold text-ink text-sm">Total: ${subtotal.toLocaleString()}</span>
                </div>
              </div>

              {/* WhatsApp Action Button */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-3"
              >
                <span className="text-xl">📲</span>
                <span>Enviar Comprobante por WhatsApp</span>
              </a>
            </div>
          )}

        </div>

        {/* Modal Footer Buttons */}
        <div className="p-6 border-t border-steel-light bg-ivory/40 flex justify-between items-center">
          {step < 4 ? (
            <>
              {step > 1 ? (
                <button
                  onClick={handlePrevStep}
                  className="px-5 py-2.5 text-xs font-bold border border-steel-light rounded-xl hover:bg-steel-light/20 transition-colors text-ink"
                >
                  ← Anterior
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-oxblood hover:bg-oxblood/90 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <span>Siguiente</span>
                  <span>➔</span>
                </button>
              ) : (
                <button
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-oxblood hover:bg-oxblood/90 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Guardando..." : "Confirmar y Finalizar Pedido"}</span>
                  <span>✓</span>
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-3 bg-[#0e0e10] hover:bg-oxblood text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>✕ Cerrar y Volver a la Tienda</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
