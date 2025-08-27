import React from 'react';

export interface UsersErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

export const UsersErrorState: React.FC<UsersErrorStateProps> = ({ error, onRetry }) => (
  <div className="p-6 text-center">
    <div className="text-red-700 text-xl mb-4">❌</div>
    <p className="text-red-600 mb-4">{error}</p>
    <button onClick={onRetry} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Coba Lagi</button>
  </div>
);
