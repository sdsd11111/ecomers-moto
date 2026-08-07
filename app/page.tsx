import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SpecStrip from "@/components/layout/SpecStrip";
import ContactForm from "@/components/layout/ContactForm";
import ProductCard from "@/components/catalog/ProductCard";
import { motos } from "@/data/motos";

export default function Home() {
  const destacadas = motos.filter((m) => m.destacada).slice(0, 5);

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pt-2 grid md:grid-cols-[1.1fr_.9fr] border-b border-steel-light">
        <div className="pb-14 flex flex-col justify-end">
          <div className="flex items-center gap-2.5 font-mono text-xs tracking-[.14em] text-oxblood uppercase mb-5">
            <span className="w-6 h-px bg-oxblood" />
            Concesionario · Nuevas &amp; Seminuevas
          </div>
          <h1 className="font-display font-black uppercase leading-[.86] text-[56px] md:text-[100px] tracking-tight">
            Cada
            <br />
            <span className="text-transparent [-webkit-text-stroke:1.5px_#0e0e10]">grado</span>
            <br />
            cuenta
          </h1>
          <p className="max-w-sm mt-6 text-steel leading-relaxed">
            Motos nuevas y seminuevas certificadas. Ficha técnica real, sin letra
            pequeña, y un asistente que responde tus preguntas al instante — en la
            web o por WhatsApp.
          </p>
          <div className="flex gap-3.5 mt-8">
            <Link
              href="/catalogo"
              className="bg-ink text-ivory px-7 py-4 text-sm font-semibold hover:bg-oxblood transition-colors"
            >
              Explorar catálogo →
            </Link>
            <Link
              href="/catalogo?condicion=seminueva"
              className="border border-steel-light px-7 py-4 text-sm font-semibold hover:border-ink transition-colors"
            >
              Ver seminuevas
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/5] bg-gradient-to-b from-[#1a1a1c] to-ink overflow-hidden flex flex-col justify-between p-6">
          <div className="flex-1 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-oxblood/10 blur-3xl rounded-full scale-75 pointer-events-none" />
            <img
              src="/logo-icon.svg"
              alt="Logo Asfalto° Motos"
              className="w-48 h-48 md:w-64 md:h-64 object-contain relative z-10 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] opacity-95 hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="relative z-10 bg-white/[.08] backdrop-blur-sm border border-white/25 px-4.5 py-3.5 text-ivory font-mono text-xs flex justify-between gap-4">
            <div>
              <b className="block text-lg text-amber font-mono">62°</b>ángulo máx.
            </div>
            <div>
              <b className="block text-lg text-amber font-mono">3.1s</b>0-100
            </div>
            <div>
              <b className="block text-lg text-amber font-mono">1,290cc</b>cilindrada
            </div>
          </div>
        </div>
      </section>

      <SpecStrip />

      {/* DESTACADAS */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-20 md:py-24">
        <div className="flex justify-between items-end mb-12 border-b border-ink pb-5">
          <h2 className="font-display font-bold text-3xl md:text-[42px] uppercase">Destacadas</h2>
          <Link href="/catalogo" className="font-mono text-xs uppercase border-b border-ink pb-0.5">
            Ver las {motos.length} →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {destacadas.map((moto, i) => (
            <div key={moto.id} className={i === 0 ? "col-span-2 row-span-1" : ""}>
              <ProductCard moto={moto} size={i === 0 ? "lg" : "sm"} />
            </div>
          ))}
        </div>
      </section>

      {/* QUIÉNES SOMOS */}
      <section className="bg-ink text-ivory">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-20 md:py-24">
          <div className="mb-12 border-b border-white/20 pb-5">
            <h2 className="font-display font-bold text-3xl md:text-[42px] uppercase">Quiénes somos</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <div className="font-mono text-xs tracking-[.14em] text-amber uppercase mb-4">
                Desde 2015 · Ecuador
              </div>
              <p className="max-w-md text-steel-light leading-relaxed text-lg">
                Somos un concesionario especializado en motos nuevas y seminuevas
                certificadas. Cada unidad pasa por una inspección rigurosa de más
                de 60 puntos antes de llegar al showroom.
              </p>
              <p className="max-w-md text-steel-light leading-relaxed mt-4">
                Nuestro compromiso es la transparencia total: ficha técnica real,
                historial verificable y financiamiento sin letra pequeña. Trabajamos
                con las mejores marcas para ofrecerte la moto que se adapta a tu vida.
              </p>
              <div className="grid grid-cols-3 gap-6 mt-10">
                {[
                  { num: "500+", label: "Motos vendidas" },
                  { num: "98%", label: "Clientes satisfechos" },
                  { num: "10+", label: "Años de experiencia" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="font-mono text-3xl font-bold text-amber">{stat.num}</div>
                    <div className="font-mono text-[11px] text-steel-light uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-[#1a1a1c] border border-white/10 p-8">
                <ul className="flex flex-col gap-5">
                  {[
                    { icon: "🔍", title: "Inspección certificada", desc: "Más de 60 puntos de revisión en cada unidad seminueva." },
                    { icon: "📄", title: "Transparencia total", desc: "Ficha técnica real e historial completo verificable." },
                    { icon: "💳", title: "Financiamiento flexible", desc: "Planes desde 12 hasta 48 meses con tasa competitiva." },
                    { icon: "🛡️", title: "Garantía extendida", desc: "Cobertura de hasta 12 meses en todas las unidades." },
                  ].map((item) => (
                    <li key={item.title} className="flex gap-4 items-start">
                      <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
                      <div>
                        <div className="font-mono text-sm font-semibold text-ivory">{item.title}</div>
                        <div className="text-steel-light text-sm leading-relaxed mt-0.5">{item.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute -top-3 -right-3 w-24 h-24 border border-amber/30" />
              <div className="absolute -bottom-3 -left-3 w-16 h-16 border border-oxblood/40" />
            </div>
          </div>
        </div>
      </section>

      {/* UBICACIÓN Y CONTACTO */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-20 md:py-24">
        <div className="mb-12 border-b border-ink pb-5">
          <h2 className="font-display font-bold text-3xl md:text-[42px] uppercase">Ubicación &amp; Contacto</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          {/* Formulario */}
          <div>
            <div className="font-mono text-xs tracking-[.14em] text-oxblood uppercase mb-6">
              Escríbenos · Te respondemos en menos de 24h
            </div>
            <ContactForm />
          </div>

          {/* Mapa + Info de contacto */}
          <div className="flex flex-col gap-6">
            <div className="relative w-full aspect-[4/3] bg-[#1a1a1c] border border-steel-light overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15949.22!2d-79.8987!3d-2.1894!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902d6d4b2b0b2b5d%3A0x0!2zMsKwMTEnMjEuOCJTIDc5wrA1Myc1NS4zIlc!5e0!3m2!1ses!2sec!4v1700000000000!5m2!1ses!2sec"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Asfalto°"
                className="absolute inset-0"
              />
            </div>
            <div className="bg-ink text-ivory p-6 border border-ink">
              <div className="font-mono text-[10px] uppercase tracking-wider text-amber mb-4">Información de contacto</div>
              <div className="grid grid-cols-1 gap-4 font-mono text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-amber">📍</span>
                  <span className="text-steel-light">Av. Principal S/N, Guayaquil, Ecuador</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber">📞</span>
                  <span className="text-steel-light">+593 99 000 0000</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber">✉️</span>
                  <span className="text-steel-light">ventas@asfalto.ec</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber">🕐</span>
                  <span className="text-steel-light">Lun–Sáb: 9:00 – 18:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
