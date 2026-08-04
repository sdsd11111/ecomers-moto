export default function KpiCard({
  label,
  value,
  delta,
  deltaTone = "success",
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "success" | "warn";
}) {
  return (
    <div className="bg-[#101012] p-5">
      <div className="font-mono text-[10px] text-steel uppercase tracking-wider">{label}</div>
      <div className="font-display font-bold text-3xl mt-2">{value}</div>
      {delta && (
        <div
          className={`font-mono text-[11px] mt-1 ${
            deltaTone === "success" ? "text-success" : "text-amber"
          }`}
        >
          {delta}
        </div>
      )}
    </div>
  );
}
