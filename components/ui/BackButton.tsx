"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/catalogo");
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-2 bg-ink text-ivory hover:bg-oxblood px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer group shadow-sm ${className}`}
      aria-label="Volver a la página anterior"
    >
      <span className="text-sm group-hover:-translate-x-1 transition-transform">←</span>
      <span>Volver</span>
    </button>
  );
}
