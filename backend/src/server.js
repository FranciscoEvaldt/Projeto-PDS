import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import pool from './database/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas
app.use('/api', routes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: '🏗️ API do Sistema de Gestão de Laboratório de Concreto',
    version: '1.0.0',
    endpoints: {
      companies: '/api/companies',
      works: '/api/works',
      loads: '/api/loads',
      samples: '/api/samples',
      health: '/api/health'
    },
    documentation: 'Veja README.md para mais informações'
  });
});

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Tratamento de erros gerais
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  🏗️  Sistema de Gestão de Laboratório de Concreto  🏗️  ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  
  // Testar conexão com banco
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Conexão com PostgreSQL estabelecida');
  } catch (error) {
    console.error('❌ Erro ao conectar com PostgreSQL:', error.message);
  }
  
  console.log('');
  console.log('📡 Endpoints disponíveis:');
  console.log(`   GET    /api/health`);
  console.log(`   GET    /api/companies`);
  console.log(`   GET    /api/works`);
  console.log(`   GET    /api/loads`);
  console.log(`   GET    /api/samples`);
  console.log('');
  console.log('💡 Pressione CTRL+C para parar o servidor');
  console.log('════════════════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 Recebido SIGTERM. Encerrando servidor...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Recebido SIGINT. Encerrando servidor...');
  await pool.end();
  process.exit(0);
});

export default app;
