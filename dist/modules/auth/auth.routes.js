import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authMiddleware } from './auth.middleware.js';
const controller = new AuthController();
export const authRouter = Router();
authRouter.post('/register', controller.register.bind(controller));
authRouter.post('/login', controller.login.bind(controller));
authRouter.get('/me', authMiddleware, controller.me.bind(controller));
