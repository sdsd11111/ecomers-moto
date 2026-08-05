import pool, { initDb } from "./db";
import type { Venta, Lead, Conversacion } from "@/types";

export async function getVentas(): Promise<Venta[]> {
  try {
    await initDb();
    const [rows]: any = await pool.query("SELECT * FROM ventas ORDER BY fecha DESC");
    if (!rows || rows.length === 0) {
      return [];
    }
    return rows.map((r: any) => ({
      id: r.id,
      cliente: r.cliente,
      telefono: r.telefono,
      motoId: r.moto_id,
      motoNombre: r.moto_nombre,
      monto: Number(r.monto),
      origen: r.origen,
      estado: r.estado,
      fecha: r.fecha,
      asesor: r.asesor,
    }));
  } catch (e) {
    return [];
  }
}

export async function getLeads(): Promise<Lead[]> {
  try {
    await initDb();
    const [rows]: any = await pool.query("SELECT * FROM leads ORDER BY creado_en DESC");
    if (!rows || rows.length === 0) {
      return [];
    }
    return rows.map((r: any) => ({
      id: r.id,
      cliente: r.cliente,
      telefono: r.telefono,
      email: r.email,
      origen: r.origen,
      motoInteres: r.moto_interes,
      presupuesto: r.presupuesto ? Number(r.presupuesto) : undefined,
      contactado: Boolean(r.contactado),
      creadoEn: r.creado_en,
    }));
  } catch (e) {
    return [];
  }
}

export async function saveLead(lead: Partial<Lead>): Promise<void> {
  try {
    await initDb();
    const id = lead.id || `lead-${Date.now()}`;
    await pool.query(
      `INSERT INTO leads (id, cliente, telefono, email, origen, moto_interes, presupuesto, contactado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE cliente=VALUES(cliente), moto_interes=VALUES(moto_interes)`,
      [
        id,
        lead.cliente || "Cliente WhatsApp",
        lead.telefono || "",
        lead.email || null,
        lead.origen || "whatsapp",
        lead.motoInteres || "Consulta General",
        lead.presupuesto || null,
        lead.contactado ? 1 : 0,
      ]
    );
  } catch (e) {
    console.error("Error saving lead to MySQL:", e);
  }
}

export async function saveVenta(venta: Partial<Venta>): Promise<void> {
  try {
    await initDb();
    const id = venta.id || `venta-${Date.now()}`;
    await pool.query(
      `INSERT INTO ventas (id, cliente, telefono, moto_id, moto_nombre, monto, origen, estado, asesor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE estado=VALUES(estado)`,
      [
        id,
        venta.cliente || "Cliente WhatsApp",
        venta.telefono || "",
        venta.motoId || "",
        venta.motoNombre || "Motocicleta",
        venta.monto || 0,
        venta.origen || "whatsapp",
        venta.estado || "reservada",
        venta.asesor || "Asistente Virtual AI",
      ]
    );
  } catch (e) {
    console.error("Error saving venta to MySQL:", e);
  }
}

export async function getConversaciones(): Promise<Conversacion[]> {
  try {
    await initDb();
    const [rows]: any = await pool.query("SELECT * FROM conversaciones ORDER BY actualizado_en DESC");
    if (!rows || rows.length === 0) {
      return [];
    }
    return rows.map((r: any) => ({
      id: r.id,
      cliente: r.cliente,
      telefono: r.telefono,
      canal: r.canal,
      estado: r.estado,
      ultimoMensaje: r.ultimo_mensaje,
      actualizadoEn: r.actualizado_en,
      motoInteres: r.moto_interes,
      mensajes: r.mensajes_json ? JSON.parse(r.mensajes_json) : [],
    }));
  } catch (e) {
    return [];
  }
}

export async function saveConversacion(conv: Partial<Conversacion>): Promise<void> {
  try {
    await initDb();
    const id = conv.id || `conv-${conv.telefono}`;

    // Recuperar mensajes existentes para acumular el hilo
    const [existing]: any = await pool.query("SELECT mensajes_json FROM conversaciones WHERE id = ?", [id]);
    let currentMensajes: any[] = [];
    if (existing && existing.length > 0 && existing[0].mensajes_json) {
      try {
        currentMensajes = JSON.parse(existing[0].mensajes_json);
      } catch (err) {
        currentMensajes = [];
      }
    }

    if (conv.mensajes && conv.mensajes.length > 0) {
      // Agregar nuevos mensajes evitando duplicados de id
      const existingIds = new Set(currentMensajes.map((m: any) => m.id));
      for (const newMsg of conv.mensajes) {
        if (!existingIds.has(newMsg.id)) {
          currentMensajes.push(newMsg);
        }
      }
    }

    const mensajesJson = JSON.stringify(currentMensajes);

    await pool.query(
      `INSERT INTO conversaciones (id, cliente, telefono, canal, estado, ultimo_mensaje, moto_interes, mensajes_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         cliente=VALUES(cliente),
         ultimo_mensaje=VALUES(ultimo_mensaje), 
         actualizado_en=CURRENT_TIMESTAMP, 
         mensajes_json=VALUES(mensajes_json)`,
      [
        id,
        conv.cliente || "Cliente WhatsApp",
        conv.telefono || "",
        conv.canal || "whatsapp",
        conv.estado || "activa",
        conv.ultimoMensaje || "",
        conv.motoInteres || null,
        mensajesJson,
      ]
    );
  } catch (e) {
    console.error("Error saving conversacion to MySQL:", e);
  }
}

export interface UnidadResumen {
  id: string;
  nombre: string;
  marca: string;
  condicion: string;
  anio: number;
  km: number;
  color: string;
  chasis: string;
  motorSerial: string;
  estado: string;
}

export async function getUnidadesResumen(): Promise<UnidadResumen[]> {
  try {
    await initDb();
    const [rows]: any = await pool.query(`
      SELECT 
        u.id, u.condicion, u.anio, u.km, u.color, u.chasis, u.motor_serial, u.estado,
        m.nombre, m.marca
      FROM unidades_inventario u
      JOIN modelos_moto m ON u.modelo_id = m.id
      ORDER BY u.estado ASC, m.nombre ASC
    `);
    if (!rows || rows.length === 0) return [];
    return rows.map((r: any) => ({
      id: r.id,
      nombre: r.nombre,
      marca: r.marca,
      condicion: r.condicion,
      anio: r.anio,
      km: r.km,
      color: r.color,
      chasis: r.chasis || "",
      motorSerial: r.motor_serial || "",
      estado: r.estado,
    }));
  } catch (e) {
    console.error("Error fetching unidades resumen:", e);
    return [];
  }
}
