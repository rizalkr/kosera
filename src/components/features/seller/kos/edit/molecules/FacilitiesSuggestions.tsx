import React from 'react';
import { cn } from '@/lib/utils';

export interface FacilitiesSuggestionsProps {
  options: string[];
  value: string;
  onAdd: (val: string) => void;
}

export const FacilitiesSuggestions: React.FC<FacilitiesSuggestionsProps> = ({ options, value, onAdd }) => {
  return (
    <div className="mt-3">
      <p className="text-xs text-gray-500 mb-2">Saran fasilitas (klik untuk menambahkan):</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => {
              if (!value.includes(opt)) onAdd(opt);
            }}
            className={cn('px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full border border-gray-200 transition-colors')}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
