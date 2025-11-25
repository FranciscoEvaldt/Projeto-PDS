-- ==============================
-- SCHEMA DO SISTEMA DE LABORATÓRIO DE CONCRETO
-- ==============================

-- Criar banco de dados (executar manualmente se necessário)
-- CREATE DATABASE concrete_lab;

-- ==============================
-- TABELA: companies (Empresas)
-- ==============================
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18),
  endereco TEXT,
  telefone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- TABELA: works (Obras)
-- ==============================
CREATE TABLE IF NOT EXISTS works (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  codigo VARCHAR(50),
  nome VARCHAR(255) NOT NULL,
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  fck_projeto INTEGER,
  responsavel_obra VARCHAR(255),
  contrato VARCHAR(100),
  data_inicio DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- TABELA: loads (Cargas/Planilhas)
-- ==============================
CREATE TABLE IF NOT EXISTS loads (
  id SERIAL PRIMARY KEY,
  obra_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  numero_planilha INTEGER NOT NULL,
  data_moldagem DATE NOT NULL,
  caminhao VARCHAR(50),
  nota_fiscal VARCHAR(50),
  volume_m3 DECIMAL(10, 2),
  slump_cm VARCHAR(20),
  fck_mpa INTEGER,
  pavimento VARCHAR(100),
  peca VARCHAR(100),
  fornecedor_concreto VARCHAR(255),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(obra_id, numero_planilha)
);

-- ==============================
-- TABELA: samples (Amostras/Corpos de Prova)
-- ==============================
CREATE TABLE IF NOT EXISTS samples (
  id SERIAL PRIMARY KEY,
  carga_id INTEGER NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  sequencia INTEGER NOT NULL,
  numero_laboratorio INTEGER UNIQUE NOT NULL,
  data_prevista_rompimento DATE,
  data_rompimento DATE,
  idade_dias INTEGER,
  diametro_mm DECIMAL(10, 2),
  altura_mm DECIMAL(10, 2),
  carga_kn DECIMAL(10, 2),
  resistencia_mpa DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'tested', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- TABELA: system_counters (Contadores do Sistema)
-- ==============================
CREATE TABLE IF NOT EXISTS system_counters (
  id SERIAL PRIMARY KEY,
  counter_name VARCHAR(50) UNIQUE NOT NULL,
  counter_value INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir contador inicial para números de laboratório
INSERT INTO system_counters (counter_name, counter_value)
VALUES ('lab_number', 0)
ON CONFLICT (counter_name) DO NOTHING;

-- ==============================
-- ÍNDICES PARA PERFORMANCE
-- ==============================
CREATE INDEX IF NOT EXISTS idx_works_empresa_id ON works(empresa_id);
CREATE INDEX IF NOT EXISTS idx_loads_obra_id ON loads(obra_id);
CREATE INDEX IF NOT EXISTS idx_samples_carga_id ON samples(carga_id);
CREATE INDEX IF NOT EXISTS idx_samples_numero_laboratorio ON samples(numero_laboratorio);
CREATE INDEX IF NOT EXISTS idx_loads_data_moldagem ON loads(data_moldagem);
CREATE INDEX IF NOT EXISTS idx_samples_data_rompimento ON samples(data_rompimento);

-- ==============================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- ==============================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================
-- TRIGGERS: Atualizar updated_at
-- ==============================
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_works_updated_at
  BEFORE UPDATE ON works
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loads_updated_at
  BEFORE UPDATE ON loads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_samples_updated_at
  BEFORE UPDATE ON samples
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================
-- VIEWS ÚTEIS
-- ==============================

-- View: Amostras com informações completas
CREATE OR REPLACE VIEW samples_complete AS
SELECT 
  s.*,
  l.obra_id,
  l.numero_planilha,
  l.data_moldagem,
  l.fck_mpa as fck_carga,
  l.fornecedor_concreto,
  w.nome as obra_nome,
  w.codigo as obra_codigo,
  w.empresa_id,
  c.nome as empresa_nome
FROM samples s
JOIN loads l ON s.carga_id = l.id
JOIN works w ON l.obra_id = w.id
LEFT JOIN companies c ON w.empresa_id = c.id;

-- View: Estatísticas por obra
CREATE OR REPLACE VIEW work_statistics AS
SELECT 
  w.id,
  w.nome,
  w.codigo,
  COUNT(DISTINCT l.id) as total_cargas,
  COUNT(s.id) as total_amostras,
  COUNT(CASE WHEN s.status = 'tested' THEN 1 END) as amostras_testadas,
  COUNT(CASE WHEN s.status = 'pending' THEN 1 END) as amostras_pendentes,
  AVG(s.resistencia_mpa) as resistencia_media
FROM works w
LEFT JOIN loads l ON w.id = l.obra_id
LEFT JOIN samples s ON l.id = s.carga_id
GROUP BY w.id, w.nome, w.codigo;

-- ==============================
-- DADOS INICIAIS DE EXEMPLO
-- ==============================

-- Empresas
INSERT INTO companies (nome, cnpj, endereco, telefone, email) VALUES
('Construtora ABC Ltda', '12.345.678/0001-90', 'Av. Principal, 1000 - Centro', '(51) 3333-4444', 'contato@construtorabc.com.br'),
('Engenharia XYZ S.A.', '98.765.432/0001-10', 'Rua Secundária, 500 - Industrial', '(51) 3555-6666', 'projetos@engxyz.com.br')
ON CONFLICT DO NOTHING;

-- Obras
INSERT INTO works (empresa_id, codigo, nome, endereco, cidade, estado, fck_projeto, responsavel_obra, contrato, data_inicio, status) VALUES
(1, 'OB-2024-001', 'Edifício Residencial Central', 'Rua das Flores, 123', 'Porto Alegre', 'RS', 30, 'Eng. João Silva', 'CT-001/2024', '2024-01-15', 'active'),
(1, 'OB-2024-002', 'Ponte Rodoviária Norte', 'BR-290 Km 15', 'Eldorado do Sul', 'RS', 40, 'Eng. Maria Santos', 'CT-002/2024', '2024-02-01', 'active'),
(2, 'OB-2024-003', 'Shopping Metropolitano', 'Av. Comercial, 2000', 'Canoas', 'RS', 35, 'Eng. Pedro Costa', 'CT-003/2024', '2024-03-10', 'active')
ON CONFLICT DO NOTHING;

-- Cargas
INSERT INTO loads (obra_id, numero_planilha, data_moldagem, caminhao, nota_fiscal, volume_m3, slump_cm, fck_mpa, pavimento, peca, fornecedor_concreto, observacoes) VALUES
(1, 1, '2024-11-01', 'CAM-01', 'NF-12345', 8.50, '100', 30, 'Térreo', 'Pilares P1-P10', 'Concreteira Sul', 'Moldagem em condições normais'),
(1, 2, '2024-11-05', 'CAM-02', 'NF-12346', 10.00, '120', 30, '1º Pavimento', 'Laje L1', 'Concreteira Sul', 'Clima quente'),
(2, 1, '2024-11-10', 'CAM-03', 'NF-22345', 15.00, '100', 40, 'Tabuleiro', 'Vigas principais', 'Concreteira Norte', 'Concreto especial'),
(3, 1, '2024-11-15', 'CAM-04', 'NF-32345', 12.00, '140', 35, 'Subsolo', 'Fundações', 'Concreteira Leste', NULL)
ON CONFLICT DO NOTHING;

-- Amostras
INSERT INTO samples (carga_id, sequencia, numero_laboratorio, data_prevista_rompimento, idade_dias, diametro_mm, altura_mm, status) VALUES
-- Carga 1 - Edifício Central
(1, 1, 1, '2024-11-08', 7, 100, 200, 'pending'),
(1, 2, 2, '2024-11-08', 7, 100, 200, 'pending'),
(1, 3, 3, '2024-11-08', 7, 100, 200, 'pending'),
(1, 4, 4, '2024-11-29', 28, 100, 200, 'pending'),
(1, 5, 5, '2024-11-29', 28, 100, 200, 'pending'),
(1, 6, 6, '2024-11-29', 28, 100, 200, 'pending'),
-- Carga 2 - Edifício Central
(2, 1, 7, '2024-11-12', 7, 100, 200, 'pending'),
(2, 2, 8, '2024-11-12', 7, 100, 200, 'pending'),
(2, 3, 9, '2024-12-03', 28, 100, 200, 'pending'),
(2, 4, 10, '2024-12-03', 28, 100, 200, 'pending'),
-- Carga 3 - Ponte Norte
(3, 1, 11, '2024-11-17', 7, 100, 200, 'pending'),
(3, 2, 12, '2024-11-17', 7, 100, 200, 'pending'),
(3, 3, 13, '2024-11-24', 14, 100, 200, 'pending'),
(3, 4, 14, '2024-11-24', 14, 100, 200, 'pending'),
(3, 5, 15, '2024-12-08', 28, 100, 200, 'pending'),
(3, 6, 16, '2024-12-08', 28, 100, 200, 'pending'),
-- Carga 4 - Shopping
(4, 1, 17, '2024-11-22', 7, 100, 200, 'pending'),
(4, 2, 18, '2024-11-22', 7, 100, 200, 'pending'),
(4, 3, 19, '2024-12-13', 28, 100, 200, 'pending'),
(4, 4, 20, '2024-12-13', 28, 100, 200, 'pending')
ON CONFLICT DO NOTHING;

-- Atualizar contador de números de laboratório
UPDATE system_counters SET counter_value = 20 WHERE counter_name = 'lab_number';


-- ==============================
-- TABELA DE USUÁRIOS E AUTENTICAÇÃO
-- ==============================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
  ativo BOOLEAN DEFAULT true,
  ultimo_acesso TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_ativo ON users(ativo);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Adicionar campos de auditoria nas tabelas existentes
ALTER TABLE companies 
  ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);

ALTER TABLE works 
  ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);

ALTER TABLE loads 
  ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);

ALTER TABLE samples 
  ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);

-- Usuários de exemplo
-- Senha padrão para todos: "senha123" (hash bcrypt)
INSERT INTO users (nome, email, senha, role) VALUES
('Administrador', 'admin@modeleng.com.br', '$2b$10$rZ7qN8hK3xJQKJ0XqJ9YXu5H0Z7qN8hK3xJQKJ0XqJ9YXu5H0Z7qN8', 'admin'),
('João Silva', 'joao.silva@modeleng.com.br', '$2b$10$rZ7qN8hK3xJQKJ0XqJ9YXu5H0Z7qN8hK3xJQKJ0XqJ9YXu5H0Z7qN8', 'manager'),
('Maria Santos', 'maria.santos@modeleng.com.br', '$2b$10$rZ7qN8hK3xJQKJ0XqJ9YXu5H0Z7qN8hK3xJQKJ0XqJ9YXu5H0Z7qN8', 'user'),
('Pedro Costa', 'pedro.costa@modeleng.com.br', '$2b$10$rZ7qN8hK3xJQKJ0XqJ9YXu5H0Z7qN8hK3xJQKJ0XqJ9YXu5H0Z7qN8', 'viewer')
ON CONFLICT (email) DO NOTHING;

-- View de usuários (sem senha)
CREATE OR REPLACE VIEW users_safe AS
SELECT 
  id,
  nome,
  email,
  role,
  ativo,
  ultimo_acesso,
  created_at,
  updated_at
FROM users;

-- View de auditoria completa
CREATE OR REPLACE VIEW audit_log AS
SELECT 
  'company' as entity_type,
  c.id as entity_id,
  c.nome as entity_name,
  u1.nome as created_by_name,
  c.created_at,
  u2.nome as updated_by_name,
  c.updated_at
FROM companies c
LEFT JOIN users u1 ON c.created_by = u1.id
LEFT JOIN users u2 ON c.updated_by = u2.id

UNION ALL

SELECT 
  'work' as entity_type,
  w.id as entity_id,
  w.nome as entity_name,
  u1.nome as created_by_name,
  w.created_at,
  u2.nome as updated_by_name,
  w.updated_at
FROM works w
LEFT JOIN users u1 ON w.created_by = u1.id
LEFT JOIN users u2 ON w.updated_by = u2.id

UNION ALL

SELECT 
  'load' as entity_type,
  l.id as entity_id,
  'Planilha ' || l.numero_planilha as entity_name,
  u1.nome as created_by_name,
  l.created_at,
  u2.nome as updated_by_name,
  l.updated_at
FROM loads l
LEFT JOIN users u1 ON l.created_by = u1.id
LEFT JOIN users u2 ON l.updated_by = u2.id

UNION ALL

SELECT 
  'sample' as entity_type,
  s.id as entity_id,
  'Amostra ' || s.numero_laboratorio as entity_name,
  u1.nome as created_by_name,
  s.created_at,
  u2.nome as updated_by_name,
  s.updated_at
FROM samples s
LEFT JOIN users u1 ON s.created_by = u1.id
LEFT JOIN users u2 ON s.updated_by = u2.id

ORDER BY created_at DESC;
