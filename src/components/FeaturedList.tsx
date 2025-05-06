import FeaturedCard from './FeaturedCard';

const rooms = [
  {
    id: 1,
    images: ['/images/room1.jpg', '/images/room2.jpg', '/images/room3.jpg', '/images/room1.jpg'],
    price: '500K',
    description: 'Double kos, dekat USM, kamar mandi luar',
    area: 'Tlogosari',
    city: 'Semarang',
  },
  {
    id: 2,
    images: ['/images/room2.jpg', '/images/room3.jpg', '/images/room1.jpg', '/images/room2.jpg'],
    price: '500K',
    description: 'Double kos, dekat USM, kamar mandi dalam',
    area: 'Tlogosari',
    city: 'Semarang',
  },
];

export default function FeaturedList() {
  return (
    <div className="space-y-6">
      {rooms.map(room => (
        <FeaturedCard key={room.id} {...room} />
      ))}
    </div>
  );
}