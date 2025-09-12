import { describe, it, expect } from 'vitest';
import { createAndLogin } from '../factories/userFactory';
import { createKos } from '../factories/kosFactory';
import { expectSuccess, expectError, parseResponse } from '../helpers/envelope';

function sampleKos() {
  return {
    name: 'Test Kos',
    address: 'Jl. Testing 123',
    city: 'Jakarta',
    facilities: ['WiFi','AC'],
    title: 'Kos Nyaman',
    description: 'Dekat kampus',
    price: 750000,
    totalRooms: 10,
  };
}

describe('Kos Create', () => {
  it('creates kos as SELLER', async () => {
    const { token } = await createAndLogin('SELLER');
    const res = await createKos(token, sampleKos());
    expectSuccess(res);
    const body: any = res.body;
    expect(body.data.kos).toHaveProperty('id');
    expect(body.data.kos).toHaveProperty('name', 'Test Kos');
  });

  it('validates payload', async () => {
    const { token } = await createAndLogin('SELLER');
    const bad = await createKos(token, { ...(sampleKos() as any), name: '' });
    expectError(bad);
  });
});
