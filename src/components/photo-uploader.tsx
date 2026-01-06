'use client';

import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { uploadWastePhoto, compressImage } from '@/lib/storage-service';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploaderProps {
    userId: string;
    wasteReportId: string;
    onPhotoAdded: (photoURL: string) => void;
    onPhotoRemoved: (photoURL: string) => void;
    photos?: string[];
    maxPhotos?: number;
}

export function PhotoUploader({
    userId,
    wasteReportId,
    onPhotoAdded,
    onPhotoRemoved,
    photos = [],
    maxPhotos = 5,
}: PhotoUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        if (photos.length + files.length > maxPhotos) {
            toast({
                variant: 'destructive',
                title: 'Too many photos',
                description: `Maximum ${maxPhotos} photos allowed`,
            });
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            await uploadPhoto(file);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadPhoto = async (file: File) => {
        try {
            setIsUploading(true);
            setUploadProgress(0);

            // Compress image before upload
            const compressedFile = await compressImage(file);

            // Upload to Firebase Storage
            const photoURL = await uploadWastePhoto(
                userId,
                wasteReportId,
                compressedFile,
                (progress) => {
                    setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
                }
            );

            onPhotoAdded(photoURL);
            toast({
                title: 'Photo uploaded',
                description: 'Photo has been added to your report',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Upload failed',
                description: error instanceof Error ? error.message : 'Failed to upload photo',
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="w-full space-y-4">
            {/* Upload Area */}
            <div className="relative">
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={isUploading || photos.length >= maxPhotos}
                    className="sr-only"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || photos.length >= maxPhotos}
                    className="w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-8 text-center hover:border-green-500 dark:hover:border-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="flex flex-col items-center gap-3">
                        <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3">
                            <ImageIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {isUploading ? 'Uploading...' : 'Click to upload photos'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                {photos.length}/{maxPhotos} photos • JPG, PNG up to 5MB
                            </p>
                        </div>
                    </div>

                    {/* Upload Progress */}
                    {isUploading && (
                        <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    )}
                </button>
            </div>

            {/* Photo Gallery */}
            {photos.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Uploaded Photos ({photos.length}/{maxPhotos})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {photos.map((photo, index) => (
                            <div
                                key={index}
                                className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-square"
                            >
                                <img
                                    src={photo}
                                    alt={`Photo ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => onPhotoRemoved(photo)}
                                    className="absolute top-1 right-1 rounded-full bg-red-500 hover:bg-red-600 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove photo"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
