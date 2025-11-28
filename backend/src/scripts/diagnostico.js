import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';

dotenv.config();

console.log(`
╔════════════════════════════════════════════════════════╗
║          🔍 DIAGNÓSTICO COMPLETO DO BACKEND          ║
╚════════════════════════════════════════════════════════╝
`);

// ===== TESTE 1: Verificar arquivos =====
console.log('📁 Teste 1: Verificando arquivos...\n');

const files = [
  '.env',
  'server.js',
  'package.json',
  'config/database.js',
  'routes/index.js',
];

files.forEach(file => {
  if (existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} (não encontrado)`);
  }
});

// ===== TESTE 2: Verificar .env =====
console.log('\n⚙️ Teste 2: Verificando configurações .env...\n');

if (!existsSync('.env')) {
  console.log('   ❌ Arquivo .env não existe!');
  console.log('   💡 Execute: copy .env.example .env');
  console.log('   💡 Depois edite o .env e adicione sua senha');
  process.exit(1);
}

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

console.log('   DB_HOST:', config.host || '❌ NÃO DEFINIDO');
console.log('   DB_PORT:', config.port || '❌ NÃO DEFINIDO');
console.log('   DB_NAME:', config.database || '❌ NÃO DEFINIDO');
console.log('   DB_USER:', config.user || '❌ NÃO DEFINIDO');
console.log('   DB_PASSWORD:', config.password ? '✅ ***' : '❌ NÃO DEFINIDO');
console.log('   PORT:', process.env.PORT || '3001 (padrão)');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ ***' : '⚠️ NÃO DEFINIDO');

if (!config.password) {
  console.log('\n   ❌ SENHA DO POSTGRESQL NÃO ESTÁ CONFIGURADA!');
  console.log('   💡 Edite o arquivo .env e adicione:');
  console.log('      DB_PASSWORD=sua_senha_aqui');
  process.exit(1);
}

// ===== TESTE 3: Conectar ao PostgreSQL =====
console.log('\n🔌 Teste 3: Conectando ao PostgreSQL...\n');

const pool = new Pool(config);

try {
  const result = await pool.query('SELECT NOW(), version()');
  console.log('   ✅ Conexão estabelecida com sucesso!');
  console.log('   🕐 Data/hora:', result.rows[0].now);
  console.log('   📦 Versão:', result.rows[0].version.split(',')[0]);
} catch (error) {
  console.log('   ❌ Erro ao conectar:', error.message);
  console.log('   📋 Código do erro:', error.code);
  
  if (error.code === 'ECONNREFUSED') {
    console.log('\n   💡 PostgreSQL não está rodando!');
    console.log('      Windows: Serviços → PostgreSQL → Iniciar');
    console.log('      Mac: brew services start postgresql');
    console.log('      Linux: sudo service postgresql start');
  } else if (error.code === '3D000') {
    console.log('\n   💡 Banco de dados não existe!');
    console.log('      Execute no PostgreSQL:');
    console.log('      CREATE DATABASE ' + config.database + ';');
  } else if (error.code === '28P01') {
    console.log('\n   💡 Senha incorreta!');
    console.log('      Verifique DB_PASSWORD no arquivo .env');
  }
  
  await pool.end();
  process.exit(1);
}

// ===== TESTE 4: Verificar tabelas =====
console.log('\n📊 Teste 4: Verificando tabelas...\n');

try {
  const tables = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);

  const expectedTables = ['users', 'companies', 'works', 'loads', 'samples'];
  const existingTables = tables.rows.map(row => row.table_name);

  if (existingTables.length === 0) {
    console.log('   ❌ Nenhuma tabela encontrada!');
    console.log('   💡 Execute: npm run setup');
  } else {
    console.log(`   📁 Tabelas encontradas: ${existingTables.length}\n`);
    
    expectedTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`      ✅ ${table}`);
      } else {
        console.log(`      ❌ ${table} (não encontrada)`);
      }
    });

    const missingTables = expectedTables.filter(t => !existingTables.includes(t));
    if (missingTables.length > 0) {
      console.log('\n   ⚠️ Tabelas faltando:', missingTables.join(', '));
      console.log('   💡 Execute: npm run setup');
    }
  }
} catch (error) {
  console.log('   ❌ Erro ao verificar tabelas:', error.message);
}

// ===== TESTE 5: Contar registros =====
console.log('\n📈 Teste 5: Contando registros...\n');

const tablesToCheck = ['users', 'companies', 'works', 'loads', 'samples'];

for (const table of tablesToCheck) {
  try {
    const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
    const count = parseInt(result.rows[0].count);
    
    if (count > 0) {
      console.log(`   ✅ ${table}: ${count} registro(s)`);
    } else {
      console.log(`   ⚠️ ${table}: 0 registros (vazio)`);
    }
  } catch (error) {
    console.log(`   ❌ ${table}: erro (${error.message})`);
  }
}

// ===== TESTE 6: Testar endpoints (dados de exemplo) =====
console.log('\n🧪 Teste 6: Verificando dados de exemplo...\n');

try {
  const companies = await pool.query('SELECT * FROM companies LIMIT 1');
  if (companies.rows.length > 0) {
    console.log('   ✅ Empresa de exemplo encontrada:');
    console.log('      ID:', companies.rows[0].id);
    console.log('      Nome:', companies.rows[0].name);
    console.log('      CNPJ:', companies.rows[0].cnpj);
  } else {
    console.log('   ⚠️ Nenhuma empresa cadastrada');
    console.log('   💡 Execute: npm run setup');
  }
} catch (error) {
  console.log('   ❌ Erro ao buscar empresas:', error.message);
}

try {
  const works = await pool.query('SELECT * FROM works LIMIT 1');
  if (works.rows.length > 0) {
    console.log('\n   ✅ Obra de exemplo encontrada:');
    console.log('      ID:', works.rows[0].id);
    console.log('      Nome:', works.rows[0].name);
    console.log('      Código:', works.rows[0].code);
  } else {
    console.log('\n   ⚠️ Nenhuma obra cadastrada');
    console.log('   💡 Execute: npm run setup');
  }
} catch (error) {
  console.log('\n   ❌ Erro ao buscar obras:', error.message);
}

// ===== TESTE 7: Verificar rotas =====
console.log('\n🔌 Teste 7: Verificando arquivo de rotas...\n');

try {
  const routesContent = readFileSync('routes/index.js', 'utf-8');
  
  const endpoints = [
    { path: '/companies', found: routesContent.includes("router.get('/companies'") },
    { path: '/works', found: routesContent.includes("router.get('/works'") },
    { path: '/loads', found: routesContent.includes("router.get('/loads'") },
    { path: '/samples', found: routesContent.includes("router.get('/samples'") },
    { path: '/health', found: routesContent.includes("router.get('/health'") },
  ];

  endpoints.forEach(ep => {
    if (ep.found) {
      console.log(`   ✅ GET /api${ep.path}`);
    } else {
      console.log(`   ❌ GET /api${ep.path} (não encontrado)`);
    }
  });
} catch (error) {
  console.log('   ❌ Erro ao ler routes/index.js:', error.message);
}

// ===== RESUMO FINAL =====
console.log(`
╔════════════════════════════════════════════════════════╗
║                  📋 RESUMO FINAL                      ║
╚════════════════════════════════════════════════════════╝
`);

try {
  const tables = await pool.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  
  const companiesCount = await pool.query('SELECT COUNT(*) FROM companies');
  const worksCount = await pool.query('SELECT COUNT(*) FROM works');

  const allTablesExist = tables.rows.length >= 5;
  const hasData = parseInt(companiesCount.rows[0].count) > 0;

  if (allTablesExist && hasData) {
    console.log('✅ TUDO OK! Backend está pronto para usar!\n');
    console.log('📋 Próximos passos:');
    console.log('   1. Execute: npm start');
    console.log('   2. Acesse: http://localhost:' + (process.env.PORT || '3001'));
    console.log('   3. Teste: http://localhost:' + (process.env.PORT || '3001') + '/api/companies');
  } else if (allTablesExist && !hasData) {
    console.log('⚠️ Tabelas existem, mas sem dados de exemplo\n');
    console.log('💡 Execute: npm run setup');
  } else {
    console.log('❌ Há problemas a serem resolvidos\n');
    console.log('💡 Execute: npm run setup');
  }
} catch (error) {
  console.log('❌ Há problemas a serem resolvidos\n');
  console.log('💡 Execute: npm run setup');
}

await pool.end();
console.log('\n✅ Diagnóstico completo!\n');
