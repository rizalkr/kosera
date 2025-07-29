import { FC } from 'react';
import { AdminBookingStatus } from '@/hooks/admin/useAdminUpdateBookingStatus';
import { clsx } from 'clsx';

export interface BookingStatusDropdownProps {
  value: AdminBookingStatus;
  onChange: (status: AdminBookingStatus) => void;
  disabled?: boolean;
}

/**
 * Dropdown for admin to update booking status.
 * @param value - Current booking status
 * @param onChange - Callback when status changes
 * @param disabled - Disable the dropdown
 */
export const BookingStatusDropdown: FC<BookingStatusDropdownProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const statuses: AdminBookingStatus[] = [
    'pending',
    'confirmed',
    'cancelled',
    'completed',
  ];

  return (
    <select
      className={clsx(
        'px-2 py-1 rounded border border-gray-300 text-sm bg-white text-gray-500',
        disabled && 'opacity-60 cursor-not-allowed'
      )}
      value={value}
      onChange={e => onChange(e.target.value as AdminBookingStatus)}
      disabled={disabled}
      data-testid="booking-status-dropdown"
    >
      {statuses.map(status => (
        <option key={status} value={status}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </option>
      ))}
    </select>
    );
};