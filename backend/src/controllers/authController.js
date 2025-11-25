import pool from '../database/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui_mude_em_producao';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/register - Registrar novo usuário
export async function register(req, res) {
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
    
    // Criar usuário
    const { rows } = await pool.query(
      `INSERT INTO users (nome, email, senha, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email, role, ativo, created_at`,
      [nome, email, senhaHash, role || 'user']
    );
    
    const user = rows[0];
    
    // Gerar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        ativo: user.ativo
      }
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
}

// POST /api/auth/login - Login
export async function login(req, res) {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    // Buscar usuário
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    
    const user = rows[0];
    
    // Verificar se usuário está ativo
    if (!user.ativo) {
      return res.status(401).json({ error: 'Usuário desativado' });
    }
    
    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    
    // Atualizar último acesso
    await pool.query(
      'UPDATE users SET ultimo_acesso = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    
    // Gerar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        ativo: user.ativo,
        ultimo_acesso: user.ultimo_acesso
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
}

// GET /api/auth/me - Obter usuário atual
export async function getMe(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, nome, email, role, ativo, ultimo_acesso, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
}

// PUT /api/auth/change-password - Alterar senha
export async function changePassword(req, res) {
  try {
    const { senha_atual, senha_nova } = req.body;
    
    if (!senha_atual || !senha_nova) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }
    
    if (senha_nova.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres' });
    }
    
    // Buscar usuário
    const { rows } = await pool.query(
      'SELECT senha FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senha_atual, rows[0].senha);
    
    if (!senhaValida) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }
    
    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(senha_nova, 10);
    
    // Atualizar senha
    await pool.query(
      'UPDATE users SET senha = $1 WHERE id = $2',
      [novaSenhaHash, req.user.id]
    );
    
    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
}

// POST /api/auth/refresh - Renovar token
export async function refreshToken(req, res) {
  try {
    // O token já foi validado pelo middleware
    const user = req.user;
    
    // Gerar novo token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    res.status(500).json({ error: 'Erro ao renovar token' });
  }
}
