import { describe, it, expect, beforeAll } from 'vitest';
import { createAndLogin } from '../factories/userFactory';
import { authFetch } from '../helpers/testFetch';
import { expectSuccess, type ParsedResponse } from '../helpers/envelope';

/**
 * Integration test specifically validating double booking (date range conflict) handling.
 * The API (by design) returns a success envelope with `available: false` and `conflict: true`
 * instead of an error envelope when a date range overlaps an existing booking.
 */
describe('Booking Conflict Detection', () => {
  let renterToken: string;
  let kosId: number;
  let sellerToken: string;

  interface CreateKosResult { success: true; message: string; data: { kos?: { id: number }; id?: number } }
  async function createKos(token: string): Promise<number> {
    const res = await authFetch('/api/kos', token, {
      method: 'POST',
      body: {
        name: 'Conflict Kos',
        address: 'Jl. Double 99',
        city: 'Jakarta',
        facilities: ['wifi'],
        latitude: -6.2,
        longitude: 106.8,
        totalRooms: 3,
        occupiedRooms: 0,
        price: 600000,
        title: 'Conflict Test Kos',
        description: 'Testing booking conflict',
      },
    }) as ParsedResponse<CreateKosResult>;
    expectSuccess(res);
    const data = res.body.data;
    const id = data.kos?.id ?? data.id;
    expect(typeof id).toBe('number');
    return id!;
  }

  beforeAll(async () => {
    const seller = await createAndLogin('SELLER');
    sellerToken = seller.token;
    kosId = await createKos(sellerToken);
    const renter = await createAndLogin('RENTER');
    renterToken = renter.token;
  });

  it('returns available=false & conflict=true on overlapping booking', async () => {
    // First booking (baseline)
    const start = new Date();
    start.setDate(start.getDate() + 3);
    const first = await authFetch('/api/bookings', renterToken, {
      method: 'POST',
      body: { kosId, checkInDate: start.toISOString(), duration: 1 },
    });
    expectSuccess(first);
    expect(first.status).toBe(200);
    // Second overlapping booking (same day)
    interface ConflictResponse { success: true; message: string; data: { available: boolean; conflict?: boolean } }
    const overlap = await authFetch('/api/bookings', renterToken, {
      method: 'POST',
      body: { kosId, checkInDate: start.toISOString(), duration: 1 },
    }) as ParsedResponse<ConflictResponse>;
    expectSuccess(overlap); // still success envelope by design
    expect(overlap.status).toBe(200);
    const conflictData = overlap.body.data;
    expect(conflictData.available).toBe(false);
    expect(conflictData.conflict).toBe(true);
  });
});
