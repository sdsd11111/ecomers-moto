import mysql from "mysql2/promise";

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
      CREATE TABLE IF NOT EXISTS evolution_config (
        key_name VARCHAR(100) PRIMARY KEY,
        key_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    connection.release();
    initialized = true;
  } catch (error) {
    console.error("Error initializing MySQL database tables:", error);
  }
}

export default pool;
