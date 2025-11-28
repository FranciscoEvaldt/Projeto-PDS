import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './src/config/database.js';
import routes from './src/routes/index.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============= MIDDLEWARES =============

// CORS - Permitir requisições do frontend
app.use(
  cors({
    origin: '*', // Em produção, especifique os domínios permitidos
    credentials: true,
  })
);

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============= ROTAS =============

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'Sistema de Gestão de Laboratório de Concreto',
    version: '1.0.0',
    description: 'Backend para gestão de corpos de prova e ensaios de concreto',
    organization: 'Model Engenharia',
    database: process.env.DB_NAME,
    timestamp: new Date().toISOString(),
  });
});

// Rotas da API
app.use('/api', routes);

// Rota 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// ============= TRATAMENTO DE ERROS =============

app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============= INICIAR SERVIDOR =============

// Testar conexão com banco antes de iniciar
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro ao conectar com PostgreSQL:', err);
    process.exit(1);
  }
  
  console.log('✅ Conexão com PostgreSQL estabelecida');
  
  // Iniciar servidor
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║  🏗️  Sistema de Gestão de Laboratório de Concreto  🏗️  ║
╚════════════════════════════════════════════════════════╝

🚀 Servidor rodando em: http://localhost:${PORT}
📊 Banco de dados: ${process.env.DB_NAME}
🌍 Ambiente: ${process.env.NODE_ENV || 'development'}

📚 Documentação da API:
   → GET  /                     - Informações do sistema
   → GET  /api/health           - Health check
   → POST /api/auth/login       - Login
   → POST /api/auth/register    - Registro
   → GET  /api/companies        - Listar empresas
   → GET  /api/works            - Listar obras
   → GET  /api/loads            - Listar cargas
   → GET  /api/samples          - Listar amostras

✅ Pronto para receber requisições!
    `);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await pool.end();
  process.exit(0);
});
