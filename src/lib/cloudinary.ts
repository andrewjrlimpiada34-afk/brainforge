export type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
};

type SignedUploadConfig = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: string;
  signature: string;
};

async function getSignedUploadConfig(): Promise<SignedUploadConfig> {
  const response = await fetch('/api/cloudinary/sign', {
    method: 'POST',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Unable to prepare Cloudinary upload.');
  }

  return data as SignedUploadConfig;
}

export async function uploadProfileImage(file: File): Promise<CloudinaryUploadResult> {
  const { cloudName, apiKey, folder, timestamp, signature } = await getSignedUploadConfig();
  const formData = new FormData();

  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('folder', folder);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Image upload failed.');
  }

  return {
    secureUrl: data.secure_url as string,
    publicId: data.public_id as string,
  };
}
