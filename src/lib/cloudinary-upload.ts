// Cloudinary upload utility
// Returns the image URL after upload
// Requires a free Cloudinary account and unsigned upload preset

export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) throw new Error('Cloudinary config missing');

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'Failed to upload to Cloudinary');
  }
  return data.secure_url;
}
