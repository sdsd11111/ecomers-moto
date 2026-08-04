import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="max-w-[1400px] mx-auto px-6 md:px-10 py-7 flex items-center justify-between">
      <Link href="/" className="font-display font-bold text-2xl tracking-tight">
        ASFALTO<span className="text-oxblood">°</span>
      </Link>
      <div className="flex items-center gap-9 text-sm font-medium text-steel">
        <Link href="/catalogo" className="hover:text-ink transition-colors">
          Catálogo
        </Link>
        <Link href="/catalogo?condicion=nueva" className="hover:text-ink transition-colors">
          Nuevas
        </Link>
        <Link href="/catalogo?condicion=seminueva" className="hover:text-ink transition-colors">
          Seminuevas
        </Link>
      </div>
    </nav>
  );
}
