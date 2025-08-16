import type { Request, Response } from 'express';

import type { AuthRequest } from 'modules/auth/auth.middleware';
import { AuthService } from 'modules/auth/auth.service';
import type { LoginDto } from 'modules/auth/dto/login.dto';
import type { RegisterDto } from 'modules/auth/dto/register.dto';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as RegisterDto;
      const { token } = await this.authService.login(email, password);

      res.json({ success: true, token });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as LoginDto;
      const { token } = await this.authService.login(email, password);

      res.json({ success: true, token });
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  };

  me = async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.json({ authenticated: false });

    const user = await this.authService.me(req.userId);
    if (!user) return res.json({ authenticated: false });

    res.json({ authenticated: true, user });
  };
}
