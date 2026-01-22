// Imgur upload utility
// Returns the image URL after upload
// Requires a free Imgur client ID (see https://apidocs.imgur.com/#authorization-and-oauth)

export async function uploadToImgur(file: File): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID;
  if (!clientId) throw new Error('Imgur Client ID not set');

  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: {
      Authorization: `Client-ID ${clientId}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data?.data?.link) {
    throw new Error(data?.data?.error || 'Failed to upload to Imgur');
  }
  return data.data.link;
}
