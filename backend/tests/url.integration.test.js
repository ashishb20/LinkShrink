import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';
import Url from '../src/models/url.model.js';

const TEST_MONGO_URI = process.env.TEST_MONGO_URI;
const describeWithDatabase = TEST_MONGO_URI ? describe : describe.skip;

const createLink = (longUrl = 'https://example.com/docs', title = 'Docs') =>
    request(app).post('/api/url/shorten').send({ longUrl, title });

describeWithDatabase('URL API with a database', () => {
    beforeAll(async () => {
        await mongoose.connect(TEST_MONGO_URI);
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    beforeEach(async () => {
        await Url.deleteMany({});
    });

    it('returns full link data on create', async () => {
        const res = await createLink();

        expect(res.status).toBe(201);
        expect(res.body.shortCode).toMatch(/^[A-Za-z0-9_-]{7}$/);
        expect(res.body.shortUrl).toContain(res.body.shortCode);
        expect(res.body).toMatchObject({
            longUrl: 'https://example.com/docs',
            title: 'Docs',
            clicks: 0,
        });
        expect(new Date(res.body.createdAt).getTime()).toBeGreaterThan(0);
        expect(new Date(res.body.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });

    it('dedupes by long URL and keeps the original timestamps', async () => {
        const first = await createLink();
        const second = await createLink();

        expect(second.status).toBe(200);
        expect(second.body.shortCode).toBe(first.body.shortCode);
        expect(second.body.createdAt).toBe(first.body.createdAt);
        expect(second.body.expiresAt).toBe(first.body.expiresAt);
    });

    it('increments clicks once per redirect', async () => {
        const { body } = await createLink();

        await request(app).get(`/${body.shortCode}`).expect(302);
        await request(app).get(`/${body.shortCode}`).expect(302);

        const list = await request(app)
            .get('/api/url')
            .query({ codes: body.shortCode });

        expect(list.status).toBe(200);
        expect(list.body.links).toHaveLength(1);
        expect(list.body.links[0].clicks).toBe(2);
    });

    it('returns 410 for expired links and does not increment clicks', async () => {
        const code = 'expired';
        await Url.create({
            longUrl: 'https://example.com/old',
            shortCode: code,
            expiresAt: new Date(Date.now() - 60_000),
        });

        const res = await request(app).get(`/${code}`);
        expect(res.status).toBe(410);

        const doc = await Url.findOne({ shortCode: code });
        expect(doc.clicks).toBe(0);
    });

    it('returns 404 for unknown codes', async () => {
        const res = await request(app).get('/missing');
        expect(res.status).toBe(404);
    });

    it('returns found links and lists missing codes', async () => {
        await Url.create({ longUrl: 'https://a.example.com', shortCode: 'aaaaaaa' });
        await Url.create({ longUrl: 'https://b.example.com', shortCode: 'bbbbbbb' });

        const res = await request(app)
            .get('/api/url')
            .query({ codes: 'aaaaaaa,bbbbbbb,ccccccc,not-valid' });

        expect(res.status).toBe(200);
        expect(res.body.links.map((link) => link.shortCode).sort()).toEqual([
            'aaaaaaa',
            'bbbbbbb',
        ]);
        expect(res.body.missing).toEqual(['ccccccc']);
    });
});
