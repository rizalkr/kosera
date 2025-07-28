import { Suspense } from 'react';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';
import BookingAdminClient from './BookingAdminClient';

interface SearchParams {
  page?: string;
  limit?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export default async function AdminBookingPage({ 
  searchParams 
}: { 
  searchParams: Promise<SearchParams> 
}) {
  // Await the searchParams before using them
  const resolvedSearchParams = await searchParams;

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<div>Loading bookings...</div>}>
            <BookingAdminClient searchParams={resolvedSearchParams} />
          </Suspense>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}