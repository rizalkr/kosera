'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onImageChange: (index: number) => void;
  kosName: string;
}

export default function ImageModal({ 
  isOpen, 
  onClose, 
  images, 
  currentIndex, 
  onImageChange, 
  kosName 
}: ImageModalProps) {
  const [imageIndex, setImageIndex] = useState(currentIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setImageIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    // Reset zoom when changing images
    setIsZoomed(false);
  }, [imageIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'z' || e.key === 'Z') {
        setIsZoomed(!isZoomed);
      }
    };

    // Disable body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, imageIndex, isZoomed]);

  const handlePrevious = () => {
    const newIndex = imageIndex > 0 ? imageIndex - 1 : images.length - 1;
    setImageIndex(newIndex);
    onImageChange(newIndex);
  };

  const handleNext = () => {
    const newIndex = imageIndex < images.length - 1 ? imageIndex + 1 : 0;
    setImageIndex(newIndex);
    onImageChange(newIndex);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
        aria-label="Tutup modal"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Zoom Button */}
      <button
        onClick={() => setIsZoomed(!isZoomed)}
        className="absolute top-4 right-16 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
        aria-label={isZoomed ? "Zoom out" : "Zoom in"}
        title={isZoomed ? "Zoom out (Z)" : "Zoom in (Z)"}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isZoomed ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h-6" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          )}
        </svg>
      </button>

      {/* Image Container */}
      <div className={`relative max-w-4xl max-h-full w-full h-full flex items-center justify-center transition-all duration-300 ${
        isZoomed ? 'max-w-none max-h-none scale-150 cursor-grab active:cursor-grabbing' : ''
      }`}>
        <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
          <Image
            src={images[imageIndex]}
            alt={`${kosName} - Foto ${imageIndex + 1}`}
            width={800}
            height={600}
            className={`max-w-full max-h-full object-contain rounded-lg cursor-pointer transition-transform duration-300 ${
              isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={handleImageClick}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/rooms/room1.jpg';
            }}
          />
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
              aria-label="Foto sebelumnya"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
              aria-label="Foto selanjutnya"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Image Counter & Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
        <div className="text-center">
          <div className="text-sm font-medium">
            {imageIndex + 1} / {images.length}
          </div>
          <div className="text-xs text-gray-300 mt-1">
            Klik foto untuk zoom • Z untuk zoom • ← → untuk navigasi • ESC untuk tutup
          </div>
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-md overflow-x-auto px-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setImageIndex(index);
                onImageChange(index);
              }}
              className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                index === imageIndex 
                  ? 'ring-2 ring-white ring-opacity-80' 
                  : 'opacity-60 hover:opacity-80'
              }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `/images/rooms/room${(index % 4) + 1}.jpg`;
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
