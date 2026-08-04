import pool, { initDb } from "./db";
import { ventas as initialVentas, leads as initialLeads, conversaciones as initialConversaciones } from "@/data/motos";
import type { Venta, Lead, Conversacion } from "@/types";

export async function getVentas(): Promise<Venta[]> {
  try {
    await initDb();
    const [rows]: any = await pool.query("SELECT * FROM ventas ORDER BY fecha DESC");
    if (!rows || rows.length === 0) {
      return initialVentas;
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
    return initialVentas;
  }
}

export async function getLeads(): Promise<Lead[]> {
  try {
    await initDb();
    const [rows]: any = await pool.query("SELECT * FROM leads ORDER BY creado_en DESC");
    if (!rows || rows.length === 0) {
      return initialLeads;
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
    return initialLeads;
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

export async function getConversaciones(): Promise<Conversacion[]> {
  try {
    await initDb();
    const [rows]: any = await pool.query("SELECT * FROM conversaciones ORDER BY actualizado_en DESC");
    if (!rows || rows.length === 0) {
      return initialConversaciones;
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
    return initialConversaciones;
  }
}

export async function saveConversacion(conv: Partial<Conversacion>): Promise<void> {
  try {
    await initDb();
    const id = conv.id || `conv-${conv.telefono}`;
    const mensajesJson = JSON.stringify(conv.mensajes || []);
    await pool.query(
      `INSERT INTO conversaciones (id, cliente, telefono, canal, estado, ultimo_mensaje, moto_interes, mensajes_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
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
