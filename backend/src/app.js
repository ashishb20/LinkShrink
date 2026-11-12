import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import logger from './config/logger.js';
import { config } from './config/env.js';

import urlRoutes from './routes/url.routes.js';
import { redirectUrl } from './controllers/url.controller.js';

const app = express();

const corsOptions = {
    origin: config.frontendUrl,
    methods: ['GET', 'POST'],
};

app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }));
app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/url', urlRoutes);
app.get('/:code', redirectUrl);

export default app;