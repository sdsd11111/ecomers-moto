import Link from "next/link";
import type { Moto } from "@/types";
import MotoThumb from "./MotoThumb";

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
  return (
    <Link
      href={`/moto/${moto.slug}`}
      className="group flex flex-col bg-white border border-steel-light hover:border-ink transition-colors"
    >
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
          <span className="text-sm font-semibold text-oxblood">Ver ficha →</span>
        </div>
      </div>
    </Link>
  );
}
