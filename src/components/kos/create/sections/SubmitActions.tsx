import React from 'react';

export interface SubmitActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export const SubmitActions: React.FC<SubmitActionsProps> = ({ isSubmitting, onCancel }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
      <button type="button" onClick={onCancel} className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors" disabled={isSubmitting}>Batal</button>
      <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Menyimpan...
          </div>
        ) : 'Simpan Kos'}
      </button>
    </div>
  );
};
