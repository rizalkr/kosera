'use client';
import { useState, useEffect } from 'react';
import { SearchParams } from '@/lib/api';
import { useFiltersDebounce } from '@/hooks/useDebounce';

interface FilterBarProps {
  onFilter?: (filters: SearchParams) => void;
  initialFilters?: SearchParams;
}

export default function FilterBar({ onFilter, initialFilters = {} }: FilterBarProps) {
  const [searchText, setSearchText] = useState(initialFilters.search || '');
  const [city, setCity] = useState(initialFilters.city || '');
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice?.toString() || '');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(initialFilters.facilities || []);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Create filters object for debouncing
  const filters = {
    search: searchText.trim() || undefined,
    city: city || undefined,
    minPrice: minPrice ? parseInt(minPrice) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
    facilities: selectedFacilities.length > 0 ? selectedFacilities : undefined,
  };

  // Use debounced filters with 400ms delay
  const { debouncedFilters, isFiltering } = useFiltersDebounce(filters, 400);

  // Auto-apply filters when debounced values change
  useEffect(() => {
    const cleanFilters = Object.fromEntries(
      Object.entries(debouncedFilters).filter(([_, value]) => value !== undefined)
    );
    onFilter?.(cleanFilters);
  }, [debouncedFilters, onFilter]);

  const facilities = [
    'Kamar mandi dalam',
    'AC',
    'WiFi',
    'Parkir',
    'Dapur',
    'Laundry',
    'Security 24 jam',
    'CCTV'
  ];

  const cities = [
    'Semarang',
    'Jakarta',
    'Surabaya',
    'Bandung',
    'Yogyakarta',
    'Malang',
    'Solo',
    'Depok'
  ];

  const handleFacilityToggle = (facility: string) => {
    setSelectedFacilities(prev => 
      prev.includes(facility)
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  // Legacy search function - now only used for Enter key press
  const handleSearch = () => {
    // Immediately apply current filters without waiting for debounce
    const filters: SearchParams = {
      search: searchText.trim() || undefined,
      city: city || undefined,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      facilities: selectedFacilities.length > 0 ? selectedFacilities : undefined,
    };

    // Remove undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    );

    onFilter?.(cleanFilters);
  };

  const handleReset = () => {
    setSearchText('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedFacilities([]);
    onFilter?.({});
  };

  return (
    <div className="bg-[#E1F6F2] border border-blue-100 rounded-xl shadow p-4 space-y-4">
      {/* Basic Search */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search Text */}
        <div className="flex items-center border bg-white text-blue-300 rounded-lg px-3 py-2 flex-1 min-w-[200px] relative">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari kos..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="outline-none flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          {isFiltering && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {/* City Select */}
        <div className="flex items-center border bg-white text-blue-300 rounded-lg px-3 py-2">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <select 
            value={city} 
            onChange={(e) => setCity(e.target.value)} 
            className="outline-none"
          >
            <option value="">Semua Kota</option>
            {cities.map(cityName => (
              <option key={cityName} value={cityName}>{cityName}</option>
            ))}
          </select>
        </div>

        {/* Advanced Toggle */}
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-500 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
          Filter Lanjutan
          {isFiltering && (
            <div className="flex items-center ml-1">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
            </div>
          )}
        </button>

        {/* Filter Status */}
        {isFiltering && (
          <div className="flex items-center gap-2 text-blue-500 text-sm">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
            <span>Memfilter...</span>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className="border-t pt-4 space-y-4">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rentang Harga</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border rounded-lg px-3 py-2 w-24 outline-none focus:ring-2 focus:ring-blue-200"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="border rounded-lg px-3 py-2 w-24 outline-none focus:ring-2 focus:ring-blue-200"
              />
              <span className="text-sm text-gray-500">ribu/bulan</span>
            </div>
          </div>

          {/* Facilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fasilitas</label>
            <div className="flex flex-wrap gap-2">
              {facilities.map(facility => (
                <button
                  key={facility}
                  onClick={() => handleFacilityToggle(facility)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedFacilities.includes(facility)
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-blue-50'
                  }`}
                >
                  {facility}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleReset}
              className="text-gray-600 hover:text-gray-700 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            {isFiltering && (
              <div className="flex items-center gap-2 text-blue-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm">Menerapkan filter...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
