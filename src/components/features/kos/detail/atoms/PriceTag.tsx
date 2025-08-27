import React from 'react';

export interface PriceTagProps {
  price: number;
  period?: string;
}

export const PriceTag: React.FC<PriceTagProps> = ({ price, period = 'bulan' }) => (
  <div className="text-3xl font-bold text-blue-600">
    Rp {price.toLocaleString('id-ID')}<span className="text-lg text-gray-500">/{period}</span>
  </div>
);
