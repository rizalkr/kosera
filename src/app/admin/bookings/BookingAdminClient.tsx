'use client';

import { useState } from 'react';
import { useAdminBooking } from '@/hooks/admin/useAdminBooking';
import { useDebounce } from '@/hooks/useDebounce';
import { AdminBookingStatus, useAdminUpdateBookingStatus } from '@/hooks/admin/useAdminBookingStatus';
import { BookingStatusDropdown } from '@/components/dashboard/bookings/BookingStatusDropdown';
import { clsx } from 'clsx';
// 1. Impor fungsi showConfirm dan showToast dari sweetalert
import { showError, showConfirm, showToast } from '@/lib/sweetalert';

interface BookingSearchParams {
  page?: string;
  limit?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

interface BookingAdminClientProps {
  searchParams: BookingSearchParams;
}

export default function BookingAdminClient({ searchParams }: BookingAdminClientProps) {
  const [status, setStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const debouncedStatus = useDebounce(status, 300);
  const debouncedStartDate = useDebounce(startDate, 300);
  const debouncedEndDate = useDebounce(endDate, 300);

  const { data: bookings, loading, error, pagination, refetch } = useAdminBooking({
    page: currentPage,
    limit: bookingsPerPage,
    status: debouncedStatus !== 'all' ? debouncedStatus : undefined,
    startDate: debouncedStartDate || undefined,
    endDate: debouncedEndDate || undefined,
    searchQuery: debouncedSearchQuery || undefined,
  });

  const { trigger: updateStatus, isMutating } = useAdminUpdateBookingStatus();

  const handleFilterChange = (type: string, value: string) => {
    if (type === 'status') setStatus(value);
    if (type === 'search') setSearchQuery(value);
    if (type === 'startDate') setStartDate(value);
    if (type === 'endDate') setEndDate(value);
    setCurrentPage(1);
  };

  // 2. Buat satu fungsi handler untuk dipanggil di dalam loop
  const handleStatusChange = async (bookingId: number, newStatus: AdminBookingStatus) => {
    // Tampilkan dialog konfirmasi
    const confirmation = await showConfirm(
      `Anda akan mengubah status booking #${bookingId} menjadi "${newStatus}". Lanjutkan?`,
      'Konfirmasi Perubahan Status'
    );

    // Batalkan jika admin tidak menekan "Ya"
    if (!confirmation.isConfirmed) {
      return;
    }

    setUpdatingId(bookingId);
    try {
      await updateStatus({
        bookingId: bookingId,
        status: newStatus,
      });

      // Tampilkan notifikasi toast jika berhasil
      showToast('Status booking berhasil diperbarui', 'success');
      
      refetch(); // Muat ulang data tabel
    } catch (err) {
      // Tampilkan notifikasi error jika gagal
      const errorMessage = (err as Error).message || 'Terjadi kesalahan tidak diketahui.';
      showError(`Gagal memperbarui status: ${errorMessage}`);
      console.error("Gagal update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* ... (kode filter dan header tidak berubah) ... */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-blue-600">Manage Bookings</h1>
        {loading && (
          <div className="flex items-center text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Updating...
          </div>
        )}
      </div>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">Search</label>
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
            placeholder="Search user or property..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">Status</label>
          <select
            value={status}
            onChange={e => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => handleFilterChange('startDate', e.target.value)}
            className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => handleFilterChange('endDate', e.target.value)}
            className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
          />
        </div>
      </div>
      {/* ... (kode loading, error, dan no bookings tidak berubah) ... */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-500">Loading bookings...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <div className="text-red-600 font-semibold mb-2">Failed to load bookings</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <button 
              onClick={() => refetch()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <div className="text-gray-600 font-semibold mb-2">No bookings found</div>
            <div className="text-gray-500">Try adjusting your filters or search criteria</div>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {bookings.length} of {pagination.totalCount} bookings
                </div>
                <div className="text-sm text-gray-500">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
              </div>
            </div>
            
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Check-In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Check-Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{booking.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{booking.user.name}</div>
                    <div className="text-xs text-gray-500">@{booking.user.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{booking.kos.name}</div>
                    <div className="text-xs text-gray-500">{booking.kos.city}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                          booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : booking.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        )}
                      >
                        {booking.status}
                      </span>
                      <BookingStatusDropdown
                        value={booking.status as AdminBookingStatus}
                        // 3. Panggil handler yang sudah dibuat
                        onChange={(newStatus) => handleStatusChange(booking.id, newStatus)}
                        disabled={isMutating && updatingId === booking.id}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.checkInDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.checkOutDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {booking.totalPrice.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{booking.createdAt}</td>
                </tr>
              ))}
            </tbody>
            </table>
          </>
        )}
      </div>
      {/* ... (kode pagination tidak berubah) ... */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={pagination.currentPage === 1}
              className="text-gray-500 px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ← Prev
            </button>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
              {pagination.currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="text-gray-500 px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};