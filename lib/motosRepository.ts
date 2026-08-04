import pool, { initDb } from "./db";
import { motos as initialMotos } from "@/data/motos";
import type { Moto } from "@/types";

export async function getMotos(): Promise<Moto[]> {
  try {
    await initDb();
    const [rows]: any = await pool.query("SELECT * FROM motos ORDER BY created_at DESC");
    if (!rows || rows.length === 0) {
      return initialMotos;
    }
    return rows.map((r: any) => ({
      id: r.id,
      slug: r.slug,
      nombre: r.nombre,
      marca: r.marca,
      categoria: r.categoria,
      condicion: r.condicion,
      precio: Number(r.precio),
      cilindrada: r.cilindrada,
      potencia: r.potencia,
      peso: r.peso,
      anio: r.anio,
      color: r.color,
      km: r.km,
      stock: r.stock,
      destacada: Boolean(r.destacada),
      imagenPrincipal: r.imagen_principal || "/motos/default.png",
      imagenes: r.imagenes_json ? JSON.parse(r.imagenes_json) : [],
      descripcion: r.descripcion || "",
      specs: r.specs_json ? JSON.parse(r.specs_json) : {},
      financiamiento: r.financiamiento_json
        ? JSON.parse(r.financiamiento_json)
        : { disponible: true, cuotaInicialPct: 20, mesesMax: 36 },
    }));
  } catch (err) {
    console.warn("Using local dataset as MySQL fallback:", err);
    return initialMotos;
  }
}

export async function getMotoBySlug(slug: string): Promise<Moto | undefined> {
  const all = await getMotos();
  return all.find((m) => m.slug === slug);
}
