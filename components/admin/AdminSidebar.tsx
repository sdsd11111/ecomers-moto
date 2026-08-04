"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Resumen", icon: "📊" },
  { href: "/admin/inventario", label: "Inventario", icon: "🏍️" },
  { href: "/admin/ventas", label: "Ventas", icon: "💰" },
  { href: "/admin/conversaciones", label: "Conversaciones", icon: "💬" },
  { href: "/admin/leads", label: "Leads", icon: "🎯" },
  { href: "/admin/whatsapp", label: "Conexión WhatsApp", icon: "📱" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 border-r border-white/10 py-6 hidden md:block">
      <div className="px-6 pb-6 mb-2 border-b border-white/10">
        <span className="font-display font-bold text-xl text-ivory">
          ASFALTO<span className="text-oxblood">°</span>
        </span>
        <div className="font-mono text-[10px] text-steel uppercase tracking-wider mt-1">
          Panel de control
        </div>
      </div>
      <nav className="flex flex-col">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2.5 border-l-2 transition-colors ${
                active
                  ? "text-ivory border-oxblood bg-white/[.03]"
                  : "text-steel-light border-transparent hover:text-ivory hover:bg-white/[.02]"
              }`}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
