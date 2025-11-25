import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  console.log('🚀 Iniciando migração do banco de dados...\n');
  
  try {
    // Ler o arquivo SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Executar o schema
    await pool.query(schema);
    
    console.log('✅ Migração concluída com sucesso!\n');
    console.log('📊 Tabelas criadas:');
    console.log('   - companies (Empresas)');
    console.log('   - works (Obras)');
    console.log('   - loads (Cargas/Planilhas)');
    console.log('   - samples (Amostras)');
    console.log('   - system_counters (Contadores)');
    console.log('\n📈 Views criadas:');
    console.log('   - samples_complete');
    console.log('   - work_statistics');
    console.log('\n✨ Dados de exemplo inseridos!');
    
    // Verificar dados inseridos
    const { rows: companies } = await pool.query('SELECT COUNT(*) FROM companies');
    const { rows: works } = await pool.query('SELECT COUNT(*) FROM works');
    const { rows: loads } = await pool.query('SELECT COUNT(*) FROM loads');
    const { rows: samples } = await pool.query('SELECT COUNT(*) FROM samples');
    
    console.log('\n📦 Registros criados:');
    console.log(`   - ${companies[0].count} empresas`);
    console.log(`   - ${works[0].count} obras`);
    console.log(`   - ${loads[0].count} cargas`);
    console.log(`   - ${samples[0].count} amostras`);
    
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n👋 Conexão encerrada.');
  }
}

migrate();
