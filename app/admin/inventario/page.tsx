import { motos } from "@/data/motos";

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default function AdminInventario() {
  const bajoMinimo = motos.filter((m) => m.stock <= 2).length;

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
