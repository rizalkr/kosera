'use client';

import { useState, useEffect } from 'react';
import { KosData } from '../lib/api';
import { useCreateBooking } from '../hooks/useApi';
import { showCustomAlert, showError } from '../lib/sweetalert';

interface BookingModalProps {
  kos: KosData;
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated?: () => void;
}

interface BookingDetails {
  startDate: string;
  duration: number;
  notes: string;
  contactMethod: 'whatsapp' | 'phone';
}

export default function BookingModal({ kos, isOpen, onClose, onBookingCreated }: BookingModalProps) {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    startDate: '',
    duration: 1,
    notes: '',
    contactMethod: 'whatsapp'
  });
  
  const [shouldRedirectOnReturn, setShouldRedirectOnReturn] = useState(false);
  const createBookingMutation = useCreateBooking();

  // Handle page visibility change for auto-redirect when user returns from WhatsApp
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && shouldRedirectOnReturn) {
        setShouldRedirectOnReturn(false);
        
        // Small delay to ensure user has settled back
        setTimeout(async () => {
          const result = await showCustomAlert(`
            <div class="text-center">
              <h3 class="text-lg font-semibold mb-2">🎉 Selamat datang kembali!</h3>
              <p class="mb-4">Booking Anda sudah berhasil dibuat dengan status PENDING.</p>
              <p>Apakah Anda ingin melihat detail booking di dashboard?</p>
            </div>
          `, '', 'success');
          
          if (result.isConfirmed) {
            window.location.href = '/renter/bookings';
          }
        }, 1000);
      }
    };

    if (shouldRedirectOnReturn) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shouldRedirectOnReturn]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate end date
    const startDate = new Date(bookingDetails.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + bookingDetails.duration);
    
    // Calculate total price
    const totalPrice = kos.price * bookingDetails.duration;
    
    try {
      // Create booking in database first
      const bookingData = {
        kosId: kos.id,
        checkInDate: bookingDetails.startDate,
        duration: bookingDetails.duration,
        notes: bookingDetails.notes || undefined
      };
      
      await createBookingMutation.mutateAsync(bookingData);
      
      console.log('Booking created successfully:', bookingData);
      
      // Call callback if provided
      if (onBookingCreated) {
        onBookingCreated();
      }
      
      if (bookingDetails.contactMethod === 'whatsapp') {
        // Create WhatsApp message
        const message = `Halo, saya tertarik untuk booking kos:

*${kos.name}*
Alamat: ${kos.address}, ${kos.city}
Harga: Rp ${kos.price.toLocaleString()}/bulan

*Detail Booking:*
Tanggal Mulai: ${startDate.toLocaleDateString('id-ID')}
Tanggal Berakhir: ${endDate.toLocaleDateString('id-ID')}
Durasi: ${bookingDetails.duration} bulan
Total Biaya: Rp ${totalPrice.toLocaleString()}

${bookingDetails.notes ? `*Catatan:*\n${bookingDetails.notes}` : ''}

Mohon informasi lebih lanjut untuk proses booking. Booking sudah dibuat di sistem dengan status pending. Terima kasih!`;

        // Format phone number for WhatsApp (ensure it starts with country code)
        let ownerPhone = kos.owner?.contact || '6281234567890';
        if (ownerPhone.startsWith('0')) {
          ownerPhone = '62' + ownerPhone.substring(1);
        } else if (!ownerPhone.startsWith('62')) {
          ownerPhone = '62' + ownerPhone;
        }
        
        const whatsappUrl = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(message)}`;
        
        // Open WhatsApp in new tab/window
        window.open(whatsappUrl, '_blank');
        
        // Set flag to redirect when user returns to this tab
        setShouldRedirectOnReturn(true);
        
        // Close modal immediately
        onClose();
        
        // Fallback: Show notification after some time if visibility API doesn't work
        setTimeout(async () => {
          if (shouldRedirectOnReturn) {
            setShouldRedirectOnReturn(false);
            const result = await showCustomAlert(`
              <div class="text-center">
                <h3 class="text-lg font-semibold mb-2">✅ Booking berhasil dibuat dengan status PENDING!</h3>
                <p class="mb-4">WhatsApp sudah terbuka di tab baru untuk menghubungi pemilik kos.</p>
                <p>Apakah Anda ingin melihat booking Anda di dashboard?</p>
              </div>
            `, '', 'success');
            
            if (result.isConfirmed) {
              window.location.href = '/renter/bookings';
            }
          }
        }, 5000); // 5 second fallback
        
        return; // Early return to avoid executing onClose again
      } else {
        // Phone call
        const ownerPhone = kos.owner?.contact || '081234567890';
        window.open(`tel:${ownerPhone}`, '_self');
        
        // Close modal 
        onClose();
        
        // Show notification with option to go to bookings
        setTimeout(async () => {
          const result = await showCustomAlert(`
            <div class="text-center">
              <h3 class="text-lg font-semibold mb-2">✅ Booking berhasil dibuat dengan status PENDING!</h3>
              <p class="mb-2">Panggilan telepon akan tersambung ke pemilik kos.</p>
              <div class="text-left bg-gray-50 p-3 rounded-lg mb-4">
                <strong>Detail Booking:</strong><br>
                • Kos: ${kos.name}<br>
                • Tanggal Mulai: ${startDate.toLocaleDateString('id-ID')}<br>
                • Durasi: ${bookingDetails.duration} bulan<br>
                • Total: Rp ${totalPrice.toLocaleString()}
              </div>
              <p>Apakah Anda ingin melihat booking Anda di dashboard?</p>
            </div>
          `, '', 'success');
          
          if (result.isConfirmed) {
            window.location.href = '/renter/bookings';
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error creating booking:', error);
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      showError('Gagal membuat booking. Silakan coba lagi. Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const minDate = new Date().toISOString().split('T')[0];
  const totalPrice = kos.price * bookingDetails.duration;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Booking Kos</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Kos Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">{kos.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{kos.address}, {kos.city}</p>
            <div className="flex items-center justify-between">
              <p className="text-blue-600 font-bold text-lg">Rp {kos.price.toLocaleString()}/bulan</p>
              {kos.owner && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Pemilik:</p>
                  <p className="text-sm font-medium text-gray-700">{kos.owner.name}</p>
                </div>
              )}
            </div>
            {kos.averageRating && parseFloat(kos.averageRating) > 0 && (
              <div className="flex items-center mt-2">
                <span className="text-yellow-400 mr-1">★</span>
                <span className="text-sm text-gray-600">
                  {parseFloat(kos.averageRating).toFixed(1)} ({kos.reviewCount} ulasan)
                </span>
              </div>
            )}
          </div>

          {/* Facilities Preview */}
          {kos.facilities && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Fasilitas Tersedia:</h4>
              <div className="flex flex-wrap gap-2">
                {kos.facilities.split(',').slice(0, 6).map((facility, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {facility.trim()}
                  </span>
                ))}
                {kos.facilities.split(',').length > 6 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{kos.facilities.split(',').length - 6} lainnya
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai Sewa
              </label>
              <input
                type="date"
                min={minDate}
                value={bookingDetails.startDate}
                onChange={(e) => setBookingDetails({
                  ...bookingDetails,
                  startDate: e.target.value
                })}
                className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durasi Sewa
              </label>
              <select
                value={bookingDetails.duration}
                onChange={(e) => setBookingDetails({
                  ...bookingDetails,
                  duration: parseInt(e.target.value)
                })}
                className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value={1}>1 Bulan</option>
                <option value={2}>2 Bulan</option>
                <option value={3}>3 Bulan</option>
                <option value={6}>6 Bulan</option>
                <option value={12}>12 Bulan</option>
              </select>
            </div>

            {/* Contact Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metode Kontak
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="whatsapp"
                    checked={bookingDetails.contactMethod === 'whatsapp'}
                    onChange={(e) => setBookingDetails({
                      ...bookingDetails,
                      contactMethod: e.target.value as 'whatsapp'
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-500">WhatsApp</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="phone"
                    checked={bookingDetails.contactMethod === 'phone'}
                    onChange={(e) => setBookingDetails({
                      ...bookingDetails,
                      contactMethod: e.target.value as 'phone'
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-500">Telepon</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan (Opsional)
              </label>
              <textarea
                value={bookingDetails.notes}
                onChange={(e) => setBookingDetails({
                  ...bookingDetails,
                  notes: e.target.value
                })}
                rows={3}
                placeholder="Tambahkan catatan atau pertanyaan khusus..."
                className="w-full text-gray-500 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Ringkasan Booking</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Harga per bulan:</span>
                  <span className="font-medium text-gray-500">Rp {kos.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Durasi:</span>
                  <span className="font-medium text-gray-500">{bookingDetails.duration} bulan</span>
                </div>
                <div className="border-t border-blue-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-semibold">Total Biaya:</span>
                    <span className="font-bold text-blue-600">Rp {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                disabled={createBookingMutation.isPending}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!bookingDetails.startDate || createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Membuat Booking...
                  </div>
                ) : (
                  bookingDetails.contactMethod === 'whatsapp' 
                    ? 'Hubungi via WhatsApp' 
                    : 'Hubungi via Telepon'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
