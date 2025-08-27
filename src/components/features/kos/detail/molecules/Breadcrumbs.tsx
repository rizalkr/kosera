import Link from 'next/link';
import React from 'react';

export interface BreadcrumbsProps {
  kosName: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ kosName }) => (
  <nav className="mb-6" aria-label="Breadcrumb">
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <Link href="/" className="hover:text-blue-600">Beranda</Link>
      <span>›</span>
      <Link href="/list" className="hover:text-blue-600">Daftar Kos</Link>
      <span>›</span>
      <span className="text-gray-800" aria-current="page">{kosName}</span>
    </div>
  </nav>
);
