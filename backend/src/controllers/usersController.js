import pool from '../config/database.js';

class UsersController {
  // Listar todos os usuários
  async getAll(req, res) {
    try {
      const result = await pool.query(
        'SELECT id, username, name, role, created_at FROM users ORDER BY created_at DESC'
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({ error: 'Erro ao buscar usuários', message: error.message });
    }
  }

  // Buscar usuário por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'SELECT id, username, name, role, created_at FROM users WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário', message: error.message });
    }
  }

  // Autenticar usuário (login)
  async authenticate(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username e password são obrigatórios' });
      }

      const result = await pool.query(
        'SELECT id, username, name, role, created_at FROM users WHERE username = $1 AND password = $2',
        [username, password]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao autenticar usuário:', error);
      res.status(500).json({ error: 'Erro ao autenticar usuário', message: error.message });
    }
  }

  // Criar novo usuário
  async create(req, res) {
    try {
      const { username, password, name, role = 'user' } = req.body;

      // Validação
      if (!username || !password || !name) {
        return res.status(400).json({ error: 'Username, password e name são obrigatórios' });
      }

      // Verificar se username já existe
      const checkUser = await pool.query(
        'SELECT id FROM users WHERE username = $1',
        [username]
      );

      if (checkUser.rows.length > 0) {
        return res.status(409).json({ error: 'Username já existe' });
      }

      const result = await pool.query(
        'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, name, role, created_at',
        [username, password, name, role]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ error: 'Erro ao criar usuário', message: error.message });
    }
  }

  // Atualizar usuário
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, role } = req.body;

      // Verificar se usuário existe
      const checkUser = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
      if (checkUser.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Construir query dinâmica baseada nos campos fornecidos
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount}`);
        values.push(name);
        paramCount++;
      }

      if (role !== undefined) {
        updates.push(`role = $${paramCount}`);
        values.push(role);
        paramCount++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar' });
      }

      values.push(id);
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, username, name, role, created_at`;

      const result = await pool.query(query, values);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ error: 'Erro ao atualizar usuário', message: error.message });
    }
  }

  // Deletar usuário
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar se usuário existe
      const checkUser = await pool.query('SELECT username FROM users WHERE id = $1', [id]);
      if (checkUser.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Não permitir deletar usuário admin padrão
      if (checkUser.rows[0].username === 'admin') {
        return res.status(403).json({ error: 'Não é permitido deletar o usuário admin' });
      }

      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({ error: 'Erro ao deletar usuário', message: error.message });
    }
  }
}

export default new UsersController();
