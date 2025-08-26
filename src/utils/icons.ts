// src/utils/icons.ts
// Icon related helpers

export type ActivityType = 'kos' | 'booking' | 'revenue' | 'view' | 'favorite';

/**
 * Map activity types to an emoji/icon
 */
export const getActivityIcon = (type: ActivityType): string => {
  const map: Record<ActivityType, string> = {
    kos: '🏠',
    booking: '📋',
    revenue: '💰',
    view: '👁️',
    favorite: '❤️',
  };
  return map[type] ?? 'ℹ️';
};
