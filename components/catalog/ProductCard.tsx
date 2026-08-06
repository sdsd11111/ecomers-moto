"use client";

import Link from "next/link";
import type { Moto } from "@/types";
import MotoThumb from "./MotoThumb";
import { useCart } from "@/context/CartContext";

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default function ProductCard({
  moto,
  size = "sm",
}: {
  moto: Moto;
  size?: "sm" | "lg";
}) {
  const isLg = size === "lg";
  const { addItem, setIsCartOpen } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: moto.id || moto.slug,
      nombre: moto.nombre,
      precio: moto.precio,
      imagen: moto.imagenPrincipal || "/motos/default.png",
      condicion: moto.condicion,
      categoria: moto.categoria,
    });
    setIsCartOpen(true);
  };

  return (
    <div className="group flex flex-col bg-white border border-steel-light hover:border-ink transition-colors relative">
      <Link href={`/moto/${moto.slug}`} className="flex flex-col flex-1">
        <div className="relative">
          <span
            className={`absolute top-3.5 left-3.5 z-10 font-mono text-[10px] tracking-wider px-2.5 py-1 uppercase text-ivory ${
              moto.condicion === "nueva" ? "bg-ink" : "bg-oxblood"
            }`}
          >
            {moto.condicion === "nueva" ? `Nueva · ${moto.anio}` : "Seminueva"}
          </span>
          <MotoThumb 
            src={moto.imagenPrincipal}
            categoria={moto.categoria}
            alt={moto.nombre}
            className={isLg ? "aspect-[16/10]" : "aspect-[4/3]"} 
          />
        </div>
        <div className="p-5 flex-1 flex flex-col gap-2.5">
          <h3 className="font-display font-bold text-2xl uppercase leading-none group-hover:text-oxblood transition-colors">
            {moto.nombre}
          </h3>
          <div className="font-mono text-[11px] text-steel tracking-wide uppercase">
            {moto.cilindrada}CC · {moto.potencia}HP · {moto.peso}KG · {moto.color}
            {moto.condicion === "seminueva" && ` · ${moto.km.toLocaleString("es-EC")}KM`}
          </div>
          <div className="mt-auto pt-3.5 border-t border-steel-light flex items-center justify-between">
            <span className="font-mono font-semibold text-lg">{fmtPrice(moto.precio)}</span>
            <span className="text-xs font-semibold text-steel group-hover:text-oxblood">Ver ficha →</span>
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="px-5 pb-5 pt-0">
        <button
          onClick={handleAddToCart}
          className="w-full py-2.5 bg-charcoal hover:bg-oxblood text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>🛒 Agregar al Carrito</span>
        </button>
      </div>
    </div>
  );
}
