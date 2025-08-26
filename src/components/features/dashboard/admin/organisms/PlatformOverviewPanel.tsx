import React from 'react';
import { UserCompositionChart } from '@/components/features/dashboard/UserCompositionChart';

export interface PlatformOverviewPanelProps {
  totalViews: number | undefined;
  averageRating: number | undefined;
}

export const PlatformOverviewPanel: React.FC<PlatformOverviewPanelProps> = ({ totalViews, averageRating }) => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Ringkasan Platform</h2>
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-blue-600 mb-1">{totalViews?.toLocaleString() || '0'}</div>
        <div className="text-sm text-blue-500">Total Views</div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-green-600 mb-1">{averageRating ? averageRating.toFixed(1) : '0.0'}⭐</div>
        <div className="text-sm text-green-500">Rata-rata Rating</div>
      </div>
    </div>
    <div className="mt-25">
      <UserCompositionChart />
    </div>
  </div>
);
