'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamic import for MapContainer and related components
const LeafletMap = dynamic(() => import('./RealMap'), { ssr: false });

export default function MapSection() {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        err => {
          setPosition([-6.200000, 106.816666]); // Jakarta
        }
      );
    } else {
      setPosition([-6.200000, 106.816666]);
    }
  }, []);

  return (
    <div className="h-80 rounded-lg overflow-hidden shadow z-[-1]">
      {position ? (
        <LeafletMap position={position} />
      ) : (
        <div className="h-full flex items-center justify-center">Memuat lokasi...</div>
      )}
    </div>
  );
}