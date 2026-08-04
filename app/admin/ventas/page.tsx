import StatusBadge from "@/components/admin/StatusBadge";
import { ventas } from "@/data/motos";

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("es-EC", { day: "2-digit", month: "short" }).format(new Date(iso));

export default function AdminVentas() {
  const total = ventas.filter((v) => v.estado === "vendida").reduce((s, v) => s + v.monto, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl uppercase">Ventas</h1>
          <p className="font-mono text-xs text-steel mt-1">
            {ventas.length} operaciones registradas · {fmtPrice(total)} cerrado este mes
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="border-b border-white/10">
              {["Fecha", "Cliente", "Modelo", "Origen", "Asesor", "Monto", "Estado"].map((h) => (
                <th key={h} className="text-left py-2.5 px-3 font-mono text-[10px] text-steel uppercase tracking-wider font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...ventas]
              .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
              .map((v) => (
                <tr key={v.id} className="border-b border-white/5 hover:bg-white/[.02]">
                  <td className="py-3.5 px-3 font-mono text-steel-light">{fmtDate(v.fecha)}</td>
                  <td className="py-3.5 px-3 font-medium text-ivory">{v.cliente}</td>
                  <td className="py-3.5 px-3 text-steel-light">{v.motoNombre}</td>
                  <td className="py-3.5 px-3 text-steel-light capitalize">{v.origen.replace("-", " ")}</td>
                  <td className="py-3.5 px-3 text-steel-light">{v.asesor}</td>
                  <td className="py-3.5 px-3 font-mono text-steel-light">{fmtPrice(v.monto)}</td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={v.estado} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
