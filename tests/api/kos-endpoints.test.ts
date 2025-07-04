import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

describe('KOS Additional API Endpoints', () => {
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
      server.listen(3003, () => {
        console.log('Test server running on port 3003');
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

  describe('GET /api/kos/featured', () => {
    it('should return featured kos', async () => {
      const response = await request(server)
        .get('/api/kos/featured');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const response = await request(server)
        .get('/api/kos/featured?limit=3');
      
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(3);
    });

    it('should return 400 for invalid limit', async () => {
      const response = await request(server)
        .get('/api/kos/featured?limit=invalid');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/kos/[id]/view', () => {
    it('should increment view count for valid kos ID', async () => {
      // First, try to get recommendations to see if we have any kos
      const kosResponse = await request(server)
        .get('/api/kos/recommendations?limit=1');
      
      if (kosResponse.body.data.recommendations.length > 0) {
        const kosId = kosResponse.body.data.recommendations[0].id;
        
        const response = await request(server)
          .post(`/api/kos/${kosId}/view`);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('view_count');
        expect(typeof response.body.data.view_count).toBe('number');
      }
    });

    it('should return 404 for non-existent kos ID', async () => {
      const response = await request(server)
        .post('/api/kos/99999/view');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 for invalid kos ID format', async () => {
      const response = await request(server)
        .post('/api/kos/invalid/view');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/kos/nearby', () => {
    it('should return nearby kos for valid coordinates', async () => {
      const response = await request(server)
        .get('/api/kos/nearby?lat=-6.2088&lng=106.8456&radius=5');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should require latitude parameter', async () => {
      const response = await request(server)
        .get('/api/kos/nearby?lng=106.8456&radius=5');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('latitude');
    });

    it('should require longitude parameter', async () => {
      const response = await request(server)
        .get('/api/kos/nearby?lat=-6.2088&radius=5');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('longitude');
    });

    it('should validate latitude range', async () => {
      const response = await request(server)
        .get('/api/kos/nearby?lat=91&lng=106.8456&radius=5');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate longitude range', async () => {
      const response = await request(server)
        .get('/api/kos/nearby?lat=-6.2088&lng=181&radius=5');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should use default radius when not provided', async () => {
      const response = await request(server)
        .get('/api/kos/nearby?lat=-6.2088&lng=106.8456');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/geocode', () => {
    it('should require admin authentication', async () => {
      const response = await request(server)
        .get('/api/geocode?address=Jakarta');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should require address parameter when authenticated', async () => {
      // This test would require proper admin authentication setup
      // For now, we just test that it requires auth
      const response = await request(server)
        .get('/api/geocode');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
