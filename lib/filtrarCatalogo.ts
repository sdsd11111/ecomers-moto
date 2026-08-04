import type { Moto, FiltrosCatalogo } from "@/types";

export function filtrarCatalogo(motos: Moto[], filtros: FiltrosCatalogo): Moto[] {
  let resultado = [...motos];

  if (filtros.condicion && filtros.condicion !== "todas") {
    resultado = resultado.filter((m) => m.condicion === filtros.condicion);
  }
  if (filtros.categoria && filtros.categoria !== "todas") {
    resultado = resultado.filter((m) => m.categoria === filtros.categoria);
  }
  if (filtros.marca && filtros.marca !== "todas") {
    resultado = resultado.filter((m) => m.marca === filtros.marca);
  }
  if (typeof filtros.precioMin === "number") {
    resultado = resultado.filter((m) => m.precio >= filtros.precioMin!);
  }
  if (typeof filtros.precioMax === "number") {
    resultado = resultado.filter((m) => m.precio <= filtros.precioMax!);
  }
  if (filtros.q) {
    const q = filtros.q.toLowerCase();
    resultado = resultado.filter(
      (m) => m.nombre.toLowerCase().includes(q) || m.marca.toLowerCase().includes(q)
    );
  }

  switch (filtros.orden) {
    case "precio-asc":
      resultado.sort((a, b) => a.precio - b.precio);
      break;
    case "precio-desc":
      resultado.sort((a, b) => b.precio - a.precio);
      break;
    case "recientes":
      resultado.sort((a, b) => b.anio - a.anio);
      break;
    default:
      resultado.sort((a, b) => Number(b.destacada) - Number(a.destacada));
  }

  return resultado;
}

export function paginar<T>(items: T[], pagina: number, porPagina: number) {
  const total = items.length;
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const paginaActual = Math.min(Math.max(1, pagina), totalPaginas);
  const inicio = (paginaActual - 1) * porPagina;
  return {
    items: items.slice(inicio, inicio + porPagina),
    total,
    totalPaginas,
    paginaActual,
  };
}
