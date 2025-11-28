import jwt from 'jsonwebtoken';

// Middleware para verificar token JWT
export const authMiddleware = (req, res, next) => {
  try {
    // Obter token do header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Token geralmente vem como "Bearer TOKEN"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Adicionar dados do usuário à requisição
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    return res.status(401).json({ error: 'Erro na autenticação' });
  }
};

// Middleware para verificar role (admin)
export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

// Middleware opcional (não bloqueia se não tiver token)
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Se der erro, apenas continua sem usuário
    next();
  }
};
