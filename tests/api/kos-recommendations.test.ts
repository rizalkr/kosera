import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

describe('KOS Recommendations API', () => {
  let server: any;
  let app: any;

  beforeAll(async () => {
    // Create Next.js app for testing
    const dev = process.env.NODE_ENV !== 'production';
    app = next({ dev, quiet: true });
    const handle = app.getRequestHandler();

    await app.prepare();

    server = createServer(async (req, res) => {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    });

    await new Promise<void>((resolve) => {
      server.listen(3002, () => {
        console.log('Test server running on port 3002');
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('GET /api/kos/recommendations', () => {
    it('should return recommendations with default parameters', async () => {
      const response = await request(server)
        .get('/api/kos/recommendations');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('recommendations');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.recommendations)).toBe(true);
    });

    it('should accept limit parameter', async () => {
      const response = await request(server)
        .get('/api/kos/recommendations?limit=5');
      
      expect(response.status).toBe(200);
      expect(response.body.data.recommendations.length).toBeLessThanOrEqual(5);
    });

    it('should accept city filter', async () => {
      const response = await request(server)
        .get('/api/kos/recommendations?city=Jakarta');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should accept price range filters', async () => {
      const response = await request(server)
        .get('/api/kos/recommendations?min_price=500000&max_price=2000000');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 400 for invalid limit', async () => {
      const response = await request(server)
        .get('/api/kos/recommendations?limit=invalid');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid price range', async () => {
      const response = await request(server)
        .get('/api/kos/recommendations?min_price=2000000&max_price=500000');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('min_price must be less than max_price');
    });

    it('should include quality score in recommendations', async () => {
      const response = await request(server)
        .get('/api/kos/recommendations');
      
      expect(response.status).toBe(200);
      if (response.body.data.recommendations.length > 0) {
        const recommendation = response.body.data.recommendations[0];
        expect(recommendation).toHaveProperty('quality_score');
        expect(typeof recommendation.quality_score).toBe('number');
      }
    });
  });
});
