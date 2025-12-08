import { supabase } from '@/integrations/supabase/client';

export type MediaType = 'video' | 'audio' | 'image' | 'document';

const BUCKET_NAME = 'process-media';

export async function uploadMediaFile(
  file: File,
  mediaType: MediaType,
  processId?: string
): Promise<{ url: string; error: string | null }> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const folder = processId || 'temp';
    const fileName = `${folder}/${mediaType}/${timestamp}-${randomStr}.${fileExt}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: '', error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    console.error('Upload error:', err);
    return { url: '', error: 'Error al subir el archivo' };
  }
}

export async function deleteMediaFile(url: string): Promise<boolean> {
  try {
    // Extract path from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.indexOf(BUCKET_NAME);
    if (bucketIndex === -1) return false;
    
    const filePath = pathParts.slice(bucketIndex + 1).join('/');
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    return !error;
  } catch {
    return false;
  }
}

export function getMediaAcceptTypes(mediaType: MediaType): string {
  switch (mediaType) {
    case 'video':
      return 'video/mp4,video/webm,video/quicktime';
    case 'audio':
      return 'audio/mpeg,audio/wav,audio/webm,audio/ogg';
    case 'image':
      return 'image/jpeg,image/png,image/gif,image/webp';
    case 'document':
      return 'application/pdf,.doc,.docx';
    default:
      return '*/*';
  }
}
