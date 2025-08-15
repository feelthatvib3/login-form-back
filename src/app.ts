import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import { authRouter } from 'modules/auth/auth.routes';

import { env } from 'config/env';

const app = express();
const PORT = env.PORT;

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRouter);

app.get('/', (_, res) => res.send('API is running'));

app.listen(PORT);
