import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
export function authMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ authenticated: false });
    }
    try {
        const payload = jwt.verify(token, env.JWT_SECRET);
        req.userId = payload.userId;
        next();
    }
    catch {
        return res.status(401).json({ authenticated: false });
    }
}
