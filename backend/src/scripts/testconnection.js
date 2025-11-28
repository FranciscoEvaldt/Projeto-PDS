import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  console.log('\n🔍 Testando conexão com PostgreSQL...\n');

  try {
    // Teste 1: Conectar ao banco
    console.log('📡 Tentando conectar...');
    const result = await pool.query('SELECT NOW(), version()');
    console.log('✅ Conexão estabelecida com sucesso!\n');

    console.log('📊 Informações do banco:');
    console.log(`   🕐 Data/hora do servidor: ${result.rows[0].now}`);
    console.log(`   🗄️  Versão: ${result.rows[0].version.split(',')[0]}\n`);

    // Teste 2: Verificar tabelas
    console.log('📋 Verificando tabelas...');
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const expectedTables = ['users', 'companies', 'works', 'loads', 'samples'];
    const existingTables = tables.rows.map((row) => row.table_name);

    console.log(`   📁 Tabelas encontradas: ${existingTables.length}`);
    expectedTables.forEach((table) => {
      if (existingTables.includes(table)) {
        console.log(`      ✅ ${table}`);
      } else {
        console.log(`      ❌ ${table} (não encontrada)`);
      }
    });

    // Teste 3: Contar registros
    console.log('\n📊 Contagem de registros:');
    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        const count = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`   ${table}: ${count.rows[0].count} registro(s)`);
      }
    }

    console.log('\n✅ Todos os testes passaram!\n');
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Possíveis soluções:');
      console.log('   1. Verifique se o PostgreSQL está rodando');
      console.log('   2. Confira a porta no arquivo .env (padrão: 5432)');
      console.log('   3. Verifique o host (padrão: localhost)');
    } else if (error.code === '3D000') {
      console.log('\n💡 O banco de dados não existe!');
      console.log(`   Execute no PostgreSQL: CREATE DATABASE ${process.env.DB_NAME};`);
    } else if (error.code === '28P01') {
      console.log('\n💡 Senha incorreta!');
      console.log('   Verifique DB_PASSWORD no arquivo .env');
    } else if (error.code === '42P01') {
      console.log('\n💡 Tabelas não foram criadas!');
      console.log('   Execute: npm run setup');
    }

    console.log('');
  } finally {
    await pool.end();
  }
};

testConnection();
