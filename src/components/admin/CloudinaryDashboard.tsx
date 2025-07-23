'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProtectedAction } from '@/hooks/useProtectedAction';
import { useAuth } from '@/contexts/AuthContext';

interface CloudinaryUsage {
  account: {
    cloud_name: string;
    plan: string;
    status: string;
  };
  storage: {
    used: number;
    limit: number;
    usagePercent: number;
    unit: string;
  };
  bandwidth: {
    used: number;
    limit: number;
    usagePercent: number;
    unit: string;
  };
  resources: {
    count: number;
    images: number;
  };
  credits: number | null;
  transformations: number;
  recommendations: Array<{
    type: 'warning' | 'info' | 'success';
    title: string;
    message: string;
    action: string;
  }>;
}

export const CloudinaryDashboard = () => {
  const [usage, setUsage] = useState<CloudinaryUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { executeProtectedAction } = useProtectedAction();
  const { token } = useAuth();

  const fetchUsage = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    executeProtectedAction(async () => {
      try {
        const response = await fetch('/api/admin/cloudinary/usage', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch Cloudinary usage');
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch usage data');
        }

        setUsage(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch Cloudinary usage data');
      } finally {
        setLoading(false);
      }
    }, {
      message: 'You need to be logged in to view Cloudinary dashboard',
      showToast: true
    });
  }, [executeProtectedAction, token]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'text-red-600 bg-red-100';
    if (percent >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-red-500 text-xl mr-3">❌</span>
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={fetchUsage}
              className="mt-2 text-red-600 hover:text-red-700 underline text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">No usage data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">☁️</span>
          Account Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{usage.account.cloud_name}</div>
            <div className="text-sm text-blue-800">Cloud Name</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{usage.account.plan}</div>
            <div className="text-sm text-green-800">Plan Type</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{usage.account.status}</div>
            <div className="text-sm text-purple-800">Status</div>
          </div>
        </div>
      </div>

      {/* Usage Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Usage */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">💾</span>
            Storage Usage
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Used</span>
              <span className="font-medium">{usage.storage.used.toFixed(2)} {usage.storage.unit}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Limit</span>
              <span className="font-medium">{usage.storage.limit.toFixed(2)} {usage.storage.unit}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  usage.storage.usagePercent >= 90 ? 'bg-red-500' :
                  usage.storage.usagePercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(usage.storage.usagePercent, 100)}%` }}
              ></div>
            </div>
            
            <div className={`text-center py-2 px-4 rounded-lg ${getUsageColor(usage.storage.usagePercent)}`}>
              <span className="font-semibold">{usage.storage.usagePercent.toFixed(1)}%</span>
              <span className="text-sm ml-1">used</span>
            </div>
          </div>
        </div>

        {/* Bandwidth Usage */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🌐</span>
            Bandwidth Usage
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Used</span>
              <span className="font-medium">{usage.bandwidth.used.toFixed(2)} {usage.bandwidth.unit}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Limit</span>
              <span className="font-medium">{usage.bandwidth.limit.toFixed(2)} {usage.bandwidth.unit}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  usage.bandwidth.usagePercent >= 90 ? 'bg-red-500' :
                  usage.bandwidth.usagePercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(usage.bandwidth.usagePercent, 100)}%` }}
              ></div>
            </div>
            
            <div className={`text-center py-2 px-4 rounded-lg ${getUsageColor(usage.bandwidth.usagePercent)}`}>
              <span className="font-semibold">{usage.bandwidth.usagePercent.toFixed(1)}%</span>
              <span className="text-sm ml-1">used</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Resource Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{usage.resources.count.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Resources</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{usage.resources.images.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Derived Images</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{usage.transformations.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Transformations</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {usage.credits ? usage.credits.toLocaleString() : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Credits</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {usage.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Recommendations
          </h3>
          
          <div className="space-y-3">
            {usage.recommendations.map((rec, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  rec.type === 'info' ? 'bg-blue-50 border-blue-200' :
                  'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-start">
                  <span className="text-xl mr-3">{getRecommendationIcon(rec.type)}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <p className="text-gray-600 text-sm mt-1">{rec.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
