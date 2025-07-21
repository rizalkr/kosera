'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthToken } from './useAuthToken';

type AnalyticsData = {
  overview: {
    totalKos: number;
    totalViews: number;
    totalFavorites: number;
    averageRating: number;
    totalReviews: number;
  };
  topPerforming: Array<{
    id: number;
    name: string;
    city: string;
    title: string;
    price: number;
    viewCount: number;
    favoriteCount: number;
    averageRating: number;
    reviewCount: number;
    qualityScore: number;
    owner: {
      name: string;
      username: string;
    };
  }>;
  cityDistribution: Array<{
    city: string;
    kosCount: number;
    averagePrice: number;
    totalViews: number;
  }>;
  priceStatistics: {
    minPrice: number;
    maxPrice: number;
    averagePrice: number;
    medianPrice: number;
  };
  featuredStatistics: {
    totalFeatured: number;
    averageFeaturedViews: number;
    averageFeaturedRating: number;
  };
  recentActivity: Array<{
    kosName: string;
    city: string;
    viewCount: number;
    favoriteCount: number;
    updatedAt: string;
  }>;
  generatedAt: string;
};

type UserData = {
  users: Array<{
    id: number;
    name: string;
    username: string;
    contact: string;
    role: string;
    createdAt: string;
  }>;
};

type BookingData = {
  bookings: Array<{
    id: number;
    status: string;
    totalPrice: number;
    createdAt: string;
    user?: {
      name: string;
      username: string;
    };
    kos: {
      name: string;
      city: string;
    };
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type DashboardStats = {
  totalUsers: number;
  totalKos: number;
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  averageRating: number;
};

type RecentActivity = {
  id: string;
  type: 'user_register' | 'kos_added' | 'booking_made' | 'kos_updated';
  message: string;
  time: string;
  user: string;
};

export function useAdminDashboard() {
  const { token, isValidAuthenticated } = useAuthToken();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [users, setUsers] = useState<UserData | null>(null);
  const [bookings, setBookings] = useState<BookingData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!isValidAuthenticated || !token) {
      throw new Error('No valid token for analytics');
    }

    console.log('Fetching analytics...');
    const response = await fetch('/api/admin/analytics', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Analytics fetch failed:', response.status, errorText);
      throw new Error(`Failed to fetch analytics: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Analytics result:', result);
    
    if (result.success) {
      setAnalytics(result.data);
    } else {
      throw new Error(result.error || 'Failed to fetch analytics');
    }
  }, [isValidAuthenticated, token]);

  const fetchUsers = useCallback(async () => {
    if (!isValidAuthenticated || !token) {
      throw new Error('No valid token for users');
    }

    console.log('Fetching users...');
    const response = await fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Users fetch failed:', response.status, errorText);
      throw new Error(`Failed to fetch users: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Users result:', result);
    setUsers(result);
  }, [isValidAuthenticated, token]);

  const fetchBookings = useCallback(async () => {
    if (!isValidAuthenticated || !token) {
      throw new Error('No valid token for bookings');
    }

    console.log('Fetching bookings...');
    const response = await fetch('/api/bookings?limit=100', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bookings fetch failed:', response.status, errorText);
      throw new Error(`Failed to fetch bookings: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Bookings result:', result);
    
    if (result.success) {
      setBookings(result.data);
    } else {
      throw new Error(result.error || 'Failed to fetch bookings');
    }
  }, [isValidAuthenticated, token]);

  // Calculate dashboard statistics from fetched data
  const calculateStats = useCallback(() => {
    console.log('Calculating stats...', { analytics: !!analytics, users: !!users, bookings: !!bookings });
    
    // Provide default stats even if some data is missing
    const defaultStats = {
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

    const totalUsers = users?.users?.length || 0;
    const totalKos = analytics?.overview?.totalKos || 0;
    const totalBookings = bookings?.pagination?.total || 0;
    
    // Calculate total revenue from confirmed bookings
    const totalRevenue = bookings?.bookings
      ?.filter(booking => booking.status === 'CONFIRMED')
      ?.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0) || 0;

    // Calculate active users (users who registered in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = users?.users?.filter(user => 
      new Date(user.createdAt) >= thirtyDaysAgo
    ).length || 0;

    const averageRating = Number(analytics?.overview?.averageRating) || 0;

    const newStats = {
      totalUsers,
      totalKos,
      totalBookings,
      totalRevenue,
      activeUsers,
      averageRating,
    };

    console.log('Calculated stats:', newStats);
    setStats(newStats);
  }, [analytics, users, bookings]);

  // Generate recent activities from fetched data
  const generateRecentActivities = useCallback(() => {
    console.log('Generating recent activities...', { analytics: !!analytics, users: !!users, bookings: !!bookings });
    
    const activities: RecentActivity[] = [];

    // Add recent user registrations
    if (users?.users) {
      const recentUsers = users.users
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

      recentUsers.forEach((user) => {
        activities.push({
          id: `user_${user.id}`,
          type: 'user_register',
          message: 'Pengguna baru mendaftar',
          time: getRelativeTime(user.createdAt),
          user: user.username,
        });
      });
    }

    // Add recent kos updates
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

    // Add recent bookings
    if (bookings?.bookings) {
      const recentBookings = bookings.bookings
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

      recentBookings.forEach((booking) => {
        activities.push({
          id: `booking_${booking.id}`,
          type: 'booking_made',
          message: `Booking baru untuk "${booking.kos.name}"`,
          time: getRelativeTime(booking.createdAt),
          user: booking.user?.username || 'Unknown',
        });
      });
    }

    // Sort by time and take the most recent 8 activities
    activities.sort((a, b) => {
      const timeA = getTimeFromRelative(a.time);
      const timeB = getTimeFromRelative(b.time);
      return timeA - timeB;
    });

    console.log('Generated activities:', activities.slice(0, 8));
    setRecentActivities(activities.slice(0, 8));
  }, [analytics, users, bookings]);

  // Helper function to get relative time
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

  // Helper function to convert relative time back to number for sorting
  const getTimeFromRelative = (relativeTime: string): number => {
    if (relativeTime === 'Baru saja') return 0;
    
    const match = relativeTime.match(/(\d+)\s+(menit|jam|hari)/);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'menit': return value;
      case 'jam': return value * 60;
      case 'hari': return value * 60 * 24;
      default: return 0;
    }
  };

  const refreshData = useCallback(async () => {
    if (!isValidAuthenticated || !token) {
      setLoading(false);
      setError('No valid authentication token');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting dashboard data fetch...');
      
      const results = await Promise.allSettled([
        fetchAnalytics(),
        fetchUsers(),
        fetchBookings(),
      ]);

      // Check if any critical API failed
      const failedResults = results.filter(result => result.status === 'rejected');
      if (failedResults.length > 0) {
        console.error('Some API calls failed:', failedResults);
        // Continue with partial data if some succeeded
      }

      console.log('Dashboard data fetch completed');
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh dashboard data');
    } finally {
      setLoading(false);
    }
  }, [isValidAuthenticated, token, fetchAnalytics, fetchUsers, fetchBookings]);

  useEffect(() => {
    console.log('useAdminDashboard useEffect triggered, token:', !!token, 'isValidAuthenticated:', isValidAuthenticated);
    if (isValidAuthenticated && token) {
      refreshData();
    } else {
      setLoading(false);
    }
  }, [isValidAuthenticated, token, refreshData]); // Include refreshData since it's memoized

  useEffect(() => {
    calculateStats();
    generateRecentActivities();
  }, [calculateStats, generateRecentActivities]);

  return {
    analytics,
    users,
    bookings,
    stats,
    recentActivities,
    loading,
    error,
    refreshData,
  };
}
