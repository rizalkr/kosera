import React from 'react';
import { ActivityItem, ActivityItemData } from '../molecules/ActivityItem';

export interface RecentActivitiesPanelProps {
  activities: ActivityItemData[];
  getIcon: (type: string) => string;
}

export const RecentActivitiesPanel: React.FC<RecentActivitiesPanelProps> = ({ activities, getIcon }) => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h2>
    <div className="space-y-4">
      {activities.length > 0 ? (
        activities.map(activity => (
          <ActivityItem key={activity.id} activity={activity} icon={getIcon(activity.type)} />
        ))
      ) : (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">📋</div>
          <p>Belum ada aktivitas terbaru</p>
        </div>
      )}
    </div>
  </div>
);
