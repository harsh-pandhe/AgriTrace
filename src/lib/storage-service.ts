/**
 * Storage Service - Handles file uploads to Firebase Storage
 */

import { storage } from './firebase';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from 'firebase/storage';

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

/**
 * Upload waste report photo
 */
export const uploadWastePhoto = async (
    userId: string,
    wasteReportId: string,
    file: File,
    _onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
    try {
        // Validate file
        if (!file.type.startsWith('image/')) {
            throw new Error('File must be an image');
        }

        if (file.size > 5 * 1024 * 1024) {
            // 5MB limit
            throw new Error('File size must be less than 5MB');
        }

        // Create file reference with timestamp
        const fileName = `${Date.now()}-${file.name}`;
        const fileRef = ref(
            storage,
            `waste-reports/${userId}/${wasteReportId}/${fileName}`
        );

        // Upload file
        const snapshot = await uploadBytes(fileRef, file, {
            contentType: file.type,
        });

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        throw new Error(
            `Failed to upload photo: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};

/**
 * Upload multiple photos
 */
export const uploadMultiplePhotos = async (
    userId: string,
    wasteReportId: string,
    files: File[],
    onProgress?: (progress: UploadProgress) => void
): Promise<string[]> => {
    const uploadPromises = files.map((file) =>
        uploadWastePhoto(userId, wasteReportId, file, onProgress)
    );

    return Promise.all(uploadPromises);
};

/**
 * Delete photo from storage
 */
export const deleteWastePhoto = async (photoURL: string): Promise<void> => {
    try {
        // Extract the path from the download URL
        const decodedURL = decodeURIComponent(photoURL);
        const startIndex = decodedURL.indexOf('/o/') + 3;
        const endIndex = decodedURL.indexOf('?');
        const filePath = decodedURL.substring(startIndex, endIndex);

        const fileRef = ref(storage, filePath);
        await deleteObject(fileRef);
    } catch (error) {
        throw new Error(
            `Failed to delete photo: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};

/**
 * Upload delivery proof (photo)
 */
export const uploadDeliveryProof = async (
    userId: string,
    deliveryId: string,
    file: File
): Promise<string> => {
    try {
        if (!file.type.startsWith('image/')) {
            throw new Error('File must be an image');
        }

        const fileName = `${Date.now()}-${file.name}`;
        const fileRef = ref(
            storage,
            `delivery-proofs/${userId}/${deliveryId}/${fileName}`
        );

        const snapshot = await uploadBytes(fileRef, file, {
            contentType: file.type,
        });

        return await getDownloadURL(snapshot.ref);
    } catch (error) {
        throw new Error(
            `Failed to upload delivery proof: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};

/**
 * Get file size in MB
 */
export const getFileSizeMB = (file: File): number => {
    return file.size / (1024 * 1024);
};

/**
 * Compress image before upload
 */
export const compressImage = async (
    file: File,
    maxWidth: number = 1200,
    maxHeight: number = 1200,
    quality: number = 0.8
): Promise<File> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        const compressedFile = new File(
                            [blob as Blob],
                            file.name,
                            { type: 'image/jpeg' }
                        );
                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality
                );
            };
        };
    });
};
