export default function Footer() {
  return (
    <footer className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 flex flex-col md:flex-row justify-between gap-4 font-mono text-[11px] text-steel border-t border-steel-light uppercase tracking-wider">
      <span>Asfalto° — Motos nuevas y seminuevas</span>
      <span>
        Diseñado por{" "}
        <a
          href="https://www.cesarreyesjaramillo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-oxblood underline transition-colors"
        >
          Cesar Reyes
        </a>{" "}
        | Asfalto Motos
      </span>
    </footer>
  );
}
