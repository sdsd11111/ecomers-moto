import { getMotos } from "@/lib/motosRepository";
import { getUnidadesResumen } from "@/lib/dbRepositories";

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default async function AdminInventario() {
  const motos = await getMotos();
  const unidades = await getUnidadesResumen();

  const bajoMinimo = motos.filter((m) => m.stock <= 2).length;
  const totalUnidades = unidades.length;
  const disponibles = unidades.filter((u) => u.estado === "disponible").length;
  const reservadas = unidades.filter((u) => u.estado === "reservada").length;
  const vendidas = unidades.filter((u) => u.estado === "vendida").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl uppercase">Inventario</h1>
          <p className="font-mono text-xs text-steel mt-1">
            {motos.length} modelos · {motos.reduce((s, m) => s + m.stock, 0)} unidades en stock ·{" "}
            <span className="text-amber">{bajoMinimo} bajo mínimo</span>
          </p>
        </div>
        <button className="bg-oxblood text-ivory px-5 py-2.5 text-sm font-semibold">
          + Agregar unidad
        </button>
      </div>

      {/* KPIs de unidades físicas */}
      {totalUnidades > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 mb-8">
          <div className="bg-[#101012] p-4">
            <div className="font-mono text-[10px] text-steel uppercase tracking-wider mb-1">Total Unidades Físicas</div>
            <div className="font-display text-2xl font-bold text-ivory">{totalUnidades}</div>
          </div>
          <div className="bg-[#101012] p-4">
            <div className="font-mono text-[10px] text-steel uppercase tracking-wider mb-1">Disponibles</div>
            <div className="font-display text-2xl font-bold text-success">{disponibles}</div>
          </div>
          <div className="bg-[#101012] p-4">
            <div className="font-mono text-[10px] text-steel uppercase tracking-wider mb-1">Reservadas</div>
            <div className="font-display text-2xl font-bold text-amber">{reservadas}</div>
          </div>
          <div className="bg-[#101012] p-4">
            <div className="font-mono text-[10px] text-steel uppercase tracking-wider mb-1">Vendidas</div>
            <div className="font-display text-2xl font-bold text-steel-light">{vendidas}</div>
          </div>
        </div>
      )}

      {/* Tabla de Unidades Físicas desde MySQL */}
      {totalUnidades > 0 && (
        <>
          <h2 className="font-mono text-xs uppercase tracking-wider text-steel mb-3">
            Unidades Físicas en Base de Datos ({totalUnidades})
          </h2>
          <div className="overflow-x-auto mb-10">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-white/10">
                  {["ID Unidad", "Modelo", "Marca", "Condición", "Año", "Km", "Color", "Chasis", "Estado"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 font-mono text-[10px] text-steel uppercase tracking-wider font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {unidades.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[.02]">
                    <td className="py-3.5 px-3 font-mono text-[11px] text-steel-light">{u.id}</td>
                    <td className="py-3.5 px-3 font-medium text-ivory">{u.nombre}</td>
                    <td className="py-3.5 px-3 text-steel-light">{u.marca}</td>
                    <td className="py-3.5 px-3 text-steel-light capitalize">{u.condicion}</td>
                    <td className="py-3.5 px-3 font-mono text-steel-light">{u.anio}</td>
                    <td className="py-3.5 px-3 font-mono text-steel-light">{u.km?.toLocaleString() || "0"}</td>
                    <td className="py-3.5 px-3 text-steel-light">{u.color}</td>
                    <td className="py-3.5 px-3 font-mono text-[10px] text-steel">{u.chasis || "—"}</td>
                    <td className="py-3.5 px-3">
                      <span className={`font-mono text-[10px] px-2.5 py-1 uppercase inline-block ${
                        u.estado === "disponible" ? "bg-success/15 text-success" :
                        u.estado === "reservada" ? "bg-amber/15 text-amber" :
                        "bg-white/5 text-steel"
                      }`}>
                        {u.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tabla de Modelos (catálogo) */}
      <h2 className="font-mono text-xs uppercase tracking-wider text-steel mb-3">
        Modelos en Catálogo ({motos.length})
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="border-b border-white/10">
              {["Modelo", "Marca", "Categoría", "Condición", "Precio", "Stock", ""].map((h) => (
                <th key={h} className="text-left py-2.5 px-3 font-mono text-[10px] text-steel uppercase tracking-wider font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {motos.map((m) => (
              <tr key={m.id} className="border-b border-white/5 hover:bg-white/[.02]">
                <td className="py-3.5 px-3 font-medium text-ivory">{m.nombre}</td>
                <td className="py-3.5 px-3 text-steel-light">{m.marca}</td>
                <td className="py-3.5 px-3 text-steel-light capitalize">{m.categoria}</td>
                <td className="py-3.5 px-3 text-steel-light capitalize">{m.condicion}</td>
                <td className="py-3.5 px-3 font-mono text-steel-light">{fmtPrice(m.precio)}</td>
                <td className="py-3.5 px-3">
                  <span className={`font-mono ${m.stock <= 2 ? "text-amber" : "text-steel-light"}`}>
                    {m.stock}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-xs text-steel-light">Editar</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
