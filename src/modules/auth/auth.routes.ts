import { Router } from 'express';

import { AuthController } from 'modules/auth/auth.controller';

const controller = new AuthController();
export const authRouter = Router();

authRouter.post('/register', controller.register.bind(controller));
authRouter.post('/login', controller.login.bind(controller));
