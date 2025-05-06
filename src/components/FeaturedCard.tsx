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
      <div className="bg-gray-100 p-4 rounded-lg flex gap-4">
        <div className="grid grid-cols-2 grid-rows-2 gap-1 w-1/3">
          {images.map((src, i) => (
            <img key={i} src={src} alt="room" className="object-cover w-full h-20 rounded" />
          ))}
        </div>
        <div className="flex-1">
          <p className="font-semibold">{price} / Bulan</p>
          <p className="mt-1 text-sm">{description}</p>
          <p className="mt-1 text-sm text-gray-600">{area}</p>
          <p className="text-sm text-gray-600">{city}</p>
          <a href="#" className="mt-2 inline-block text-blue-600 hover:underline">Lihat selengkapnya &gt;</a>
        </div>
      </div>
    );
  }
  