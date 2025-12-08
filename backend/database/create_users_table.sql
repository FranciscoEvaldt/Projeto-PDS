-- ============================================
-- CRIAÇÃO DA TABELA USERS
-- Sistema de Gestão de Laboratório de Concreto
-- ============================================

-- Remover tabela se já existir (CUIDADO: apaga todos os dados!)
-- Comente a linha abaixo se quiser manter os dados existentes
-- DROP TABLE IF EXISTS users CASCADE;

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    -- Identificação
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_role CHECK (role IN ('admin', 'user')),
    CONSTRAINT chk_username_length CHECK (LENGTH(username) >= 3),
    CONSTRAINT chk_password_length CHECK (LENGTH(password) >= 6)
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário admin padrão
INSERT INTO users (username, password, name, role)
VALUES ('admin', 'admin123', 'Administrador do Sistema', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Comentários nas colunas
COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON COLUMN users.id IS 'ID único do usuário';
COMMENT ON COLUMN users.username IS 'Nome de usuário para login (único)';
COMMENT ON COLUMN users.password IS 'Senha do usuário (não criptografada)';
COMMENT ON COLUMN users.name IS 'Nome completo do usuário';
COMMENT ON COLUMN users.role IS 'Perfil do usuário (admin ou user)';
COMMENT ON COLUMN users.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN users.updated_at IS 'Data da última atualização';

-- Verificar dados inseridos
SELECT 
    id,
    username,
    name,
    role,
    created_at,
    updated_at
FROM users
ORDER BY created_at DESC;

-- Exibir mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tabela USERS criada com sucesso!';
    RAISE NOTICE '📊 Usuário admin padrão inserido';
    RAISE NOTICE '';
    RAISE NOTICE 'Credenciais padrão:';
    RAISE NOTICE '  Usuário: admin';
    RAISE NOTICE '  Senha: admin123';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANTE: Altere a senha padrão após o primeiro login!';
    RAISE NOTICE '';
END $$;
