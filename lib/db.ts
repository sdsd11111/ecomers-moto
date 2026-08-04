import mysql from "mysql2/promise";
import { motos as initialMotos } from "@/data/motos";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "mysql.us.stackcp.com",
  port: Number(process.env.DB_PORT) || 44737,
  user: process.env.DB_USER || "ecomers-ejem-35303934a2e4",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ecomers-ejem-35303934a2e4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

let initialized = false;

export async function initDb() {
  if (initialized) return;
  try {
    const connection = await pool.getConnection();

    // 1. Modelos Genericos (Ficha técnica)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS modelos_moto (
        id VARCHAR(50) PRIMARY KEY,
        slug VARCHAR(100) NOT NULL UNIQUE,
        nombre VARCHAR(100) NOT NULL,
        marca VARCHAR(50) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        precio_base DECIMAL(10,2) NOT NULL,
        cilindrada INT NOT NULL,
        potencia INT NOT NULL,
        peso INT NOT NULL,
        imagen_principal VARCHAR(255),
        imagenes_json TEXT,
        descripcion TEXT,
        specs_json TEXT,
        financiamiento_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Unidades Físicas Reales de Inventario (Cada fila = 1 moto física con chasis/serial)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS unidades_inventario (
        id VARCHAR(50) PRIMARY KEY,
        modelo_id VARCHAR(50) NOT NULL,
        condicion VARCHAR(20) NOT NULL DEFAULT 'nueva',
        anio INT NOT NULL,
        km INT DEFAULT 0,
        color VARCHAR(50) NOT NULL,
        chasis VARCHAR(100) UNIQUE,
        motor_serial VARCHAR(100) UNIQUE,
        estado ENUM('disponible', 'reservada', 'vendida', 'en_transito') DEFAULT 'disponible',
        reservado_por_conversacion_id VARCHAR(100),
        reservado_hasta DATETIME,
        version INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_modelo_estado (modelo_id, estado)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Clientes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id VARCHAR(50) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        telefono VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100),
        cedula VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Reservas temporales (24 Horas)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reservas (
        id VARCHAR(50) PRIMARY KEY,
        unidad_id VARCHAR(50) NOT NULL,
        cliente_id VARCHAR(50) NOT NULL,
        conversacion_id VARCHAR(100),
        monto_sena DECIMAL(10,2) DEFAULT 0.00,
        estado ENUM('activa', 'expirada', 'confirmada', 'cancelada') DEFAULT 'activa',
        creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expira_en DATETIME NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Mensajes con soporte de Tool Calling JSON
    await connection.query(`
      CREATE TABLE IF NOT EXISTS mensajes (
        id VARCHAR(50) PRIMARY KEY,
        conversacion_id VARCHAR(100) NOT NULL,
        emisor ENUM('cliente', 'bot', 'asesor') NOT NULL,
        texto TEXT NOT NULL,
        tool_call_json TEXT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Tablas legacy
    await connection.query(`
      CREATE TABLE IF NOT EXISTS motos (
        id VARCHAR(50) PRIMARY KEY,
        slug VARCHAR(100) NOT NULL UNIQUE,
        nombre VARCHAR(100) NOT NULL,
        marca VARCHAR(50) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        condicion VARCHAR(20) NOT NULL,
        precio DECIMAL(10,2) NOT NULL,
        cilindrada INT NOT NULL,
        potencia INT NOT NULL,
        peso INT NOT NULL,
        anio INT NOT NULL,
        color VARCHAR(50) NOT NULL,
        km INT DEFAULT 0,
        stock INT DEFAULT 1,
        destacada TINYINT(1) DEFAULT 0,
        imagen_principal VARCHAR(255),
        imagenes_json TEXT,
        descripcion TEXT,
        specs_json TEXT,
        financiamiento_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(50) PRIMARY KEY,
        cliente VARCHAR(100) NOT NULL,
        telefono VARCHAR(50) NOT NULL,
        email VARCHAR(100),
        origen VARCHAR(50) NOT NULL,
        moto_interes VARCHAR(100),
        presupuesto DECIMAL(10,2),
        contactado TINYINT(1) DEFAULT 0,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ventas (
        id VARCHAR(50) PRIMARY KEY,
        cliente VARCHAR(100) NOT NULL,
        telefono VARCHAR(50) NOT NULL,
        moto_id VARCHAR(50),
        moto_nombre VARCHAR(100),
        monto DECIMAL(10,2) NOT NULL,
        origen VARCHAR(50) NOT NULL,
        estado VARCHAR(50) NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        asesor VARCHAR(100)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS conversaciones (
        id VARCHAR(50) PRIMARY KEY,
        cliente VARCHAR(100) NOT NULL,
        telefono VARCHAR(50) NOT NULL,
        canal VARCHAR(20) DEFAULT 'whatsapp',
        estado VARCHAR(20) DEFAULT 'activa',
        ultimo_mensaje TEXT,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        moto_interes VARCHAR(100),
        mensajes_json TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed inicial de Modelos y Unidades Físicas si están vacíos
    const [modelCount]: any = await connection.query("SELECT COUNT(*) as count FROM modelos_moto");
    if (modelCount[0].count === 0) {
      for (const m of initialMotos.slice(0, 15)) {
        await connection.query(
          `INSERT IGNORE INTO modelos_moto 
           (id, slug, nombre, marca, categoria, precio_base, cilindrada, potencia, peso, imagen_principal, imagenes_json, descripcion, specs_json, financiamiento_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            m.id,
            m.slug,
            m.nombre,
            m.marca,
            m.categoria,
            m.precio,
            m.cilindrada,
            m.potencia,
            m.peso,
            m.imagenPrincipal || "/motos/default.png",
            JSON.stringify(m.imagenes || []),
            m.descripcion || "",
            JSON.stringify(m.specs || {}),
            JSON.stringify(m.financiamiento || {}),
          ]
        );

        // Crear 2 a 3 unidades físicas únicas por cada modelo
        const qty = Math.max(1, m.stock || 2);
        for (let i = 1; i <= qty; i++) {
          const unitId = `unit-${m.id}-${i}`;
          const chasis = `CHS-${m.marca.substring(0, 3).toUpperCase()}-${m.id}-${1000 + i}`;
          const motorSerial = `MTR-${m.id}-${2000 + i}`;
          await connection.query(
            `INSERT IGNORE INTO unidades_inventario
             (id, modelo_id, condicion, anio, km, color, chasis, motor_serial, estado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'disponible')`,
            [unitId, m.id, m.condicion, m.anio, m.km, m.color, chasis, motorSerial]
          );
        }
      }
    }

    connection.release();
    initialized = true;
  } catch (error) {
    console.error("Error initializing MySQL database schema:", error);
  }
}

export default pool;
