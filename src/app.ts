import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { authRouter } from 'modules/auth/auth.routes';
import { githubRoutes } from 'modules/github/github.routes';

import { env } from 'config/env';

const app = express();
const PORT = env.PORT;

const corsOptions = {
  origin: 'https://login.feelthatvib3.rocks',
  credentials: true
};

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/auth', cors(corsOptions), authRouter);
app.use('/auth/github', cors(corsOptions), githubRoutes);

app.listen(PORT);
