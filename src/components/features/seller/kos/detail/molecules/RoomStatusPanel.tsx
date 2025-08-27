import React from 'react';

export interface RoomStatusPanelProps {
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  occupancyRate: number;
}

export const RoomStatusPanel: React.FC<RoomStatusPanelProps> = ({ totalRooms, occupiedRooms, vacantRooms, occupancyRate }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Kamar</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: '🛏️', value: totalRooms, label: 'Total Kamar', color: 'text-gray-900', ring: 'bg-blue-100' },
          { icon: '✅', value: occupiedRooms, label: 'Kamar Terisi', color: 'text-green-600', ring: 'bg-green-100' },
          { icon: '🆓', value: vacantRooms, label: 'Kamar Kosong', color: 'text-red-600', ring: 'bg-red-100' },
        ].map(item => (
          <div key={item.label} className="text-center">
            <div className={`w-16 h-16 ${item.ring} rounded-full flex items-center justify-center mx-auto mb-3`}>
              <span className="text-2xl">{item.icon}</span>
            </div>
            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            <div className="text-sm text-gray-600">{item.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Tingkat Hunian</span>
          <span className="text-sm font-semibold text-gray-900">{occupancyRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${occupancyRate}%` }} />
        </div>
      </div>
    </div>
  );
};
