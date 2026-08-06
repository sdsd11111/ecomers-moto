"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import MotoThumb from "@/components/catalog/MotoThumb";

export default function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={() => setIsCartOpen(false)}
    >
      <div
        className="fixed inset-y-0 right-0 flex max-w-full pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between text-ink">
          {/* Header */}
          <div className="px-6 py-5 bg-[#0e0e10] text-white flex items-center justify-between border-b border-steel/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛒</span>
              <h2 className="text-lg font-bold tracking-tight text-white">Tu Carrito de Compras</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-white hover:text-oxblood transition-colors text-xl font-bold bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center border border-white/20"
              title="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 text-steel space-y-4">
                <span className="text-5xl block">🏍️</span>
                <p className="text-base font-medium text-ink">Tu carrito está vacío</p>
                <p className="text-xs text-steel">Explora nuestro catálogo y agrega tu moto o accesorio favorito.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 items-center p-3 rounded-xl border border-steel-light bg-ivory/40 hover:border-oxblood/40 transition-all"
                >
                  <div className="w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-steel-light bg-silver">
                    <MotoThumb
                      src={item.imagen}
                      categoria={item.categoria}
                      alt={item.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-ink truncate">{item.nombre}</h4>
                    <p className="text-xs font-semibold text-oxblood">${item.precio.toLocaleString()}</p>
                    {item.condicion && (
                      <span className="inline-block text-[10px] bg-oxblood/10 text-oxblood px-2 py-0.5 rounded mt-1 capitalize font-medium">
                        {item.condicion}
                      </span>
                    )}
                  </div>
                  {/* Quantity controls */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-steel hover:text-oxblood text-xs transition-colors"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                    <div className="flex items-center border border-steel-light rounded-lg overflow-hidden bg-white text-xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        className="px-2 py-1 bg-ivory hover:bg-steel-light/30 font-bold text-ink"
                      >
                        -
                      </button>
                      <span className="px-2.5 font-semibold text-ink">{item.cantidad}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                        className="px-2 py-1 bg-ivory hover:bg-steel-light/30 font-bold text-ink"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-steel-light bg-ivory/40 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-steel font-medium">Subtotal</span>
                <span className="text-lg font-bold text-ink">${subtotal.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-steel">
                * Los costos finales de matrícula y envío se confirman en el proceso de checkout.
              </p>
              <button
                onClick={handleProceedCheckout}
                className="w-full py-3.5 px-4 bg-oxblood text-white font-bold rounded-xl shadow-lg hover:bg-oxblood/90 transition-all flex items-center justify-center gap-2"
              >
                <span>Proceder al Checkout (4 Pasos)</span>
                <span>➔</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
