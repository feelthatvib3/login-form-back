import { Router } from 'express';

import { GithubController } from './github.controller';

const githubController = new GithubController();

export const githubRoutes = Router();

githubRoutes.get('/', githubController.initiateAuth);
githubRoutes.get('/callback', githubController.handleCallback);
