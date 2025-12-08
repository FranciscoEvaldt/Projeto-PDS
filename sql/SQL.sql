SELECT 'Schema criado com sucesso!' as mensagem,
       COUNT(*) as total_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';