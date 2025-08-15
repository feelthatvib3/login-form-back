import { AuthService } from './auth.service.js';
export class AuthController {
    authService = new AuthService();
    register = async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await this.authService.register(email, password);
            const { token } = await this.authService.login(email, password);
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24
            });
            res.json({ success: true });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    };
    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const { token } = await this.authService.login(email, password);
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24
            });
            res.json({ success: true });
        }
        catch (err) {
            res.status(401).json({ success: false, error: err.message });
        }
    };
    me = async (req, res) => {
        if (!req.userId)
            return res.json({ authenticated: false });
        const user = await this.authService.me(req.userId);
        if (!user)
            return res.json({ authenticated: false });
        res.json({ authenticated: true, user });
    };
}
