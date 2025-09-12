-- Tabela Clientes (se for gerenciar clientes)
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    contato VARCHAR(255),
    email VARCHAR(255) UNIQUE
);

-- Tabela Obras
CREATE TABLE IF NOT EXISTS obras (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    endereco VARCHAR(255),
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE
);

-- Tabela Caminhao
CREATE TABLE IF NOT EXISTS caminhoes (
    id SERIAL PRIMARY KEY,
    numero_nota_fiscal VARCHAR(255) UNIQUE NOT NULL,
    data_chegada DATE NOT NULL,
    obra_id INTEGER REFERENCES obras(id) ON DELETE CASCADE,
    volume_m3 DECIMAL(10, 2),
    slump_test_cm DECIMAL(10, 2),
    anomalias_caminhao TEXT,
    fck_esperado_mpa DECIMAL(10, 2) 
);

-- Tabela Amostra
CREATE TABLE IF NOT EXISTS amostras (
    id SERIAL PRIMARY KEY,
    numero_amostra VARCHAR(255) UNIQUE NOT NULL,
    caminhao_id INTEGER REFERENCES caminhoes(id) ON DELETE CASCADE,
    data_moldagem DATE NOT NULL,
    peca_concretada VARCHAR(255),
    pavimento VARCHAR(255),
    anomalias_amostra TEXT,
    data_descarte DATE
);

-- Tabela ResultadoEnsaio
CREATE TABLE IF NOT EXISTS resultados_ensaios (
    id SERIAL PRIMARY KEY,
    amostra_id INTEGER REFERENCES amostras(id) ON DELETE CASCADE,
    idade_dias INTEGER NOT NULL,
    resultado_mpa DECIMAL(10, 2) NOT NULL,
    tipo_ruptura VARCHAR(50), -- Compressao, Flexao, etc.
    data_ensaio DATE DEFAULT CURRENT_DATE
);