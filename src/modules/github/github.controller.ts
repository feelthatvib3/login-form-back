import type { Request, Response } from 'express';

import { GithubService } from 'modules/github/github.service';

import { env } from 'config/env';

export class GithubController {
  private githubService = new GithubService();

  initiateAuth = (req: Request, res: Response): void => {
    const authUrl = this.githubService.getAuthUrl();
    res.redirect(authUrl);
  };

  handleCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        res.status(400).json({ success: false, message: 'Authorization code is required' });
        return;
      }

      const { token } = await this.githubService.handleCallback(code);

      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
      });

      const frontendUrl = env.FRONTEND_URL;
      res.redirect(frontendUrl);
    } catch (error) {
      console.error('GitHub auth error:', error);
      const frontendUrl = env.FRONTEND_URL;
      res.redirect(`${frontendUrl}/auth/error`);
    }
  };

  handleCallbackJson = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Authorization code is required'
        });
      }

      const { token, user } = await this.githubService.handleCallback(code);

      return res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl
          }
        }
      });
    } catch (error) {
      console.error('GitHub auth error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  };
}
