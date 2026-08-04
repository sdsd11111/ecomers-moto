"use client";

export default function ContactForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: hook up to actual form submission
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-steel mb-1.5">Nombre</label>
          <input
            type="text"
            placeholder="Tu nombre"
            className="w-full border border-steel-light px-4 py-3 text-sm bg-transparent placeholder:text-steel/50 focus:border-ink focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-steel mb-1.5">Teléfono</label>
          <input
            type="tel"
            placeholder="+593 9XX XXX XXXX"
            className="w-full border border-steel-light px-4 py-3 text-sm bg-transparent placeholder:text-steel/50 focus:border-ink focus:outline-none transition-colors"
          />
        </div>
      </div>
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-wider text-steel mb-1.5">Email</label>
        <input
          type="email"
          placeholder="tu@correo.com"
          className="w-full border border-steel-light px-4 py-3 text-sm bg-transparent placeholder:text-steel/50 focus:border-ink focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-wider text-steel mb-1.5">¿En qué moto estás interesado?</label>
        <input
          type="text"
          placeholder="Ej: Duello GT 1290, Adventure 800..."
          className="w-full border border-steel-light px-4 py-3 text-sm bg-transparent placeholder:text-steel/50 focus:border-ink focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-wider text-steel mb-1.5">Mensaje</label>
        <textarea
          rows={4}
          placeholder="Cuéntanos qué necesitas..."
          className="w-full border border-steel-light px-4 py-3 text-sm bg-transparent placeholder:text-steel/50 focus:border-ink focus:outline-none transition-colors resize-none"
        />
      </div>
      <button
        type="submit"
        className="bg-ink text-ivory px-7 py-4 text-sm font-semibold hover:bg-oxblood transition-colors self-start"
      >
        Enviar consulta →
      </button>
    </form>
  );
}
