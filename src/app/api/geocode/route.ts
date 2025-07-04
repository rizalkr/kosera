import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

// Geocoding interface
interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface GeocodingResponse {
  latitude: number;
  longitude: number;
  address: string;
}

// Simple rate limiting (in-memory store)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  clientData.count++;
  return true;
}

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    // Check if user has admin role
    if (request.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Admin role required for geocoding.' },
        { status: 403 }
      );
    }

    if (!address || address.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    // Rate limiting
    const clientId = request.user.userId.toString();
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Call Nominatim API for geocoding
    const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search');
    nominatimUrl.searchParams.set('q', address.trim());
    nominatimUrl.searchParams.set('format', 'json');
    nominatimUrl.searchParams.set('limit', '1');
    nominatimUrl.searchParams.set('addressdetails', '1');

    const geocodingResponse = await fetch(nominatimUrl.toString(), {
      headers: {
        'User-Agent': 'Kosera/1.0 (contact@kosera.com)', // Required by Nominatim
      },
    });

    if (!geocodingResponse.ok) {
      console.error('Nominatim API error:', geocodingResponse.status, geocodingResponse.statusText);
      return NextResponse.json(
        { success: false, error: 'Geocoding service temporarily unavailable' },
        { status: 503 }
      );
    }

    const results: GeocodingResult[] = await geocodingResponse.json();

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }

    const result = results[0];
    const response: GeocodingResponse = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: result.display_name,
    };

    // Validate coordinates
    if (isNaN(response.latitude) || isNaN(response.longitude)) {
      return NextResponse.json(
        { success: false, error: 'Invalid coordinates received from geocoding service' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Geocoding successful',
      data: response,
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    
    // Handle specific fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { success: false, error: 'Unable to connect to geocoding service' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error during geocoding' },
      { status: 500 }
    );
  }
});
