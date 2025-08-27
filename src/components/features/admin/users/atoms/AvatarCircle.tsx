import React from 'react';

export interface AvatarCircleProps {
  name: string;
}

export const AvatarCircle: React.FC<AvatarCircleProps> = ({ name }) => {
  return (
    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
      {name.charAt(0).toUpperCase()}
    </div>
  );
};
