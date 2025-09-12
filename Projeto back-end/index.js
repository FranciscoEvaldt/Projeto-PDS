// index.js
require('dotenv').config(); // Carrega as variáveis de ambiente do .env

const express = require('express');
const { Pool } = require('pg'); // Importa o Pool do pg

const app = express();
const PORT = process.env.SERVER_PORT || 3000; // Define a porta do servidor

// Configuração do pool de conexão com o PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Testar a conexão com o banco de dados
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Erro ao conectar ao banco de dados:', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release(); // Libera o cliente de volta para o pool
        if (err) {
            return console.error('Erro ao executar query de teste:', err.stack);
        }
        console.log('Conexão com PostgreSQL bem-sucedida! Hora atual:', result.rows[0].now);
    });
});

// Middleware para parsear JSON do corpo das requisições
app.use(express.json());

// --- Rotas da API (seus endpoints virão aqui) ---

// Exemplo de rota de teste
app.get('/', (req, res) => {
    res.send('API do Laboratório de Concreto funcionando!');
});

// --- Iniciar o Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});