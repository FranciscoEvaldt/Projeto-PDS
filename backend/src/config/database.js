import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Configuração da conexão com PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'laboratorio_concreto',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2450',
  max: 20, // Número máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Conexão com PostgreSQL estabelecida');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool de conexões:', err);
  process.exit(-1);
});

// Função auxiliar para queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executada', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Erro na query:', error);
    throw error;
  }
};

// Função para obter cliente (para transações)
export const getClient = () => pool.connect();

export default pool;
