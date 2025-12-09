import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Se existir DATABASE_URL (Render), use ela
// Se não existir, usa as variáveis locais separadas
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "laboratorio_concreto",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "2450",
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

pool.on("connect", () => {
  console.log("✅ Conectado ao PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Erro inesperado no pool do PostgreSQL:", err);
  process.exit(-1);
});

export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    console.log("✅ Teste de conexão bem-sucedido:", result.rows[0].now);
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error.message);
    return false;
  }
}

export default pool;
