import React from 'react';

export interface ActivityItemData {
  id: string | number;
  type: string;
  message: string;
  user: string;
  time: string;
}

export interface ActivityItemProps {
  activity: ActivityItemData;
  icon: string;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, icon }) => (
  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
    <div className="text-2xl" aria-hidden>{icon}</div>
    <div className="flex-1">
      <p className="text-sm text-gray-800">{activity.message}</p>
      <p className="text-xs text-gray-500">oleh {activity.user}</p>
    </div>
    <div className="text-right">
      <p className="text-xs text-gray-500">{activity.time}</p>
    </div>
  </div>
);
