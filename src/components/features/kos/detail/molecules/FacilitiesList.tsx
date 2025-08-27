import React from 'react';

export interface FacilitiesListProps {
  facilities: string | undefined;
}

export const FacilitiesList: React.FC<FacilitiesListProps> = ({ facilities }) => {
  if (!facilities) return null;
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Fasilitas</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {facilities.split(',').map((facility: string, index: number) => (
          <div key={index} className="flex items-center gap-2 text-gray-600">
            <span className="text-green-500">✓</span>
            <span>{facility.trim()}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
