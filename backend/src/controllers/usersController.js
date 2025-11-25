import pool from '../database/db.js';
import bcrypt from 'bcrypt';

// GET /api/users - Listar todos os usuários (apenas admin)
export async function getAllUsers(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, nome, email, role, ativo, ultimo_acesso, created_at, updated_at
       FROM users
       ORDER BY nome ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
}

// GET /api/users/:id - Buscar usuário por ID
export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT id, nome, email, role, ativo, ultimo_acesso, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
}

// POST /api/users - Criar novo usuário (apenas admin)
export async function createUser(req, res) {
  try {
    const { nome, email, senha, role } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }
    
    // Verificar se email já existe
    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    
    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);
    
    const { rows } = await pool.query(
      `INSERT INTO users (nome, email, senha, role, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, email, role, ativo, created_at`,
      [nome, email, senhaHash, role || 'user', req.user.id]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
}

// PUT /api/users/:id - Atualizar usuário
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { nome, email, role, ativo, senha } = req.body;
    
    // Verificar permissão: admin pode editar todos, outros só a si mesmos
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Sem permissão para editar este usuário' });
    }
    
    // Se está alterando email, verificar se já existe
    if (email) {
      const { rows: existing } = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
    }
    
    // Construir query dinamicamente
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (nome !== undefined) {
      updates.push(`nome = $${paramIndex++}`);
      values.push(nome);
    }
    
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    
    if (role !== undefined && req.user.role === 'admin') {
      updates.push(`role = $${paramIndex++}`);
      values.push(role);
    }
    
    if (ativo !== undefined && req.user.role === 'admin') {
      updates.push(`ativo = $${paramIndex++}`);
      values.push(ativo);
    }
    
    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      updates.push(`senha = $${paramIndex++}`);
      values.push(senhaHash);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    updates.push(`updated_by = $${paramIndex++}`);
    values.push(req.user.id);
    
    values.push(id);
    
    const { rows } = await pool.query(
      `UPDATE users
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, nome, email, role, ativo, created_at, updated_at`,
      values
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
}

// DELETE /api/users/:id - Excluir usuário (apenas admin)
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    
    // Não permitir deletar a si mesmo
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ error: 'Não é possível excluir seu próprio usuário' });
    }
    
    const { rowCount } = await pool.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ success: true, message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
}

// PUT /api/users/:id/toggle-active - Ativar/desativar usuário (apenas admin)
export async function toggleUserActive(req, res) {
  try {
    const { id } = req.params;
    
    // Não permitir desativar a si mesmo
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ error: 'Não é possível desativar seu próprio usuário' });
    }
    
    const { rows } = await pool.query(
      `UPDATE users
       SET ativo = NOT ativo, updated_by = $1
       WHERE id = $2
       RETURNING id, nome, email, role, ativo`,
      [req.user.id, id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({
      success: true,
      message: `Usuário ${rows[0].ativo ? 'ativado' : 'desativado'} com sucesso`,
      user: rows[0]
    });
  } catch (error) {
    console.error('Erro ao alternar status do usuário:', error);
    res.status(500).json({ error: 'Erro ao alternar status do usuário' });
  }
}
