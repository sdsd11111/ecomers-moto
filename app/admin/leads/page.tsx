import { leads } from "@/data/motos";

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("es-EC", { day: "2-digit", month: "short" }).format(new Date(iso));

export default function AdminLeads() {
  const sinContactar = leads.filter((l) => !l.contactado).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl uppercase">Leads</h1>
          <p className="font-mono text-xs text-steel mt-1">
            {leads.length} leads capturados por el asistente ·{" "}
            <span className="text-amber">{sinContactar} sin contactar</span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="border-b border-white/10">
              {["Fecha", "Cliente", "Teléfono", "Interés", "Presupuesto", "Origen", "Estado"].map((h) => (
                <th key={h} className="text-left py-2.5 px-3 font-mono text-[10px] text-steel uppercase tracking-wider font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...leads]
              .sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime())
              .map((l) => (
                <tr key={l.id} className="border-b border-white/5 hover:bg-white/[.02]">
                  <td className="py-3.5 px-3 font-mono text-steel-light">{fmtDate(l.creadoEn)}</td>
                  <td className="py-3.5 px-3 font-medium text-ivory">{l.cliente}</td>
                  <td className="py-3.5 px-3 font-mono text-steel-light">{l.telefono}</td>
                  <td className="py-3.5 px-3 text-steel-light">{l.motoInteres}</td>
                  <td className="py-3.5 px-3 font-mono text-steel-light">
                    {l.presupuesto ? fmtPrice(l.presupuesto) : "—"}
                  </td>
                  <td className="py-3.5 px-3 text-steel-light capitalize">{l.origen.replace("-", " ")}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`font-mono text-[10px] px-2.5 py-1 uppercase inline-block ${
                        l.contactado ? "bg-success/15 text-success" : "bg-oxblood/25 text-[#e0838f]"
                      }`}
                    >
                      {l.contactado ? "Contactado" : "Sin contactar"}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
