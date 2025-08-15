import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { prisma } from '../../db.js';
import { env } from '../../config/env.js';
export class GithubService {
    getAuthUrl() {
        const redirectUri = `${env.BACKEND_URL}/auth/github/callback`;
        return `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20user:email`;
    }
    async handleCallback(code) {
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                client_id: env.GITHUB_CLIENT_ID,
                client_secret: env.GITHUB_CLIENT_SECRET,
                code
            })
        });
        const tokenData = (await tokenRes.json());
        const accessToken = tokenData.access_token;
        if (!accessToken)
            throw new Error('No access token');
        const userRes = await fetch('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` }
        });
        const ghUser = (await userRes.json());
        let email = ghUser.email;
        if (!email) {
            const emailsRes = await fetch('https://api.github.com/user/emails', {
                headers: { Authorization: `token ${accessToken}` }
            });
            const emails = (await emailsRes.json());
            email = emails.find((e) => e.primary && e.verified)?.email || null;
        }
        if (!email)
            throw new Error('GitHub email not available');
        // Сначала ищем пользователя по email
        let user = await prisma.user.findUnique({
            where: { email }
        });
        if (user) {
            // Если есть githubId, проверяем, совпадает ли
            if (!user.githubId) {
                // Привязываем githubId к существующему пользователю
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { githubId: String(ghUser.id) }
                });
            }
        }
        else {
            // Создаём нового пользователя
            user = await prisma.user.create({
                data: {
                    githubId: String(ghUser.id),
                    email,
                    name: ghUser.name || ghUser.login,
                    avatarUrl: ghUser.avatar_url
                }
            });
        }
        const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
            expiresIn: '7d'
        });
        return { token, user };
    }
}
