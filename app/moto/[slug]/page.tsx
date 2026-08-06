import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/layout/ChatWidget";
import MotoThumb from "@/components/catalog/MotoThumb";
import ProductCard from "@/components/catalog/ProductCard";
import BackButton from "@/components/ui/BackButton";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { motos } from "@/data/motos";

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export function generateStaticParams() {
  return motos.map((m) => ({ slug: m.slug }));
}

export default async function MotoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const moto = motos.find((m) => m.slug === slug);
  if (!moto) notFound();

  const relacionadas = motos
    .filter((m) => m.id !== moto.id && m.categoria === moto.categoria)
    .slice(0, 3);

  const cuotaInicial = Math.round(moto.precio * (moto.financiamiento.cuotaInicialPct / 100));
  const cuotaMensual = Math.round((moto.precio - cuotaInicial) / moto.financiamiento.mesesMax);

  return (
    <>
      <Navbar />

      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-6">
        <div className="flex items-center justify-between gap-4 mb-8 pt-4 pb-3 border-b border-steel-light">
          <div className="flex items-center gap-4">
            <BackButton />
            <span className="text-steel-light/60 font-light">|</span>
            <div className="font-mono text-xs text-steel flex items-center gap-2">
              <Link href="/catalogo" className="hover:text-ink">
                Catálogo
              </Link>
              <span>/</span>
              <span className="text-ink font-semibold">{moto.nombre}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          {/* Galería */}
          <div>
            <div className="relative">
              <span
                className={`absolute top-4 left-4 z-10 font-mono text-[10px] tracking-wider px-2.5 py-1 uppercase text-ivory ${
                  moto.condicion === "nueva" ? "bg-ink" : "bg-oxblood"
                }`}
              >
                {moto.condicion === "nueva" ? `Nueva · ${moto.anio}` : `Seminueva · ${moto.anio}`}
              </span>
              <MotoThumb 
                src={moto.imagenPrincipal} 
                categoria={moto.categoria} 
                alt={moto.nombre} 
                className="aspect-[4/3]" 
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              {(moto.imagenes && moto.imagenes.length > 0 ? moto.imagenes : [moto.imagenPrincipal]).slice(0, 3).map((img, idx) => (
                <MotoThumb 
                  key={idx} 
                  src={img} 
                  categoria={moto.categoria} 
                  alt={`${moto.nombre} ${idx + 1}`} 
                  className="aspect-square cursor-pointer border border-steel-light hover:border-ink transition-colors" 
                />
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="font-mono text-xs tracking-[.1em] text-oxblood uppercase mb-2">
              {moto.marca} · {moto.categoria}
            </div>
            <h1 className="font-display font-black uppercase text-5xl md:text-6xl leading-[.9]">
              {moto.nombre}
            </h1>
            <p className="text-steel mt-5 leading-relaxed max-w-md">{moto.descripcion}</p>

            <div className="mt-8 flex items-end gap-4">
              <span className="font-mono font-semibold text-3xl">{fmtPrice(moto.precio)}</span>
              {moto.condicion === "seminueva" && (
                <span className="font-mono text-sm text-steel mb-1">{moto.km.toLocaleString("es-EC")} km</span>
              )}
            </div>

            <div className="flex flex-wrap gap-3.5 mt-6">
              <AddToCartButton moto={moto} />
              <a
                href={`https://wa.me/593983237491?text=${encodeURIComponent(`Hola, me interesa comprar la ${moto.nombre} (${fmtPrice(moto.precio)})`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-ink text-ivory px-7 py-4 text-sm font-semibold hover:bg-oxblood transition-colors rounded-xl flex items-center gap-2"
              >
                <span>Consultar por WhatsApp →</span>
              </a>
            </div>

            {/* Financiamiento */}
            {moto.financiamiento.disponible && (
              <div className="mt-8 border border-steel-light p-5 grid grid-cols-3 gap-4 font-mono">
                <div>
                  <div className="text-[10px] text-steel uppercase tracking-wider">Inicial ({moto.financiamiento.cuotaInicialPct}%)</div>
                  <div className="text-lg font-semibold mt-1">{fmtPrice(cuotaInicial)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-steel uppercase tracking-wider">Cuota mensual aprox.</div>
                  <div className="text-lg font-semibold mt-1">{fmtPrice(cuotaMensual)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-steel uppercase tracking-wider">Plazo máximo</div>
                  <div className="text-lg font-semibold mt-1">{moto.financiamiento.mesesMax} meses</div>
                </div>
              </div>
            )}

            {/* Ficha técnica — elemento firma */}
            <div className="mt-10">
              <h2 className="font-mono text-xs uppercase tracking-wider text-steel mb-3">Ficha técnica</h2>
              <table className="w-full font-mono text-sm border-t border-ink">
                {Object.entries(moto.specs).map(([k, v]) => (
                  <tr key={k} className="border-b border-steel-light">
                    <td className="py-3 text-steel">{k}</td>
                    <td className="py-3 text-right font-semibold">{v}</td>
                  </tr>
                ))}
                <tr className="border-b border-steel-light">
                  <td className="py-3 text-steel">Color</td>
                  <td className="py-3 text-right font-semibold">{moto.color}</td>
                </tr>
                <tr>
                  <td className="py-3 text-steel">Stock disponible</td>
                  <td className="py-3 text-right font-semibold">{moto.stock} unidad{moto.stock !== 1 ? "es" : ""}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </section>

      {relacionadas.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-20">
          <h2 className="font-display font-bold text-3xl uppercase border-b border-ink pb-5 mb-10">
            También te puede interesar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relacionadas.map((m) => (
              <ProductCard key={m.id} moto={m} />
            ))}
          </div>
        </section>
      )}

      <Footer />
      <ChatWidget />
    </>
  );
}
