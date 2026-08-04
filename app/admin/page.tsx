import Link from "next/link";
import KpiCard from "@/components/admin/KpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { getMotos } from "@/lib/motosRepository";
import { getVentas, getLeads } from "@/lib/dbRepositories";

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default async function AdminResumen() {
  const motos = await getMotos();
  const ventas = await getVentas();
  const leads = await getLeads();

  const ventasMes = ventas.filter((v) => v.estado === "vendida").reduce((s, v) => s + v.monto, 0);
  const unidadesVendidas = ventas.filter((v) => v.estado === "vendida").length;
  const leadsSinContactar = leads.filter((l) => !l.contactado).length;
  const stockBajoMinimo = motos.filter((m) => m.stock <= 2).length;

  const ultimasVentas = [...ventas]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 6);

  return (
    <div>
      <h1 className="font-display font-bold text-3xl uppercase mb-8">Resumen</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 mb-10">
        <KpiCard label="Ventas del mes" value={fmtPrice(ventasMes)} delta="↑ MySQL activo" />
        <KpiCard label="Unidades vendidas" value={String(unidadesVendidas)} delta={`${ventas.length} en pipeline`} />
        <KpiCard label="Leads del chatbot" value={String(leads.length)} delta={`${leadsSinContactar} sin contactar`} deltaTone="warn" />
        <KpiCard label="Stock activo" value={String(motos.reduce((s, m) => s + m.stock, 0))} delta={`${stockBajoMinimo} bajo mínimo`} deltaTone="warn" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel">Ventas recientes</h2>
        <Link href="/admin/ventas" className="font-mono text-xs text-steel-light hover:text-ivory">
          Ver todas →
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {["Cliente", "Modelo", "Origen", "Monto", "Estado"].map((h) => (
              <th key={h} className="text-left py-2.5 px-3 font-mono text-[10px] text-steel uppercase tracking-wider font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ultimasVentas.map((v) => (
            <tr key={v.id} className="border-b border-white/5">
              <td className="py-3.5 px-3 text-steel-light">{v.cliente}</td>
              <td className="py-3.5 px-3 text-steel-light">{v.motoNombre}</td>
              <td className="py-3.5 px-3 text-steel-light capitalize">{v.origen.replace("-", " ")}</td>
              <td className="py-3.5 px-3 text-steel-light font-mono">{fmtPrice(v.monto)}</td>
              <td className="py-3.5 px-3">
                <StatusBadge status={v.estado} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
