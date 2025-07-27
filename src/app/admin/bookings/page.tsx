import { Suspense } from 'react';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';
import BookingAdminClient from './BookingAdminClient';

export default async function AdminBookingPage({ searchParams }: { searchParams: any }) {
  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<div>Loading bookings...</div>}>
            <BookingAdminClient searchParams={searchParams} />
          </Suspense>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}