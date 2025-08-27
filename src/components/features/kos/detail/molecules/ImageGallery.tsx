import React from 'react';
import SafeImage from '@/components/ui/SafeImage';

export interface ImageGalleryProps {
  images: string[];
  activeIndex: number;
  onImageClick: (index: number) => void;
  kosName: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, activeIndex, onImageClick, kosName }) => (
  <div className="px-8 pb-6 mb-20">
    <div className="grid grid-cols-4 gap-3 h-64">
      <div className="col-span-2 row-span-2">
        <SafeImage
          src={images[activeIndex]}
          alt={kosName}
            width={400}
            height={256}
            style={{ width: '100%', height: 'auto' }}
            className="object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onImageClick(activeIndex)}
            fallbackSrc="/images/rooms/room1.jpg"
        />
      </div>
      {images.slice(1, 4).map((image: string, index: number) => (
        <div key={index} className="relative h-32">
          <SafeImage
            src={image}
            alt={`${kosName} - ${index + 2}`}
            width={200}
            height={128}
            style={{ width: '100%', height: '100%' }}
            className="object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onImageClick(index + 1)}
            fallbackSrc={`/images/rooms/room${(index % 4) + 1}.jpg`}
          />
          {index === 2 && images.length > 4 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg cursor-pointer hover:bg-opacity-60 transition-all"
              onClick={() => onImageClick(index + 1)}>
              <span className="text-white font-semibold text-xs">+{images.length - 4} foto</span>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);
