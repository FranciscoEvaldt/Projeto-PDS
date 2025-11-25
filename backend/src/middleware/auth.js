import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui_mude_em_producao';

// Middleware para verificar token JWT
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(403).json({ error: 'Token inválido' });
  }
}

// Middleware para verificar se é admin
export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
}

// Middleware para verificar se é admin ou manager
export function requireManager(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores e gerentes.' });
  }
  next();
}

// Middleware para verificar múltiplas roles
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Acesso negado. Role insuficiente.',
        required: roles,
        current: req.user.role
      });
    }
    next();
  };
}

// Middleware opcional - não retorna erro se não tiver token
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const user = jwt.verify(token, JWT_SECRET);
      req.user = user;
    } catch (error) {
      // Ignora erros de token no modo opcional
      req.user = null;
    }
  }
  
  next();
}
