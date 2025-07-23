'use client';

import { EnhancedCloudinaryDashboard } from '@/components/admin/EnhancedCloudinaryDashboard';

export default function AdminCloudinaryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ☁️ Cloudinary Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor usage, analyze resources, and optimize your image delivery
          </p>
        </div>
        
        <EnhancedCloudinaryDashboard />
      </div>
    </div>
  );
}
