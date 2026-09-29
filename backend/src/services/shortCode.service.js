import { nanoid } from 'nanoid';
import Url from '../models/url.model.js';

const MAX_RETRIES = 5;

export const generateShortCode = () => {
    return nanoid(7);
};

export const createUrlWithRetry = async (longUrl, title = '') => {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const shortCode = generateShortCode();
            const doc = await Url.create({ longUrl, shortCode, title });
            return doc;
        } catch (err) {
            if (err.code === 11000 && attempt < MAX_RETRIES - 1) {
                continue;
            }
            throw err;
        }
    }
};