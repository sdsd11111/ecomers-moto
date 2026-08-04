const ITEMS = [
  { val: "68", lbl: "Unidades en stock" },
  { val: "10", lbl: "Marcas disponibles" },
  { val: "24/7", lbl: "Asistente activo" },
  { val: "48", lbl: "Meses de financiamiento" },
  { val: "100%", lbl: "Certificación seminuevas" },
];

export default function SpecStrip() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-5 grid grid-cols-2 md:grid-cols-5 border-b border-steel-light font-mono">
      {ITEMS.map((item, i) => (
        <div key={item.lbl} className={`px-0 md:px-5 py-3 md:py-0 ${i > 0 ? "md:border-l border-steel-light" : ""}`}>
          <div className="text-xl md:text-[22px] font-semibold">{item.val}</div>
          <div className="text-[10px] tracking-wider text-steel uppercase mt-1">{item.lbl}</div>
        </div>
      ))}
    </div>
  );
}
