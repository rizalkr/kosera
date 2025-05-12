'use client';
import { useState } from 'react';

export default function FilterBar({ onFilter }: { onFilter?: (filter: string) => void }) {
  const [option, setOption] = useState('Kamar mandi dalam');
  const handleSearch = () => onFilter?.(option);

  return (
    <div className="flex items-center gap-4 text-gray-700 bg-[#E1F6F2] border border-blue-100 rounded-xl shadow p-4">
      <div className="flex items-center border px-3 py-2 rounded">
        <img src="/icons/filter.svg" alt="" className="w-5 h-5 mr-2" />
        <select value={option} onChange={e => setOption(e.target.value)} className="outline-none">
          <option>Kamar mandi dalam</option>
          <option>Full Furnished</option>
          <option>AC</option>
        </select>
      </div>
      <button onClick={handleSearch} className="bg-[#F3D17C] text-white px-4 py-2 rounded">Search</button>
    </div>
  );
}
