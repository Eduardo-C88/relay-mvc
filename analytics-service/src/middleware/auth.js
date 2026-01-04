const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar token JWT
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

/**
 * Middleware para verificar se o utilizador é admin ou moderador
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'MODERATOR')) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores e moderadores podem aceder.'
    });
  }
  next();
};

module.exports = {
  verifyToken,
  requireAdmin
};
