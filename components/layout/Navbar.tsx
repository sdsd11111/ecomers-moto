"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <nav className="max-w-[1400px] mx-auto px-6 md:px-10 py-7 flex items-center justify-between">
      <Link href="/" className="font-display font-bold text-2xl tracking-tight">
        ASFALTO<span className="text-oxblood">°</span>
      </Link>
      <div className="flex items-center gap-6 sm:gap-9 text-sm font-medium text-steel">
        <Link href="/catalogo" className="hover:text-ink transition-colors">
          Catálogo
        </Link>
        <Link href="/catalogo?condicion=nueva" className="hover:text-ink transition-colors">
          Nuevas
        </Link>
        <Link href="/catalogo?condicion=seminueva" className="hover:text-ink transition-colors">
          Seminuevas
        </Link>

        {/* Cart Trigger Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex items-center gap-2 bg-charcoal text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-oxblood transition-all shadow-sm"
          title="Ver Carrito de Compras"
        >
          <span>🛒 Carrito</span>
          {totalItems > 0 && (
            <span className="bg-oxblood text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-extrabold border-2 border-charcoal">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
