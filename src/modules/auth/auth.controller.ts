import type { Request, Response } from 'express';

import { AuthService } from 'modules/auth/auth.service';
import type { LoginDto } from 'modules/auth/dto/login.dto';
import type { RegisterDto } from 'modules/auth/dto/register.dto';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as RegisterDto;
      const { token } = await this.authService.login(email, password);
      console.error('register', email, password);
      console.error('register', token);
      res.json({ success: true, token });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as LoginDto;
      const { token } = await this.authService.login(email, password);
      console.error('login', email, password);
      console.error('login', token);
      res.json({ success: true, token: token });
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  };
}
