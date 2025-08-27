import React from 'react';

export const SellerKosDetailLoading: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-lg p-8">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-300 rounded mb-6 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-gray-300 rounded-lg" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-4 bg-gray-300 rounded" />)}
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-gray-300 rounded-lg" />)}
        </div>
      </div>
    </div>
  </div>
);
