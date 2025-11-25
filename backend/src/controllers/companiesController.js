import pool from '../database/db.js';

// GET /api/companies - Listar todas as empresas
export async function getAllCompanies(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM companies ORDER BY nome ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    res.status(500).json({ error: 'Erro ao buscar empresas' });
  }
}

// GET /api/companies/:id - Buscar empresa por ID
export async function getCompanyById(req, res) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM companies WHERE id = $1',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro ao buscar empresa' });
  }
}

// POST /api/companies - Criar nova empresa
export async function createCompany(req, res) {
  try {
    const { nome, cnpj, endereco, telefone, email } = req.body;
    
    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    
    const { rows } = await pool.query(
      `INSERT INTO companies (nome, cnpj, endereco, telefone, email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nome, cnpj, endereco, telefone, email]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    res.status(500).json({ error: 'Erro ao criar empresa' });
  }
}

// PUT /api/companies/:id - Atualizar empresa
export async function updateCompany(req, res) {
  try {
    const { id } = req.params;
    const { nome, cnpj, endereco, telefone, email } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE companies
       SET nome = COALESCE($1, nome),
           cnpj = COALESCE($2, cnpj),
           endereco = COALESCE($3, endereco),
           telefone = COALESCE($4, telefone),
           email = COALESCE($5, email)
       WHERE id = $6
       RETURNING *`,
      [nome, cnpj, endereco, telefone, email, id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
}

// DELETE /api/companies/:id - Excluir empresa
export async function deleteCompany(req, res) {
  try {
    const { id } = req.params;
    
    const { rowCount } = await pool.query(
      'DELETE FROM companies WHERE id = $1',
      [id]
    );
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    res.json({ success: true, message: 'Empresa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir empresa:', error);
    res.status(500).json({ error: 'Erro ao excluir empresa' });
  }
}
