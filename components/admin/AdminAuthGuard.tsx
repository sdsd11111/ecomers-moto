"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = sessionStorage.getItem("asfalto_admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "Motos" && password === "Contraseña123.") {
      sessionStorage.setItem("asfalto_admin_auth", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("asfalto_admin_auth");
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center font-mono text-xs text-steel-light">
        Cargando acceso...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0e0e10] text-ivory flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#161619] border border-white/10 p-8 md:p-10 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="font-display font-black text-3xl uppercase tracking-wider text-ivory">
              ASFALTO<span className="text-oxblood">°</span> ADMIN
            </h1>
            <p className="font-mono text-xs text-steel-light mt-2 uppercase tracking-wider">
              Acceso a panel administrativo
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {error && (
              <div className="bg-oxblood/20 border border-oxblood text-ivory px-4 py-2.5 font-mono text-xs text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-steel-light mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
                className="w-full bg-[#202024] border border-white/10 px-4 py-3 text-sm text-ivory placeholder:text-white/30 focus:border-amber focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-steel-light mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-[#202024] border border-white/10 px-4 py-3 text-sm text-ivory placeholder:text-white/30 focus:border-amber focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full bg-oxblood text-ivory py-3.5 font-mono text-xs font-semibold uppercase tracking-wider hover:bg-oxblood/80 transition-colors cursor-pointer"
            >
              Iniciar Sesión →
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101012] text-ivory flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <div className="px-6 md:px-8 py-3.5 border-b border-white/10 flex items-center justify-between font-mono text-[11px] text-steel-light">
          <span>asfalto.app{"/admin"}</span>
          <div className="flex items-center gap-4">
            <span>Sesión: Motos</span>
            <button
              onClick={handleLogout}
              className="text-oxblood hover:text-white transition-colors cursor-pointer underline uppercase text-[10px]"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
