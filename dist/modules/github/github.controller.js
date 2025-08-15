import { GithubService } from './github.service.js';
import { env } from '../../config/env.js';
export class GithubController {
    githubService = new GithubService();
    initiateAuth = (req, res) => {
        const authUrl = this.githubService.getAuthUrl();
        res.redirect(authUrl);
    };
    handleCallback = async (req, res) => {
        try {
            const { code } = req.query;
            if (!code || typeof code !== 'string') {
                res.status(400).json({ success: false, message: 'Authorization code is required' });
                return;
            }
            const { token } = await this.githubService.handleCallback(code);
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24
            });
            const frontendUrl = env.FRONTEND_URL;
            res.redirect(frontendUrl);
        }
        catch (error) {
            console.error('GitHub auth error:', error);
            const frontendUrl = env.FRONTEND_URL;
            res.redirect(`${frontendUrl}/auth/error`);
        }
    };
    handleCallbackJson = async (req, res) => {
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
        }
        catch (error) {
            console.error('GitHub auth error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authentication failed'
            });
        }
    };
}
