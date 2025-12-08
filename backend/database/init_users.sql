-- Script para inicializar a tabela de usuários
-- Execute este script no seu banco PostgreSQL

-- Verificar se o usuário admin já existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin') THEN
        INSERT INTO users (username, password, name, role)
        VALUES ('admin', 'admin123', 'Administrador', 'admin');
        
        RAISE NOTICE 'Usuário admin criado com sucesso!';
    ELSE
        RAISE NOTICE 'Usuário admin já existe no banco de dados.';
    END IF;
END $$;

-- Verificar dados
SELECT id, username, name, role, created_at FROM users;
