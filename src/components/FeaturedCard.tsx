interface FeaturedCardProps {
  id: number;
  images: string[];
  price: string;
  description: string;
  area: string;
  city: string;
}

export default function FeaturedCard({ images, price, description, area, city }: FeaturedCardProps) {
  return (
    <div className="bg-white border border-blue-100 rounded-xl shadow hover:shadow-lg transition flex gap-4 p-4">
      <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-blue-50 flex items-center justify-center">
        <img
          src={images[0]}
          alt="room"
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="text-blue-700 font-bold text-lg mb-1">{price}/month</div>
          <div className="text-gray-900 font-semibold">{description}</div>
          <div className="text-gray-500">{area}, {city}</div>
        </div>
        <a
          href="#"
          className="mt-2 inline-block text-blue-600 hover:underline font-medium"
        >
          Lihat selengkapnya &gt;
        </a>
      </div>
    </div>
  );
}