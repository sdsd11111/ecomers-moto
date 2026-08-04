// Genera data/motos.ts con ~55 motos mock realistas. Ejecutar con: node scripts/generate-motos.mjs
import fs from "fs";

const marcas = [
  { marca: "Duello", modelos: ["GT 1290", "Strada 900", "Corsa 600"], cat: ["sport", "naked", "sport"] },
  { marca: "Rasgo", modelos: ["650", "300", "125"], cat: ["naked", "urbana", "urbana"] },
  { marca: "Colossus", modelos: ["1000 ADV", "800 ADV", "500 ADV"], cat: ["adventure", "adventure", "adventure"] },
  { marca: "Vortex", modelos: ["R6", "R3", "R1"], cat: ["sport", "sport", "sport"] },
  { marca: "Errante", modelos: ["300", "150", "200"], cat: ["urbana", "urbana", "urbana"] },
  { marca: "Nortada", modelos: ["Cruiser 1200", "Cruiser 750"], cat: ["cruiser", "cruiser"] },
  { marca: "Talante", modelos: ["Touring GTX", "Touring 900"], cat: ["touring", "touring"] },
  { marca: "Mira", modelos: ["Scoot 160", "Scoot 125", "Scoot 200"], cat: ["scooter", "scooter", "scooter"] },
  { marca: "Ferrada", modelos: ["Naked 800", "Naked 400"], cat: ["naked", "naked"] },
  { marca: "Bravante", modelos: ["Adventure 700", "Adventure 350"], cat: ["adventure", "adventure"] },
];

const colores = ["Rojo Carbón", "Negro Mate", "Gris Grafito", "Azul Racing", "Blanco Perla", "Verde Bosque"];
const asesores = ["C. Vintimilla", "R. Ochoa", "M. Salinas"];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const specsPorCategoria = {
  sport: () => ({ "Refrigeración": "Líquida", "Frenos": "Doble disco ABS", "Transmisión": "6 velocidades" }),
  naked: () => ({ "Refrigeración": "Líquida", "Frenos": "Disco ABS", "Transmisión": "6 velocidades" }),
  adventure: () => ({ "Suspensión": "Invertida ajustable", "Frenos": "ABS multicanal", "Tanque": `${rand(15,23)}L` }),
  urbana: () => ({ "Arranque": "Eléctrico", "Frenos": "Disco/Tambor", "Tanque": `${rand(10,14)}L` }),
  cruiser: () => ({ "Estilo": "Cruiser clásico", "Frenos": "Disco doble", "Tanque": `${rand(14,20)}L` }),
  touring: () => ({ "Parabrisas": "Ajustable", "Maletas": "Incluidas", "Tanque": `${rand(20,26)}L` }),
  scooter: () => ({ "Transmisión": "Automática CVT", "Bajo asiento": `${rand(15,30)}L`, "Frenos": "CBS" }),
};

let motos = [];
let idCounter = 1;

marcas.forEach(({ marca, modelos, cat }) => {
  modelos.forEach((modelo, i) => {
    const categoria = cat[i];
    // 2-3 unidades por modelo (nueva + seminuevas variando km/año)
    const unidades = rand(2, 3);
    for (let u = 0; u < unidades; u++) {
      const esNueva = u === 0; // primera unidad de cada modelo es nueva
      const anioBase = esNueva ? 2026 : rand(2019, 2024);
      const ccBase = { sport: rand(300, 1300), naked: rand(300, 1000), adventure: rand(300, 1200), urbana: rand(125, 300), cruiser: rand(500, 1300), touring: rand(700, 1300), scooter: rand(125, 200) }[categoria];
      const precioBase = Math.round((ccBase * rand(11, 16) + rand(500, 3000)) / 10) * 10;
      const precio = esNueva ? precioBase : Math.round(precioBase * (rand(55, 80) / 100) / 10) * 10;
      const nombre = `${marca} ${modelo}`;
      const slug = `${marca}-${modelo}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + (u > 0 ? `-${u}` : "");
      const id = `moto-${String(idCounter).padStart(3, "0")}`;
      idCounter++;

      motos.push({
        id,
        slug,
        nombre,
        marca,
        categoria,
        condicion: esNueva ? "nueva" : "seminueva",
        precio,
        cilindrada: ccBase,
        potencia: Math.round(ccBase * (rand(9, 13) / 100)),
        peso: rand(120, 260),
        anio: anioBase,
        color: pick(colores),
        km: esNueva ? 0 : rand(1500, 22000),
        stock: esNueva ? rand(2, 8) : 1,
        destacada: Math.random() < 0.22,
        imagenPrincipal: `/motos/${slug}.jpg`,
        imagenes: [`/motos/${slug}.jpg`, `/motos/${slug}-2.jpg`, `/motos/${slug}-3.jpg`],
        descripcion: `${nombre} ${esNueva ? "0km, lista para entrega inmediata" : `seminueva, año ${anioBase}, único dueño`}. Categoría ${categoria}, pensada para quienes buscan ${categoria === "urbana" ? "movilidad diaria eficiente" : categoria === "sport" ? "máximo desempeño en carretera" : categoria === "adventure" ? "explorar sin límites" : "una experiencia de manejo superior"}.`,
        specs: {
          "Cilindrada": `${ccBase}cc`,
          "Potencia": `${Math.round(ccBase * (rand(9,13)/100))}HP`,
          "Peso": `${rand(120,260)}kg`,
          "Año": String(anioBase),
          ...specsPorCategoria[categoria](),
        },
        financiamiento: {
          disponible: true,
          cuotaInicialPct: esNueva ? 20 : 30,
          mesesMax: esNueva ? 48 : 36,
        },
      });
    }
  });
});

// Ventas mock
const estados = ["lead-nuevo", "cotizacion", "test-drive", "vendida", "perdida"];
const origenes = ["whatsapp", "web-chat", "showroom", "web-catalogo"];
const nombres = ["M. Jaramillo","D. Espinoza","A. Torres","P. Cabrera","L. Ramón","S. Cueva","J. Aguirre","F. Ortega","N. Rodas","K. Merino"];

let ventas = [];
for (let i = 0; i < 24; i++) {
  const moto = pick(motos);
  const fecha = new Date(2026, 6, rand(1, 31));
  ventas.push({
    id: `venta-${String(i+1).padStart(3,"0")}`,
    cliente: pick(nombres),
    telefono: `09${rand(10000000,99999999)}`,
    motoId: moto.id,
    motoNombre: moto.nombre,
    monto: moto.precio,
    origen: pick(origenes),
    estado: pick(estados),
    fecha: fecha.toISOString(),
    asesor: pick(asesores),
  });
}

// Leads mock
let leads = [];
for (let i = 0; i < 30; i++) {
  const moto = pick(motos);
  const fecha = new Date(2026, 6, rand(1, 31));
  leads.push({
    id: `lead-${String(i+1).padStart(3,"0")}`,
    cliente: pick(nombres),
    telefono: `09${rand(10000000,99999999)}`,
    origen: pick(origenes),
    motoInteres: moto.nombre,
    presupuesto: Math.round(moto.precio * (rand(85,120)/100)),
    contactado: Math.random() < 0.6,
    creadoEn: fecha.toISOString(),
  });
}

// Conversaciones mock
let conversaciones = [];
for (let i = 0; i < 15; i++) {
  const moto = pick(motos);
  const canal = pick(["whatsapp", "web"]);
  const fecha = new Date(2026, 6, rand(1, 31), rand(8,20), rand(0,59));
  conversaciones.push({
    id: `conv-${String(i+1).padStart(3,"0")}`,
    cliente: pick(nombres),
    telefono: `09${rand(10000000,99999999)}`,
    canal,
    estado: pick(["activa", "esperando-asesor", "cerrada"]),
    ultimoMensaje: `¿Tienen disponible la ${moto.nombre} en ${moto.color.toLowerCase()}?`,
    actualizadoEn: fecha.toISOString(),
    motoInteres: moto.nombre,
    mensajes: [
      { id: "m1", emisor: "cliente", texto: `Hola, ¿tienen la ${moto.nombre}?`, hora: fecha.toISOString() },
      { id: "m2", emisor: "bot", texto: `Sí, tenemos ${moto.stock} unidades disponibles desde $${moto.precio}.`, hora: fecha.toISOString() },
      { id: "m3", emisor: "cliente", texto: "¿Aceptan financiamiento?", hora: fecha.toISOString() },
      { id: "m4", emisor: "bot", texto: `Claro, desde ${moto.financiamiento.cuotaInicialPct}% de inicial hasta ${moto.financiamiento.mesesMax} meses.`, hora: fecha.toISOString() },
    ],
  });
}

const out = `// ⚠️ Archivo generado por scripts/generate-motos.mjs — no editar a mano.
import type { Moto, Venta, Lead, Conversacion } from "@/types";

export const motos: Moto[] = ${JSON.stringify(motos, null, 2)};

export const ventas: Venta[] = ${JSON.stringify(ventas, null, 2)};

export const leads: Lead[] = ${JSON.stringify(leads, null, 2)};

export const conversaciones: Conversacion[] = ${JSON.stringify(conversaciones, null, 2)};
`;

fs.writeFileSync(new URL("../data/motos.ts", import.meta.url), out);
console.log(`Generadas ${motos.length} motos, ${ventas.length} ventas, ${leads.length} leads, ${conversaciones.length} conversaciones.`);
