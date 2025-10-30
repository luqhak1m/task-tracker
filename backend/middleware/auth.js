import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'taskhub_secret';

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No authorization header' });
    const token = header.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;

    // attach user object
    req.user = await User.findById(req.userId).select('-password');
    if (!req.user) return res.status(401).json({ error: 'User not found' });

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
