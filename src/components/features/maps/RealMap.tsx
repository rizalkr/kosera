import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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

type Props = {
  position: [number, number];
};

export default function RealMap({ position }: Props) {
  // Validate position: must be array of two finite numbers
  const isValidPosition =
    Array.isArray(position) &&
    position.length === 2 &&
    typeof position[0] === 'number' &&
    typeof position[1] === 'number' &&
    isFinite(position[0]) &&
    isFinite(position[1]);

  if (!isValidPosition) {
    return (
      <div className="flex items-center justify-center h-full w-full text-red-500 bg-gray-50">
        Lokasi tidak valid
      </div>
    );
  }

  return (
    <MapContainer 
      center={position} 
      zoom={15} 
      className="h-full w-full"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>Lokasimu saat ini</Popup>
      </Marker>
    </MapContainer>
  );
}