import { apiClient } from './client';

export interface UploadResponse {
  success: boolean;
  url: string;
  message?: string;
}

// Simple file upload using a public image hosting service or base64
// In production, you should use Supabase Storage or S3
export const uploadApi = {
  uploadImage: async (file: File): Promise<UploadResponse> => {
    // For now, convert to base64 data URL
    // In production, upload to Supabase Storage or S3
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Send to backend for validation and storage
        // Backend expects URL, so we'll use base64 data URL temporarily
        // In production, upload to storage first, then send URL to backend
        apiClient.post('/upload/image', {
          url: base64String,
          type: 'avatar',
        })
          .then((response) => {
            if (response.success) {
              resolve({
                success: true,
                url: base64String, // Use base64 for now, in production use storage URL
              });
            } else {
              reject(new Error(response.message || 'Upload failed'));
            }
          })
          .catch((error) => {
            // If backend fails, use base64 directly
            resolve({
              success: true,
              url: base64String,
            });
          });
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  },

  uploadDocument: async (file: File): Promise<UploadResponse> => {
    // Similar to image upload
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        apiClient.post('/upload/document', {
          url: base64String,
        })
          .then((response) => {
            if (response.success) {
              resolve({
                success: true,
                url: base64String,
              });
            } else {
              reject(new Error(response.message || 'Upload failed'));
            }
          })
          .catch((error) => {
            resolve({
              success: true,
              url: base64String,
            });
          });
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  },

  uploadVideo: async (file: File | Blob): Promise<UploadResponse> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        apiClient.post('/upload/video', {
          url: base64String,
        })
          .then((response) => {
            if (response.success && response.public_url) {
              resolve({
                success: true,
                url: response.public_url,
              });
            } else {
              reject(new Error(response.message || 'Upload failed'));
            }
          })
          .catch((error) => {
            reject(new Error(error.response?.data?.error?.message || error.message || 'Failed to upload video'));
          });
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  },
};

