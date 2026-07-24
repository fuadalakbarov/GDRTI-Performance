const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'gdrti-secret-2026';
require('dotenv').config();

function verifyToken(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token tapılmadı' });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token etibarsızdır' });
    req.user = decoded; // { id, role, sector_id, full_name }
    next();
  });
}

const MANAGER_ROLES = ['admin', 'director', 'deputy'];

function requireAdmin(req, res, next) {
  if (!MANAGER_ROLES.includes(req.user.role)) {
    return res.status(403).json({ error: 'Bu əməliyyat üçün rəhbər səlahiyyəti lazımdır' });
  }
  next();
}

module.exports = { verifyToken, requireAdmin, MANAGER_ROLES };
