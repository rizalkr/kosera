'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthToken } from '../auth/useAuthToken';
import { adminApi, type AnalyticsData, type UsersData, type BookingsData } from '@/lib/api/admin';

// Derived types for internal stats
interface DashboardStats {
  totalUsers: number;
  totalKos: number;
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  averageRating: number;
}

interface RecentActivity {
  id: string;
  type: 'user_register' | 'kos_added' | 'booking_made' | 'kos_updated';
  message: string;
  time: string;
  user: string;
}

// Utility helpers kept outside hook to preserve referential stability
const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  return `${diffDays} hari yang lalu`;
};

const getTimeFromRelative = (relativeTime: string): number => {
  if (relativeTime === 'Baru saja') return 0;
  const match = relativeTime.match(/(\d+)\s+(menit|jam|hari)/);
  if (!match) return 0;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 'menit': return value;
    case 'jam': return value * 60;
    case 'hari': return value * 60 * 24;
    default: return 0;
  }
};

export const useAdminDashboard = () => {
  const { token, isValidAuthenticated } = useAuthToken();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [users, setUsers] = useState<UsersData | null>(null);
  const [bookings, setBookings] = useState<BookingsData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetchers using validated api ---
  const fetchAnalytics = useCallback(async () => {
    if (!isValidAuthenticated || !token) throw new Error('No valid token for analytics');
    const result = await adminApi.getAnalytics();
    if (result.success && result.data) setAnalytics(result.data);
    else throw new Error(result.error || 'Failed analytics');
  }, [isValidAuthenticated, token]);

  const fetchUsers = useCallback(async () => {
    if (!isValidAuthenticated || !token) throw new Error('No valid token for users');
    const result = await adminApi.getUsers();
    if (result.data) setUsers(result.data);
  }, [isValidAuthenticated, token]);

  const fetchBookings = useCallback(async () => {
    if (!isValidAuthenticated || !token) throw new Error('No valid token for bookings');
    const result = await adminApi.getBookings(100);
    if (result.success && result.data) setBookings(result.data);
    else throw new Error(result.error || 'Failed bookings');
  }, [isValidAuthenticated, token]);

  // --- Derived calculations ---
  const calculateStats = useCallback(() => {
    const defaultStats: DashboardStats = {
      totalUsers: 0,
      totalKos: 0,
      totalBookings: 0,
      totalRevenue: 0,
      activeUsers: 0,
      averageRating: 0,
    };

    if (!analytics && !users && !bookings) {
      setStats(defaultStats);
      return;
    }

    const totalUsers = users?.users?.length ?? 0;
    const totalKos = analytics?.overview?.totalKos ?? 0;
    const totalBookings = bookings?.pagination?.total ?? 0;

    const totalRevenue = (bookings?.bookings ?? [])
      .filter(b => b.status === 'CONFIRMED')
      .reduce((sum, b) => sum + (b.totalPrice ?? 0), 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = (users?.users ?? []).filter(u => new Date(u.createdAt) >= thirtyDaysAgo).length;

    const averageRating = Number(analytics?.overview?.averageRating) || 0;

    setStats({ totalUsers, totalKos, totalBookings, totalRevenue, activeUsers, averageRating });
  }, [analytics, users, bookings]);

  const generateRecentActivities = useCallback(() => {
    const activities: RecentActivity[] = [];

    if (users?.users) {
      users.users
        .slice() // shallow copy
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
        .forEach(user => {
          activities.push({
            id: `user_${user.id}`,
            type: 'user_register',
            message: 'Pengguna baru mendaftar',
            time: getRelativeTime(user.createdAt),
            user: user.username,
          });
        });
    }

    if (analytics?.recentActivity) {
      analytics.recentActivity.slice(0, 3).forEach((activity, index) => {
        activities.push({
          id: `kos_${index}`,
          type: 'kos_updated',
          message: `Kos "${activity.kosName}" diperbarui`,
          time: getRelativeTime(activity.updatedAt),
          user: 'System',
        });
      });
    }

    if (bookings?.bookings) {
      bookings.bookings
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
        .forEach(booking => {
          activities.push({
            id: `booking_${booking.id}`,
            type: 'booking_made',
            message: `Booking baru untuk "${booking.kos.name}"`,
            time: getRelativeTime(booking.createdAt),
            user: booking.user?.username || 'Unknown',
          });
        });
    }

    activities.sort((a, b) => getTimeFromRelative(a.time) - getTimeFromRelative(b.time));
    setRecentActivities(activities.slice(0, 8));
  }, [analytics, users, bookings]);

  const refreshData = useCallback(async () => {
    if (!isValidAuthenticated || !token) {
      setLoading(false);
      setError('No valid authentication token');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled([
        fetchAnalytics(),
        fetchUsers(),
        fetchBookings(),
      ]);

      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        // Use first error message for display
        const reason = (failed[0] as PromiseRejectedResult).reason as Error;
        setError(reason.message || 'Some requests failed');
      }
    } catch (e) {
      setError((e as Error).message || 'Failed to refresh dashboard data');
    } finally {
      setLoading(false);
    }
  }, [isValidAuthenticated, token, fetchAnalytics, fetchUsers, fetchBookings]);

  useEffect(() => {
    if (isValidAuthenticated && token) {
      void refreshData();
    } else {
      setLoading(false);
    }
  }, [isValidAuthenticated, token, refreshData]);

  useEffect(() => {
    calculateStats();
    generateRecentActivities();
  }, [calculateStats, generateRecentActivities]);

  return { analytics, users, bookings, stats, recentActivities, loading, error, refreshData };
};
