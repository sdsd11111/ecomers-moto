// ============================================================
// Dominio: Catálogo de motos
// ============================================================

export type Condicion = "nueva" | "seminueva";

export type Categoria =
  | "naked"
  | "adventure"
  | "sport"
  | "urbana"
  | "cruiser"
  | "touring"
  | "scooter";

export interface Moto {
  id: string;
  slug: string;
  nombre: string;
  marca: string;
  categoria: Categoria;
  condicion: Condicion;
  precio: number;
  cilindrada: number; // cc
  potencia: number; // hp
  peso: number; // kg
  anio: number;
  color: string;
  km: number; // 0 si es nueva
  stock: number;
  destacada: boolean;
  imagenPrincipal: string;
  imagenes: string[];
  descripcion: string;
  specs: Record<string, string>;
  financiamiento: {
    disponible: boolean;
    cuotaInicialPct: number;
    mesesMax: number;
  };
}

export interface FiltrosCatalogo {
  condicion?: Condicion | "todas";
  categoria?: Categoria | "todas";
  marca?: string | "todas";
  precioMin?: number;
  precioMax?: number;
  orden?: "relevancia" | "precio-asc" | "precio-desc" | "recientes";
  q?: string;
}

// ============================================================
// Dominio: Admin — ventas, leads, conversaciones
// ============================================================

export type OrigenVenta = "whatsapp" | "web-chat" | "showroom" | "web-catalogo";
export type EstadoVenta = "lead-nuevo" | "cotizacion" | "test-drive" | "vendida" | "perdida";

export interface Venta {
  id: string;
  cliente: string;
  telefono: string;
  motoId: string;
  motoNombre: string;
  monto: number;
  origen: OrigenVenta;
  estado: EstadoVenta;
  fecha: string; // ISO
  asesor: string;
}

export type CanalConversacion = "whatsapp" | "web";

export interface MensajeChat {
  id: string;
  emisor: "bot" | "cliente" | "asesor";
  texto: string;
  hora: string; // ISO
}

export interface Conversacion {
  id: string;
  cliente: string;
  telefono: string;
  canal: CanalConversacion;
  estado: "activa" | "esperando-asesor" | "cerrada";
  ultimoMensaje: string;
  actualizadoEn: string; // ISO
  motoInteres?: string;
  mensajes: MensajeChat[];
}

export interface Lead {
  id: string;
  cliente: string;
  telefono: string;
  email?: string;
  origen: OrigenVenta;
  motoInteres: string;
  presupuesto?: number;
  contactado: boolean;
  creadoEn: string; // ISO
}

export interface KpiResumen {
  ventasMes: number;
  ventasMesDeltaPct: number;
  unidadesVendidas: number;
  unidadesVendidasDelta: number;
  leadsNuevos: number;
  leadsSinContactar: number;
  stockActivo: number;
  stockBajoMinimo: number;
}
