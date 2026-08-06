"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import type { Moto } from "@/types";

export default function AddToCartButton({ moto }: { moto: Moto }) {
  const { addItem, setIsCartOpen } = useCart();

  const handleAdd = () => {
    addItem({
      id: moto.id || moto.slug,
      nombre: moto.nombre,
      precio: moto.precio,
      imagen: moto.imagenPrincipal || "/motos/default.png",
      condicion: moto.condicion,
      categoria: moto.categoria,
    });
    setIsCartOpen(true);
  };

  return (
    <button
      onClick={handleAdd}
      className="bg-oxblood hover:bg-oxblood/90 text-white px-7 py-4 text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
    >
      <span>🛒 Agregar al Carrito</span>
    </button>
  );
}
