import express from 'express'
import {shortUrl, redirectUrl, listUrls} from '../controllers/url.controller.js'
import rateLimit from 'express-rate-limit'

const router = express.Router();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later',
});

const readLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: 'Too many requests from this IP, please try again later',
});

router.get('/', readLimiter, listUrls);
router.post('/shorten', limiter, shortUrl);
router.get('/:code', redirectUrl);

export default router