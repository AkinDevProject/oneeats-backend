import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { validateImageFile, getMenuCardImageUrl, getModalPreviewImageUrl } from '../../utils/imageUtils';

interface ImageUploadProps {
  currentImage?: string;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  className?: string;
  disabled?: boolean;
  compact?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onUpload,
  onDelete,
  className = '',
  disabled = false,
  compact = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file || disabled) return;

    // Validate file using utility function
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    try {
      setIsUploading(true);
      await onUpload(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || disabled) return;

    try {
      setIsDeleting(true);
      await onDelete();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Erreur lors de la suppression de l\'image');
    } finally {
      setIsDeleting(false);
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        {currentImage ? (
          <div className="relative group menu-item-image-container">
            <img
              src={getMenuCardImageUrl(currentImage)}
              alt="Menu item"
              className="menu-item-image"
              loading="lazy"
            />
            <div className="menu-image-overlay">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openFileDialog}
                  disabled={disabled || isUploading}
                  className="bg-white text-gray-700 hover:bg-gray-100"
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
                {onDelete && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleDelete}
                    disabled={disabled || isDeleting}
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    {isDeleting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={openFileDialog}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            className={`
              aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-md
              flex items-center justify-center cursor-pointer
              transition-all duration-200 hover:from-gray-200 hover:to-gray-300
              ${dragOver ? 'from-blue-100 to-blue-200 border-2 border-blue-400 border-dashed' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isUploading ? (
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs text-gray-600">Upload...</span>
              </div>
            ) : (
              <div className="text-center">
                <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <span className="text-xs text-gray-600">Ajouter image</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {currentImage ? (
        <div className="relative">
          <div className="w-full h-48 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            <img
              src={getModalPreviewImageUrl(currentImage)}
              alt="Menu item"
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={openFileDialog}
              disabled={disabled || isUploading}
              className="bg-white shadow-md"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
            {onDelete && (
              <Button
                size="sm"
                variant="danger"
                onClick={handleDelete}
                disabled={disabled || isDeleting}
                className="shadow-md"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={openFileDialog}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={`
            w-full h-48 border-2 border-dashed rounded-lg
            flex flex-col items-center justify-center cursor-pointer
            transition-all duration-200
            ${dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isUploading ? (
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Upload en cours...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-2">Cliquez pour uploader une image</p>
              <p className="text-sm text-gray-500">ou glissez-déposez un fichier</p>
              <p className="text-xs text-gray-400 mt-2">PNG, JPG, WebP (max 5MB)</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};