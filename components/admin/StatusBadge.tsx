const STYLES: Record<string, string> = {
  vendida: "bg-success/15 text-success",
  cotizacion: "bg-amber/15 text-amber",
  "test-drive": "bg-amber/15 text-amber",
  "lead-nuevo": "bg-oxblood/25 text-[#e0838f]",
  perdida: "bg-white/10 text-steel-light",
  activa: "bg-success/15 text-success",
  "esperando-asesor": "bg-amber/15 text-amber",
  cerrada: "bg-white/10 text-steel-light",
};

const LABELS: Record<string, string> = {
  vendida: "Vendida",
  cotizacion: "Cotización",
  "test-drive": "Test drive",
  "lead-nuevo": "Lead nuevo",
  perdida: "Perdida",
  activa: "Activa",
  "esperando-asesor": "Esperando asesor",
  cerrada: "Cerrada",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`font-mono text-[10px] px-2.5 py-1 uppercase inline-block ${STYLES[status] ?? "bg-white/10 text-steel-light"}`}>
      {LABELS[status] ?? status}
    </span>
  );
}
