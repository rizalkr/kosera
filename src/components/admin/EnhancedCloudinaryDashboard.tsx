'use client';

import { useState, useEffect } from 'react';
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

interface CloudinaryAnalytics {
  recentUploads: Array<{
    publicId: string;
    url: string;
    bytes: number;
    format: string;
    uploadedAt: string;
    dimensions: { width: number; height: number };
  }>;
  formatAnalysis: Record<string, { count: number; totalBytes: number }>;
  sizeAnalysis: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  optimizationSuggestions: Array<{
    type: 'format' | 'size' | 'compression';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    savings: string;
  }>;
  transformationUsage: {
    autoOptimization: number;
    formatConversion: number;
    resizing: number;
    qualityAdjustment: number;
  };
  databaseSync: {
    totalDbPhotos: number;
    photosWithCloudinaryId: number;
    orphanedPhotos: number;
    syncPercentage: number;
  };
}

export const EnhancedCloudinaryDashboard = () => {
  const [usage, setUsage] = useState<CloudinaryUsage | null>(null);
  const [analytics, setAnalytics] = useState<CloudinaryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'optimization'>('overview');
  const { token, isAuthenticated, user } = useAuth();

  const fetchData = async () => {
    if (!token || !isAuthenticated || user?.role !== 'ADMIN') {
      setError('Admin authentication required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch usage data
      const usageResponse = await fetch('/api/admin/cloudinary/usage', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!usageResponse.ok) {
        throw new Error('Failed to fetch Cloudinary usage');
      }

      const usageData = await usageResponse.json();
      if (!usageData.success) {
        throw new Error(usageData.error || 'Failed to fetch usage data');
      }
      setUsage(usageData.data);

      // Fetch analytics data
      const analyticsResponse = await fetch('/api/admin/cloudinary/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!analyticsResponse.ok) {
        throw new Error('Failed to fetch Cloudinary analytics');
      }

      const analyticsData = await analyticsResponse.json();
      if (!analyticsData.success) {
        throw new Error(analyticsData.error || 'Failed to fetch analytics data');
      }
      setAnalytics(analyticsData.data);
    } catch (error) {
      console.error('Error fetching Cloudinary data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch Cloudinary data');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'text-red-600 bg-red-100';
    if (percent >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
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
              onClick={fetchData}
              className="mt-2 text-red-600 hover:text-red-700 underline text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!usage || !analytics) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-3">☁️</span>
            Cloudinary Dashboard
          </h1>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'overview' as const, label: '📊 Overview', icon: '📊' },
            { id: 'analytics' as const, label: '📈 Analytics', icon: '📈' },
            { id: 'optimization' as const, label: '⚡ Optimization', icon: '⚡' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Account Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🏢</span>
              Account Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{analytics.databaseSync.syncPercentage.toFixed(1)}%</div>
                <div className="text-sm text-orange-800">DB Sync</div>
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
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <>
          {/* Recent Uploads */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📤</span>
              Recent Uploads
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Public ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dimensions</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics.recentUploads.map((upload, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <img 
                          src={upload.url} 
                          alt="" 
                          className="w-12 h-12 object-cover rounded"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm font-mono text-gray-600 max-w-xs truncate">
                        {upload.publicId}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {formatBytes(upload.bytes)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600 uppercase">
                        {upload.format}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {upload.dimensions.width} × {upload.dimensions.height}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {formatDate(upload.uploadedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Format Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📊</span>
                Format Distribution
              </h3>
              
              <div className="space-y-3">
                {Object.entries(analytics.formatAnalysis)
                  .sort(([,a], [,b]) => b.count - a.count)
                  .slice(0, 6)
                  .map(([format, data]) => (
                  <div key={format} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 uppercase w-12">
                        {format}
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        {data.count} files
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatBytes(data.totalBytes)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📏</span>
                Size Distribution
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Small (&lt; 500KB)</span>
                  <span className="text-sm font-medium text-green-600">{analytics.sizeAnalysis.small}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Medium (500KB - 2MB)</span>
                  <span className="text-sm font-medium text-yellow-600">{analytics.sizeAnalysis.medium}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Large (2MB - 5MB)</span>
                  <span className="text-sm font-medium text-orange-600">{analytics.sizeAnalysis.large}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">X-Large (&gt; 5MB)</span>
                  <span className="text-sm font-medium text-red-600">{analytics.sizeAnalysis.xlarge}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Database Sync Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🔄</span>
              Database Synchronization
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analytics.databaseSync.totalDbPhotos}</div>
                <div className="text-sm text-blue-800">Total DB Photos</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analytics.databaseSync.photosWithCloudinaryId}</div>
                <div className="text-sm text-green-800">With Cloudinary ID</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{analytics.databaseSync.orphanedPhotos}</div>
                <div className="text-sm text-red-800">Orphaned Photos</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{analytics.databaseSync.syncPercentage.toFixed(1)}%</div>
                <div className="text-sm text-purple-800">Sync Rate</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Optimization Tab */}
      {activeTab === 'optimization' && (
        <>
          {/* Optimization Suggestions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💡</span>
              Optimization Suggestions
            </h3>
            
            {analytics.optimizationSuggestions.length > 0 ? (
              <div className="space-y-4">
                {analytics.optimizationSuggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${getImpactColor(suggestion.impact)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getImpactColor(suggestion.impact)}`}>
                            {suggestion.impact} impact
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{suggestion.description}</p>
                        <p className="text-green-600 text-sm font-medium">💾 {suggestion.savings}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">✅</span>
                <p className="text-gray-600">Your images are well optimized!</p>
              </div>
            )}
          </div>

          {/* Transformation Usage */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              Transformation Usage
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analytics.transformationUsage.autoOptimization}</div>
                <div className="text-sm text-blue-800">Auto Optimization</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analytics.transformationUsage.formatConversion}</div>
                <div className="text-sm text-green-800">Format Conversion</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{analytics.transformationUsage.resizing}</div>
                <div className="text-sm text-purple-800">Resizing</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{analytics.transformationUsage.qualityAdjustment}</div>
                <div className="text-sm text-orange-800">Quality Adjustment</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {usage.recommendations.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🎯</span>
                Plan Recommendations
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
                      <span className="text-xl mr-3">
                        {rec.type === 'warning' ? '⚠️' : rec.type === 'info' ? 'ℹ️' : '✅'}
                      </span>
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
        </>
      )}
    </div>
  );
};
