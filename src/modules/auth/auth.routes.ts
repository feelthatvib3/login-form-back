import { Router } from 'express';

import { AuthController } from 'modules/auth/auth.controller';

const controller = new AuthController();
export const authRouter = Router();

authRouter.post('/register', (req, res) => controller.register(req, res));
authRouter.post('/login', (req, res) => controller.login(req, res));
