import { AdminUser } from '@/lib/api/admin';

export interface UserActionButtonsProps {
  /** User id retained if needed for future analytics */
  userId?: AdminUser['id'];
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  deleting?: boolean;
}

/** Action buttons for user detail page */
export const UserActionButtons = ({ onEdit, onDelete, onBack, deleting }: UserActionButtonsProps) => (
  <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
    <button onClick={onEdit} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
      <span>✏️</span>Edit User
    </button>
    <button onClick={onDelete} disabled={deleting} className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
      <span>🗑️</span>{deleting ? 'Menghapus...' : 'Hapus User'}
    </button>
    <button onClick={onBack} className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
      <span>←</span>Kembali ke Daftar
    </button>
  </div>
);
