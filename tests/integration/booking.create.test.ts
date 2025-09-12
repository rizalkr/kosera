import { describe, it, expect, beforeAll } from 'vitest';
import { createAndLogin } from '../factories/userFactory';
import { authFetch } from '../helpers/testFetch';
import { expectError, expectSuccess } from '../helpers/envelope';

/** Integration tests for booking creation edge cases */
describe('Booking Create API', () => {
  let renterToken: string;
  let sellerToken: string;
  let kosId: number;

  async function createKos(token: string): Promise<number> {
    const res = await authFetch('/api/kos', token, {
      method: 'POST',
      body: {
        name: 'Booking Test Kos',
        address: 'Jl. Booking 123',
        city: 'Jakarta',
        facilities: ['wifi'],
        latitude: -6.2,
        longitude: 106.8,
        totalRooms: 5,
        occupiedRooms: 0,
        price: 750000,
        title: 'Kos Booking',
        description: 'Kos for booking tests',
      },
    });
    expectSuccess(res);
    return (res.body as any).data.kos.id;
  }

  beforeAll(async () => {
    const seller = await createAndLogin('SELLER');
    sellerToken = seller.token;
    kosId = await createKos(sellerToken);
    const renter = await createAndLogin('RENTER');
    renterToken = renter.token;
  });

  it('validates missing fields', async () => {
    const res = await authFetch('/api/bookings', renterToken, { method: 'POST', body: { kosId } });
    expectError(res, 'validation_error');
    expect(res.status).toBe(400);
  });

  it('rejects past check-in date', async () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    const res = await authFetch('/api/bookings', renterToken, {
      method: 'POST',
      body: { kosId, checkInDate: past.toISOString(), duration: 1 },
    });
    expectError(res, 'validation_error');
    expect(res.status).toBe(400);
  });

  it('creates booking successfully', async () => {
    const future = new Date();
    future.setDate(future.getDate() + 2);
    const res = await authFetch('/api/bookings', renterToken, {
      method: 'POST',
      body: { kosId, checkInDate: future.toISOString(), duration: 2 },
    });
    expectSuccess(res);
    expect(res.status).toBe(200);
  });

  it('prevents booking own kos', async () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const res = await authFetch('/api/bookings', sellerToken, {
      method: 'POST',
      body: { kosId, checkInDate: future.toISOString(), duration: 1 },
    });
    expectError(res, 'forbidden');
    expect(res.status).toBe(400);
  });
});
