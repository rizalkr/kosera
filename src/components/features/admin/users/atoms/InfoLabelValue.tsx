import React from 'react';

export interface InfoLabelValueProps {
  label: string;
  value: React.ReactNode;
}

export const InfoLabelValue: React.FC<InfoLabelValueProps> = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
    <p className="text-gray-900">{value}</p>
  </div>
);
