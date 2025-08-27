import React from 'react';

export interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  ariaLabel?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, ariaLabel }) => (
  <input
    type="checkbox"
    aria-label={ariaLabel}
    checked={checked}
    onChange={onChange}
    className="rounded border-gray-300 text-blue-600 focus:ring-blue-700"
  />
);
