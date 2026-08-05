import pool, { initDb } from "./db";
import { getMotos } from "./motosRepository";

export async function liberarReservasExpiradas() {
  try {
    await initDb();
    const connection = await pool.getConnection();
    await connection.query(`
      UPDATE unidades_inventario
      SET estado = 'disponible', reservado_por_conversacion_id = NULL, reservado_hasta = NULL
      WHERE estado = 'reservada' AND reservado_hasta < NOW();
    `);
    await connection.query(`
      UPDATE reservas
      SET estado = 'expirada'
      WHERE estado = 'activa' AND expira_en < NOW();
    `);
    connection.release();
  } catch (error) {
    console.error("Error al liberar reservas expiradas:", error);
  }
}

export async function buscarUnidadesFisicas(params: {
  categoria?: string;
  precioMax?: number;
  condicion?: string;
  marca?: string;
}) {
  try {
    await initDb();
    await liberarReservasExpiradas();

    let query = `
      SELECT 
        u.id as unidad_id,
        u.condicion,
        u.anio,
        u.km,
        u.color,
        u.chasis,
        u.motor_serial,
        u.estado,
        m.id as modelo_id,
        m.nombre,
        m.marca,
        m.categoria,
        m.precio_base as precio,
        m.cilindrada,
        m.potencia,
        m.peso,
        m.imagen_principal
      FROM unidades_inventario u
      JOIN modelos_moto m ON u.modelo_id = m.id
      WHERE u.estado = 'disponible'
    `;

    const values: any[] = [];

    if (params.categoria && params.categoria !== "todas") {
      query += " AND LOWER(m.categoria) = LOWER(?)";
      values.push(params.categoria);
    }
    if (params.condicion && params.condicion !== "todas") {
      query += " AND LOWER(u.condicion) = LOWER(?)";
      values.push(params.condicion);
    }
    if (params.marca && params.marca !== "todas") {
      query += " AND LOWER(m.marca) = LOWER(?)";
      values.push(params.marca);
    }
    if (params.precioMax && params.precioMax > 0) {
      query += " AND m.precio_base <= ?";
      values.push(params.precioMax);
    }

    query += " ORDER BY m.precio_base ASC LIMIT 10";

    const [rows]: any = await pool.query(query, values);

    if (!rows || rows.length === 0) {
      // Fallback a motos locales si la tabla de unidades aún no tiene datos
      const local = await getMotos();
      return local
        .filter((m) => {
          if (params.categoria && params.categoria !== "todas" && m.categoria !== params.categoria) return false;
          if (params.condicion && params.condicion !== "todas" && m.condicion !== params.condicion) return false;
          if (params.precioMax && m.precio > params.precioMax) return false;
          return true;
        })
        .slice(0, 5)
        .map((m) => ({
          unidad_id: `unit-${m.id}-1`,
          modelo_id: m.id,
          nombre: m.nombre,
          marca: m.marca,
          categoria: m.categoria,
          condicion: m.condicion,
          precio: m.precio,
          cilindrada: m.cilindrada,
          potencia: m.potencia,
          color: m.color,
          anio: m.anio,
          km: m.km,
          estado: "disponible",
        }));
    }

    return rows.map((r: any) => ({
      unidad_id: r.unidad_id,
      modelo_id: r.modelo_id,
      nombre: r.nombre,
      marca: r.marca,
      categoria: r.categoria,
      condicion: r.condicion,
      precio: Number(r.precio),
      cilindrada: r.cilindrada,
      potencia: r.potencia,
      color: r.color,
      anio: r.anio,
      km: r.km,
      chasis: r.chasis,
      motorSerial: r.motor_serial,
      imagenPrincipal: r.imagen_principal || "/motos/default.png",
      estado: r.estado,
    }));
  } catch (error) {
    console.error("Error buscando unidades físicas:", error);
    return [];
  }
}

export async function obtenerFichaUnidad(unidadId: string) {
  try {
    await initDb();
    const [rows]: any = await pool.query(
      `
      SELECT 
        u.id as unidad_id,
        u.condicion,
        u.anio,
        u.km,
        u.color,
        u.chasis,
        u.motor_serial,
        u.estado,
        m.*
      FROM unidades_inventario u
      JOIN modelos_moto m ON u.modelo_id = m.id
      WHERE u.id = ?
    `,
      [unidadId]
    );

    if (rows && rows.length > 0) {
      const r = rows[0];
      return {
        unidadId: r.unidad_id,
        modeloId: r.id,
        nombre: r.nombre,
        marca: r.marca,
        categoria: r.categoria,
        condicion: r.condicion,
        precio: Number(r.precio_base),
        cilindrada: r.cilindrada,
        potencia: r.potencia,
        peso: r.peso,
        anio: r.anio,
        km: r.km,
        color: r.color,
        chasis: r.chasis,
        motorSerial: r.motor_serial,
        estado: r.estado,
        descripcion: r.descripcion,
        specs: r.specs_json ? JSON.parse(r.specs_json) : {},
        financiamiento: r.financiamiento_json
          ? JSON.parse(r.financiamiento_json)
          : { disponible: true, cuotaInicialPct: 20, mesesMax: 48 },
      };
    }
    return null;
  } catch (e) {
    console.error("Error obteniendo ficha de unidad:", e);
    return null;
  }
}

export async function crearReservaAtomica(
  unidadId: string,
  cliente: { nombre: string; telefono: string; email?: string },
  conversacionId: string = ""
) {
  const connection = await pool.getConnection();
  try {
    await initDb();
    await connection.beginTransaction();

    // 1. Lock atómico FOR UPDATE para asegurar que ninguna otra transacción reserve la misma moto al mismo tiempo
    const [rows]: any = await connection.query(
      "SELECT * FROM unidades_inventario WHERE id = ? AND estado = 'disponible' FOR UPDATE",
      [unidadId]
    );

    if (!rows || rows.length === 0) {
      await connection.rollback();
      connection.release();
      return {
        success: false,
        message: "La unidad física seleccionada ya no está disponible o ha sido reservada por otro cliente.",
      };
    }

    const unidad = rows[0];
    const clienteId = `cli-${cliente.telefono.replace(/\D/g, "")}`;
    const reservaId = `res-${Date.now()}`;

    // 2. Registrar o actualizar cliente
    await connection.query(
      `INSERT INTO clientes (id, nombre, telefono, email) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), email=COALESCE(VALUES(email), email)`,
      [clienteId, cliente.nombre || "Cliente WhatsApp", cliente.telefono, cliente.email || null]
    );

    // 3. Expiración a 24 Horas
    const expiraEn = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");

    // 4. Actualizar estado de la unidad física a 'reservada'
    await connection.query(
      `UPDATE unidades_inventario 
       SET estado = 'reservada', reservado_por_conversacion_id = ?, reservado_hasta = ?, version = version + 1
       WHERE id = ?`,
      [conversacionId || `conv-${cliente.telefono}`, expiraEn, unidadId]
    );

    // 5. Insertar registro formal de reserva
    await connection.query(
      `INSERT INTO reservas (id, unidad_id, cliente_id, conversacion_id, estado, expira_en)
       VALUES (?, ?, ?, ?, 'activa', ?)`,
      [reservaId, unidadId, clienteId, conversacionId, expiraEn]
    );

    // 6. Consultar datos del modelo para registrar la venta en pipeline
    const [modelRows]: any = await connection.query(
      `SELECT m.id, m.nombre, m.precio_base FROM modelos_moto m WHERE m.id = ?`,
      [unidad.modelo_id]
    );
    const motoNombre = modelRows && modelRows.length > 0 ? modelRows[0].nombre : `Unidad ${unidadId}`;
    const monto = modelRows && modelRows.length > 0 ? Number(modelRows[0].precio_base) : 5000;

    await connection.query(
      `INSERT INTO ventas (id, cliente, telefono, moto_id, moto_nombre, monto, origen, estado, asesor)
       VALUES (?, ?, ?, ?, ?, ?, 'whatsapp', 'reservada', 'Asistente Virtual AI')
       ON DUPLICATE KEY UPDATE estado=VALUES(estado), monto=VALUES(monto)`,
      [`venta-${cliente.telefono}`, cliente.nombre || "Cliente WhatsApp", cliente.telefono, unidad.modelo_id, motoNombre, monto]
    );

    // 7. Insertar Lead en pipeline
    await connection.query(
      `INSERT INTO leads (id, cliente, telefono, origen, moto_interes, contactado)
       VALUES (?, ?, ?, 'whatsapp', ?, 1)
       ON DUPLICATE KEY UPDATE cliente=VALUES(cliente), moto_interes=VALUES(moto_interes), contactado=1`,
      [`lead-${cliente.telefono}`, cliente.nombre || "Cliente WhatsApp", cliente.telefono, `Reserva ${motoNombre} (ID: ${unidadId})`]
    );

    await connection.commit();
    connection.release();

    return {
      success: true,
      reservaId,
      unidadId,
      expiraEn,
      mensaje: `¡Reserva creada exitosamente por 24 horas! La unidad ha quedado apartada hasta el ${expiraEn}. Un asesor comercial se pondrá en contacto para afinar detalles de pago o financiamiento.`,
    };
  } catch (error: any) {
    await connection.rollback();
    connection.release();
    console.error("Error en reserva atómica:", error);
    return { success: false, message: "Error interno al procesar la reserva: " + error.message };
  }
}

export function calcularFinanciamiento(precio: number, cuotaInicialPct: number = 20, meses: number = 36) {
  const cuotaInicial = Math.round(precio * (cuotaInicialPct / 100));
  const montoFinanciar = precio - cuotaInicial;
  const tasaMensual = 0.012; // 1.2% estimado mensual
  const cuotaMensual = Math.round(
    (montoFinanciar * (tasaMensual * Math.pow(1 + tasaMensual, meses))) / (Math.pow(1 + tasaMensual, meses) - 1)
  );

  return {
    precioTotal: precio,
    cuotaInicialPct,
    cuotaInicial,
    montoFinanciar,
    meses,
    cuotaMensualAprox: cuotaMensual,
  };
}
