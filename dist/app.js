import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { authRouter } from './modules/auth/auth.routes.js';
import { githubRoutes } from './modules/github/github.routes.js';
import { env } from './config/env.js';
const app = express();
const PORT = env.PORT;
app.use(cors({
    origin: 'https://login.feelthatvib3.rocks',
    credentials: true
}));
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/auth', authRouter);
app.use('/auth/github', githubRoutes);
app.listen(PORT);
