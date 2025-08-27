import React from 'react';

export const UsersLoadingState: React.FC = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
      <p className="text-gray-600">Memuat data users...</p>
    </div>
  </div>
);
