// src/components/atoms/Select.tsx
'use client';
import React from 'react';
import clsx from 'clsx';

export interface SelectOption<TValue extends string | number = string> {
  label: string;
  value: TValue;
}

export interface SelectProps<TValue extends string | number = string> extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption<TValue>[];
}

export const Select = <TValue extends string | number = string>({
  label,
  error,
  className,
  options,
  id,
  ...props
}: SelectProps<TValue>) => {
  const selectId = id || props.name || undefined;
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};
