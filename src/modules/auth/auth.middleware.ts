import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from 'config/env';

export interface AuthRequest extends Request {
  userId?: number;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ authenticated: false });
  }
}
