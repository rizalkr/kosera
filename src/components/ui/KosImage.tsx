import { useKosImage } from '@/hooks/image/useKosImage';
import Image from 'next/image';

interface KosImageProps {
  kosId: number;
  kosName: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function KosImage({ 
  kosId, 
  kosName, 
  className = "object-cover w-full h-full",
  width = 400,
  height = 300
}: KosImageProps) {
  const { imageUrl, hasPhotos } = useKosImage(kosId);

  return (
    <>
      <Image
        src={imageUrl}
        alt={kosName}
        width={width}
        height={height}
        className={className}
        onError={() => {
          // Handle error - Next.js Image handles fallbacks differently
          console.log('Image failed to load for kos:', kosId);
        }}
      />
      {!hasPhotos && (
        <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded">
          Sample
        </div>
      )}
    </>
  );
}
