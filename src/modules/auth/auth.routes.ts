import { Router } from 'express';

import { AuthController } from 'modules/auth/auth.controller';
import { authMiddleware } from 'modules/auth/auth.middleware';

const controller = new AuthController();
export const authRouter = Router();

authRouter.post('/register', controller.register.bind(controller));
authRouter.post('/login', controller.login.bind(controller));
authRouter.get('/me', authMiddleware, controller.me.bind(controller));
