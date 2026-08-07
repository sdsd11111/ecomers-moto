import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CatalogClient from "@/components/catalog/CatalogClient";
import { motos } from "@/data/motos";

export const metadata = {
  title: "Catálogo — Asfalto°",
};

export default function CatalogoPage() {
  return (
    <>
      <Navbar />
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-14">
        <div className="mb-10">
          <h1 className="font-display font-bold text-4xl md:text-5xl uppercase">Catálogo</h1>
          <p className="text-steel mt-2">{motos.length} motos nuevas y seminuevas disponibles</p>
        </div>
        <Suspense fallback={<div className="py-24 text-center text-steel font-mono text-sm">Cargando catálogo…</div>}>
          <CatalogClient motos={motos} />
        </Suspense>
      </section>
      <Footer />
    </>
  );
}
