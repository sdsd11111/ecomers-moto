"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Moto, FiltrosCatalogo, Categoria } from "@/types";
import { filtrarCatalogo, paginar } from "@/lib/filtrarCatalogo";
import ProductCard from "./ProductCard";

const CATEGORIAS: { value: Categoria | "todas"; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "naked", label: "Naked" },
  { value: "adventure", label: "Adventure" },
  { value: "sport", label: "Sport" },
  { value: "urbana", label: "Urbana" },
  { value: "cruiser", label: "Cruiser" },
  { value: "touring", label: "Touring" },
  { value: "scooter", label: "Scooter" },
];

const POR_PAGINA = 12;

export default function CatalogClient({ motos }: { motos: Moto[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const marcas = useMemo(() => Array.from(new Set(motos.map((m) => m.marca))).sort(), [motos]);

  const [filtros, setFiltros] = useState<FiltrosCatalogo>({
    condicion: (searchParams.get("condicion") as FiltrosCatalogo["condicion"]) ?? "todas",
    categoria: (searchParams.get("categoria") as Categoria) ?? "todas",
    marca: searchParams.get("marca") ?? "todas",
    orden: (searchParams.get("orden") as FiltrosCatalogo["orden"]) ?? "relevancia",
    q: searchParams.get("q") ?? "",
  });
  const [pagina, setPagina] = useState(1);

  const actualizar = useCallback(
    (cambios: Partial<FiltrosCatalogo>) => {
      const nuevos = { ...filtros, ...cambios };
      setFiltros(nuevos);
      setPagina(1);
      const params = new URLSearchParams();
      Object.entries(nuevos).forEach(([k, v]) => {
        if (v && v !== "todas") params.set(k, String(v));
      });
      router.replace(`/catalogo${params.toString() ? `?${params}` : ""}`, { scroll: false });
    },
    [filtros, router]
  );

  const filtrados = useMemo(() => filtrarCatalogo(motos, filtros), [motos, filtros]);
  const { items, totalPaginas, paginaActual, total } = paginar(filtrados, pagina, POR_PAGINA);

  return (
    <div>
      {/* Barra de filtros */}
      <div className="flex flex-col gap-5 mb-10">
        <div className="flex flex-wrap items-center gap-2.5">
          {(["todas", "nueva", "seminueva"] as const).map((c) => (
            <button
              key={c}
              onClick={() => actualizar({ condicion: c })}
              className={`font-mono text-xs px-4 py-2 border transition-colors ${
                filtros.condicion === c
                  ? "bg-ink text-ivory border-ink"
                  : "border-steel-light text-steel hover:border-ink hover:text-ink"
              }`}
            >
              {c === "todas" ? "Todas" : c === "nueva" ? "Nuevas" : "Seminuevas"}
            </button>
          ))}
          <span className="w-px h-6 bg-steel-light mx-1" />
          {CATEGORIAS.map((c) => (
            <button
              key={c.value}
              onClick={() => actualizar({ categoria: c.value })}
              className={`font-mono text-xs px-4 py-2 border transition-colors ${
                filtros.categoria === c.value
                  ? "bg-ink text-ivory border-ink"
                  : "border-steel-light text-steel hover:border-ink hover:text-ink"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <select
              value={filtros.marca}
              onChange={(e) => actualizar({ marca: e.target.value })}
              className="font-mono text-xs border border-steel-light px-3.5 py-2.5 bg-white"
            >
              <option value="todas">Todas las marcas</option>
              {marcas.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Buscar modelo..."
              value={filtros.q}
              onChange={(e) => actualizar({ q: e.target.value })}
              className="font-mono text-xs border border-steel-light px-3.5 py-2.5 bg-white w-48"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-steel">{total} resultados</span>
            <select
              value={filtros.orden}
              onChange={(e) => actualizar({ orden: e.target.value as FiltrosCatalogo["orden"] })}
              className="font-mono text-xs border border-steel-light px-3.5 py-2.5 bg-white"
            >
              <option value="relevancia">Relevancia</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="recientes">Año: más reciente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-steel-light">
          <p className="font-display text-3xl uppercase mb-2">Sin resultados</p>
          <p className="text-steel text-sm">Ajusta los filtros para ver más motos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((moto) => (
            <ProductCard key={moto.id} moto={moto} />
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 mt-14 font-mono text-sm">
          <button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
            className="px-4 py-2 border border-steel-light disabled:opacity-30 hover:border-ink transition-colors"
          >
            ← Anterior
          </button>
          <span className="px-4 text-steel">
            {paginaActual} / {totalPaginas}
          </span>
          <button
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
            className="px-4 py-2 border border-steel-light disabled:opacity-30 hover:border-ink transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
