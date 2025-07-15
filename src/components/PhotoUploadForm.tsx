'use client';

import { useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuthToken } from '@/hooks/useAuthToken';

interface PhotoUploadFormProps {
  kosId: number;
  onUploadSuccess?: (photos: any[]) => void;
  onUploadError?: (error: string) => void;
}

export default function PhotoUploadForm({ 
  kosId, 
  onUploadSuccess, 
  onUploadError 
}: PhotoUploadFormProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isPrimary, setIsPrimary] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const { user, isAuthenticated } = useAuthGuard();
  const { getToken } = useAuthToken();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(e.dataTransfer.files);
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      onUploadError?.('Pilih file foto terlebih dahulu');
      return;
    }

    if (!isAuthenticated) {
      onUploadError?.('Login terlebih dahulu untuk upload foto');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      
      // Add all files to FormData
      for (let i = 0; i < files.length; i++) {
        formData.append('photos', files[i]);
      }
      
      formData.append('isPrimary', isPrimary.toString());

      // Get token using hook
      const token = getToken();
      if (!token) {
        onUploadError?.('Sesi login telah berakhir, silakan login kembali');
        return;
      }
      
      const response = await fetch(`/api/kos/${kosId}/photos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onUploadSuccess?.(data.data.photos);
        setFiles(null);
        setIsPrimary(false);
        // Reset file input
        const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        onUploadError?.(data.error || 'Gagal upload foto');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.('Terjadi kesalahan saat upload foto');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    if (files) {
      const newFiles = Array.from(files).filter((_, i) => i !== index);
      const dt = new DataTransfer();
      newFiles.forEach(file => dt.items.add(file));
      setFiles(dt.files);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">Login terlebih dahulu untuk upload foto</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Foto Kos</h3>
      
      {/* Drag and Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-gray-400 text-4xl mb-4">📁</div>
        <p className="text-gray-600 mb-2">
          Drag & drop foto di sini atau{' '}
          <label htmlFor="photo-upload" className="text-blue-600 hover:underline cursor-pointer">
            pilih file
          </label>
        </p>
        <p className="text-sm text-gray-500">
          Support: JPG, PNG, WebP (max 5MB per file)
        </p>
        
        <input
          id="photo-upload"
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Selected Files */}
      {files && files.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">File terpilih:</h4>
          <div className="space-y-2">
            {Array.from(files).map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{file.name}</span>
                  <span className="text-xs text-gray-400">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Options */}
      {files && files.length > 0 && (
        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-600">Set sebagai foto utama</span>
          </label>
        </div>
      )}

      {/* Upload Button */}
      {files && files.length > 0 && (
        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : `Upload ${files.length} foto`}
          </button>
        </div>
      )}
    </div>
  );
}
