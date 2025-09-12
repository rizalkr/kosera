import { describe, it, expect, beforeAll } from 'vitest';
import { createAndLogin } from '../factories/userFactory';
import { authFetch, testFetch } from '../helpers/testFetch';
import { expectSuccess, expectError } from '../helpers/envelope';
import type { ErrorCode } from '@/types/error-codes';

interface FavoriteData { favorite: { id: number; kosId?: number } }
interface AddFavoriteResponse { favorite: { id: number; userId: number; kosId: number } }

// Utility to create a kos via existing endpoint (seller role required)
async function createKos(sellerToken: string): Promise<number> {
  const body = {
    name: 'Test Kos Fav',
    address: 'Jl. Favorit 123',
    city: 'Bandung',
    facilities: ['wifi'],
    latitude: -6.2,
    longitude: 106.8,
    totalRooms: 10,
    occupiedRooms: 0,
    price: 500000,
    title: 'Kos Favorit',
    description: 'Deskripsi kos favorit',
  };
  const res = await authFetch('/api/kos', sellerToken, { method: 'POST', body });
  expectSuccess(res); // ensure kos created
  const kosId = (res.body as any).data?.kos?.id || (res.body as any).data?.id;
  expect(typeof kosId).toBe('number');
  return kosId as number;
}

describe('Favorites API', () => {
  let renterToken: string;
  let sellerToken: string;
  let kosId: number;

  beforeAll(async () => {
    const renter = await createAndLogin('RENTER');
    renterToken = renter.token;
    const seller = await createAndLogin('SELLER');
    sellerToken = seller.token;
    kosId = await createKos(sellerToken);
  });

  it('adds kos to favorites', async () => {
    const res = await authFetch('/api/user/favorites', renterToken, { method: 'POST', body: { kosId } });
    expectSuccess(res);
    expect((res.body as any).data.favorite.kosId).toBe(kosId);
  });

  it('returns conflict when adding same kos again', async () => {
    const res = await authFetch('/api/user/favorites', renterToken, { method: 'POST', body: { kosId } });
    expectError(res, 'conflict' as ErrorCode);
    expect(res.status).toBe(409);
  });

  it('lists favorites with pagination meta', async () => {
    const res = await authFetch('/api/user/favorites', renterToken, { method: 'GET' });
    expectSuccess(res);
    const data = (res.body as any).data;
    expect(Array.isArray(data.favorites)).toBe(true);
    expect(data.pagination).toMatchObject({ page: 1 });
  });

  it('validates kosId on add', async () => {
    const res = await authFetch('/api/user/favorites', renterToken, { method: 'POST', body: { kosId: -1 } });
    expectError(res, 'validation_error');
    expect(res.status).toBe(400);
  });

  it('removes kos from favorites', async () => {
    const res = await authFetch('/api/user/favorites', renterToken, { method: 'DELETE', body: { kosId } });
    expectSuccess(res);
    expect((res.body as any).data.kosId).toBe(kosId);
  });

  it('returns not_found when removing non-existing favorite', async () => {
    const res = await authFetch('/api/user/favorites', renterToken, { method: 'DELETE', body: { kosId } });
    expectError(res, 'not_found');
    expect(res.status).toBe(404);
  });

  it('requires auth for favorites endpoints', async () => {
    const res = await testFetch('/api/user/favorites', { method: 'GET' });
    expectError(res, 'unauthorized');
    expect(res.status).toBe(401);
  });
});
