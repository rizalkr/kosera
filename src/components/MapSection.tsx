'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default icon issue for react-leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function MapSection() {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        err => {
          // Fallback ke posisi default jika gagal
          setPosition([-6.200000, 106.816666]); // Jakarta
        }
      );
    } else {
      setPosition([-6.200000, 106.816666]); // Fallback jika tidak support
    }
  }, []);

  return (
    <div className="h-80 rounded-lg overflow-hidden shadow z-[-1]">
      {position ? (
        <MapContainer center={position} zoom={15} className="h-full w-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>Lokasimu saat ini</Popup>
          </Marker>
        </MapContainer>
      ) : (
        <div className="h-full flex items-center justify-center">Memuat lokasi...</div>
      )}
    </div>
  );
}