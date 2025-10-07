CREATE TABLE empresa (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cnpj VARCHAR(20),
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(100)
);

CREATE TABLE obra (
    id SERIAL PRIMARY KEY,
    empresa_id INT NULL REFERENCES empresa(id) ON DELETE SET NULL,
    nome VARCHAR(100) NOT NULL,
    endereco TEXT,
    cidade VARCHAR(60),
    estado VARCHAR(2),
    fck_projeto NUMERIC(5,2),
    responsavel_obra VARCHAR(100),
    contrato VARCHAR(40),
    data_inicio DATE,
    data_fim DATE
);

CREATE TABLE carga (
    id SERIAL PRIMARY KEY,
    obra_id INT NOT NULL REFERENCES obra(id) ON DELETE CASCADE,
    data_moldagem DATE NOT NULL,
    caminhao VARCHAR(20),
    nota_fiscal VARCHAR(50),
    volume_m3 NUMERIC(6,2),
    slump_cm NUMERIC(5,2),
    fck_mpa NUMERIC(5,2),
    pavimento VARCHAR(50),
    peca VARCHAR(100),
    observacoes TEXT
);

CREATE TABLE amostra (
    id SERIAL PRIMARY KEY,
    carga_id INT NOT NULL REFERENCES carga(id) ON DELETE CASCADE,
    sequencia INT NOT NULL,
    data_prevista_rompimento DATE,
    data_rompimento DATE,
    idade_dias INT,
    diametro_mm NUMERIC(5,2),
    altura_mm NUMERIC(5,2),
    carga_kn NUMERIC(8,2),
    resistencia_mpa NUMERIC(5,2),
    status VARCHAR(20) DEFAULT 'Aguardando'
);

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    cargo VARCHAR(50),
    criado_em TIMESTAMP DEFAULT NOW()
);
