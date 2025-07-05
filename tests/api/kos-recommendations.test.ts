import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestServer, closeTestServer } from '../utils/test-server';

describe('KOS Recommendations API', () => {
  let testServer: any;

  beforeAll(async () => {
    testServer = await createTestServer();
  });

  afterAll(async () => {
    if (testServer) {
      await closeTestServer(testServer);
    }
  });

  describe('GET /api/kos/recommendations', () => {
    it('should return recommendations with default parameters', async () => {
      const response = await request(testServer.server)
        .get('/api/kos/recommendations');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('recommendations');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.recommendations)).toBe(true);
    });

    it('should accept limit parameter', async () => {
      const response = await request(testServer.server)
        .get('/api/kos/recommendations?limit=5');
      
      expect(response.status).toBe(200);
      expect(response.body.data.recommendations.length).toBeLessThanOrEqual(5);
    });

    it('should accept city filter', async () => {
      const response = await request(testServer.server)
        .get('/api/kos/recommendations?city=Jakarta');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should accept price range filters', async () => {
      const response = await request(testServer.server)
        .get('/api/kos/recommendations?min_price=500000&max_price=2000000');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 400 for invalid limit', async () => {
      const response = await request(testServer.server)
        .get('/api/kos/recommendations?limit=invalid');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid price range', async () => {
      const response = await request(testServer.server)
        .get('/api/kos/recommendations?min_price=2000000&max_price=500000');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('min_price must be less than max_price');
    });

    it('should include quality score in recommendations', async () => {
      const response = await request(testServer.server)
        .get('/api/kos/recommendations');
      
      expect(response.status).toBe(200);
      if (response.body.data.recommendations.length > 0) {
        const recommendation = response.body.data.recommendations[0];
        expect(recommendation).toHaveProperty('qualityScore');
        // Quality score might be returned as string from database
        expect(['string', 'number']).toContain(typeof recommendation.qualityScore);
      }
    });
  });
});
