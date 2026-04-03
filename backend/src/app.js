import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

//  Routes add
import urlRoutes from './routes/url.routes.js';
import { redirectUrl } from './controllers/url.controller.js';

const app = express();
// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: " Too many requests from this IP, please try again later"
});
app.use(limiter);
app.use(cors());
app.use(express.json());

// API routes 
app.use('/api/url', urlRoutes);
app.get('/:code', redirectUrl);

export default app;