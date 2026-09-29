import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Health endpoint', () => {
    it('GET /health returns status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });
});

describe('URL shortening validation', () => {
    it('POST /api/url/shorten returns 400 without longUrl', async () => {
        const res = await request(app)
            .post('/api/url/shorten')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.message).toContain('required');
    });

    it('POST /api/url/shorten returns 400 for invalid URL', async () => {
        const res = await request(app)
            .post('/api/url/shorten')
            .send({ longUrl: 'not-a-url' });
        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Invalid');
    });

    it('POST /api/url/shorten blocks localhost (SSRF)', async () => {
        const res = await request(app)
            .post('/api/url/shorten')
            .send({ longUrl: 'http://localhost:3000/admin' });
        expect(res.status).toBe(400);
    });

    it('POST /api/url/shorten blocks private IPs (SSRF)', async () => {
        const res = await request(app)
            .post('/api/url/shorten')
            .send({ longUrl: 'http://169.254.169.254/latest/meta-data/' });
        expect(res.status).toBe(400);
    });

    it('POST /api/url/shorten blocks 10.x private range', async () => {
        const res = await request(app)
            .post('/api/url/shorten')
            .send({ longUrl: 'http://10.0.0.1/internal' });
        expect(res.status).toBe(400);
    });

    it('POST /api/url/shorten rejects title exceeding 100 characters', async () => {
        const res = await request(app)
            .post('/api/url/shorten')
            .send({ longUrl: 'https://example.com', title: 'a'.repeat(101) });
        expect(res.status).toBe(400);
        expect(res.body.message).toContain('100');
    });
});

describe('CORS headers', () => {
    it('includes access-control-allow-origin', async () => {
        const res = await request(app).get('/health');
        expect(res.headers['access-control-allow-origin']).toBeDefined();
    });
});
