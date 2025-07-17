import { useKosImage } from '@/hooks/useKosImage';

interface KosImageProps {
  kosId: number;
  kosName: string;
  className?: string;
}

export default function KosImage({ kosId, kosName, className = "object-cover w-full h-full" }: KosImageProps) {
  const { imageUrl, isLoading, hasPhotos } = useKosImage(kosId);

  return (
    <>
      <img
        src={imageUrl}
        alt={kosName}
        className={className}
        onError={(e) => {
          // Fallback to sample image if photo fails to load
          const target = e.target as HTMLImageElement;
          target.src = '/images/rooms/room1.jpg';
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
