import { testFetch, authFetch } from '../helpers/testFetch';
import type { ParsedResponse } from '../helpers/envelope';

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

export async function createKos(token: string, payload: CreateKosPayload): Promise<ParsedResponse<any>> {
  return authFetch('/api/kos', token, { method: 'POST', body: payload });
}
