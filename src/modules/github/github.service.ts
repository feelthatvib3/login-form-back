import type { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { prisma } from 'src/db';

import { env } from 'config/env';

interface GithubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

export class GithubService {
  getAuthUrl(): string {
    const redirectUri = `${env.BACKEND_URL}/auth/github/callback`;
    return `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=read:user%20user:email`;
  }

  async handleCallback(code: string): Promise<{ token: string; user: User }> {
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

    const tokenData = (await tokenRes.json()) as { access_token?: string };
    const accessToken = tokenData.access_token;
    if (!accessToken) throw new Error('No access token');

    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}` }
    });
    const ghUser = (await userRes.json()) as GithubUser;

    let email = ghUser.email;
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${accessToken}` }
      });
      const emails = (await emailsRes.json()) as GithubEmail[];
      email = emails.find((e) => e.primary && e.verified)?.email || null;
    }

    if (!email) throw new Error('GitHub email not available');

    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      if (!user.githubId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { githubId: String(ghUser.id) }
        });
      }
    } else {
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
