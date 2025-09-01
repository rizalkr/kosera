import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { ok, fail } from '@/types/api';
import { z } from 'zod';

// Nominatim geocoding result interface
interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

// Geocoding response data interface
interface GeocodingData {
  latitude: number;
  longitude: number;
  address: string;
}

// Simple in-memory rate limiting store (per user)
interface RateEntry {
  count: number;
  resetTime: number;
}
const rateLimitStore = new Map<string, RateEntry>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per window

// Check and update rate limit for a client
function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(clientId);
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

// Zod schema for query validation
const querySchema = z.object({ address: z.string().min(1, 'Address parameter is required') });

export const GET = withAdmin(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const addressRaw = searchParams.get('address') || '';
    const parsed = querySchema.safeParse({ address: addressRaw });
    if (!parsed.success) {
      return fail('validation_error', 'Invalid query', parsed.error.flatten(), { status: 400 });
    }
    const { address } = parsed.data;

    const clientId = request.user!.userId.toString();
    // Rate limiting
    if (!checkRateLimit(clientId)) {
      return fail('rate_limited', 'Rate limit exceeded. Try again later.', undefined, { status: 429 });
    }

    // Call to Nominatim API for geocoding
    const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search');
    nominatimUrl.searchParams.set('q', address.trim());
    nominatimUrl.searchParams.set('format', 'json');
    nominatimUrl.searchParams.set('limit', '1');
    nominatimUrl.searchParams.set('addressdetails', '1');

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Kosera/1.0 (contact@kosera.com)', // Required by Nominatim
      },
    });

    if (!response.ok) {
      console.error('Nominatim error', response.status, response.statusText);
      return fail('upstream_unavailable', 'Geocoding service temporarily unavailable', undefined, { status: 503 });
    }

    const results: NominatimResult[] = await response.json();
    if (results.length === 0) {
      return fail('not_found', 'Address not found', undefined, { status: 404 });
    }

    const first = results[0];
    const latitude = Number.parseFloat(first.lat);
    const longitude = Number.parseFloat(first.lon);
    // Validate coordinates
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return fail('invalid_coordinates', 'Invalid coordinates received from service', undefined, { status: 500 });
    }

    const data: GeocodingData = { latitude, longitude, address: first.display_name };
    return ok('Geocoding successful', data);
  } catch (error) {
    console.error('geocode.GET error', error);
    // Handle specific fetch/network errors
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network'))) {
      return fail('network_error', 'Unable to connect to geocoding service', undefined, { status: 503 });
    }
    return fail('internal_error', 'Internal server error during geocoding', undefined, { status: 500 });
  }
});
