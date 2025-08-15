import type { Request, Response } from 'express';

import { AuthService } from 'modules/auth/auth.service';
import type { LoginDto } from 'modules/auth/dto/login.dto';
import type { RegisterDto } from 'modules/auth/dto/register.dto';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body as RegisterDto;
      const result = await authService.register(email, password);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body as LoginDto;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }
}
