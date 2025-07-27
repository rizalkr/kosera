'use client';

import { useState } from 'react';
import { useAdminBooking } from '@/hooks/admin/useAdminBooking';

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

  const { data: bookings, loading, error, pagination, refetch } = useAdminBooking({
    page: currentPage,
    limit: bookingsPerPage,
    status: status !== 'all' ? status : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    searchQuery: searchQuery || undefined,
  });

  const handleFilterChange = (type: string, value: string) => {
    if (type === 'status') setStatus(value);
    if (type === 'search') setSearchQuery(value);
    if (type === 'startDate') setStartDate(value);
    if (type === 'endDate') setEndDate(value);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Manage Bookings</h1>
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
      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading bookings...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : (
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
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.checkInDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.checkOutDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {booking.totalPrice.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{booking.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Pagination */}
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
}