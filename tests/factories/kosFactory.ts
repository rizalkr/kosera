import { authFetch } from '../helpers/testFetch';
import type { ParsedResponse } from '../helpers/envelope';
import { expectSuccess } from '../helpers/envelope';

interface CreateKosPayload {
  name: string;
  address: string;
  city: string;
  facilities?: string[];
  title: string;
  description: string;
  price: number;
  totalRooms: number;
  occupiedRooms?: number;
}
interface CreateKosResponseBody {
  success: true;
  message: string;
  data: { kos: { id: number } } | { id: number };
}

export async function createKos(token: string, payload: CreateKosPayload): Promise<ParsedResponse<CreateKosResponseBody>> {
  return authFetch('/api/kos', token, { method: 'POST', body: payload }) as unknown as ParsedResponse<CreateKosResponseBody>;
}

export interface CreateKosOptions {
  token: string;
  name?: string;
  city?: string;
  price?: number;
  totalRooms?: number;
}

export async function createKosForSeller(opts: CreateKosOptions): Promise<number> {
  const { token, name = 'Test Kos', city = 'Jakarta', price = 500000, totalRooms = 10 } = opts;
  const res = await createKos(token, {
    name,
    address: 'Alamat Jalan 123',
    city,
    facilities: ['wifi'],
    title: `${name} Title`,
    description: 'Deskripsi untuk test kos',
    price,
    totalRooms,
    occupiedRooms: 0,
  });
  expectSuccess(res);
  const raw = res.body.data;
  let kosId: number | undefined;
  if ('kos' in raw && typeof raw.kos === 'object' && raw.kos && 'id' in raw.kos) {
    kosId = (raw as { kos: { id: number } }).kos.id;
  } else if ('id' in raw && typeof raw.id === 'number') {
    kosId = (raw as { id: number }).id;
  }
  if (typeof kosId !== 'number') throw new Error('createKosForSeller: could not extract kos id');
  return kosId;
}
