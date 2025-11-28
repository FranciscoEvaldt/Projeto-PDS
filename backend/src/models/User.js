import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = {
  // Buscar todos os usuários
  async findAll() {
    const result = await query(
      'SELECT id, nome, email, role, created_at, updated_at FROM users ORDER BY nome'
    );
    return result.rows;
  },

  // Buscar usuário por ID
  async findById(id) {
    const result = await query(
      'SELECT id, nome, email, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  // Buscar usuário por email (para login)
  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  // Criar novo usuário
  async create(userData) {
    const { nome, email, senha, role = 'user' } = userData;
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);
    
    const result = await query(
      `INSERT INTO users (nome, email, senha, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, nome, email, role, created_at`,
      [nome, email, hashedPassword, role]
    );
    
    return result.rows[0];
  },

  // Atualizar usuário
  async update(id, userData) {
    const { nome, email, role } = userData;
    
    const result = await query(
      `UPDATE users 
       SET nome = $1, email = $2, role = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, nome, email, role, updated_at`,
      [nome, email, role, id]
    );
    
    return result.rows[0];
  },

  // Atualizar senha
  async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await query(
      'UPDATE users SET senha = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, id]
    );
  },

  // Deletar usuário
  async delete(id) {
    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id, nome, email',
      [id]
    );
    return result.rows[0];
  },

  // Verificar senha
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },
};

export default User;

