// Supabase Client for Storage
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not found. Image upload to Supabase will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload an image to Supabase Storage and return the public URL
 * @param file - File buffer to upload
 * @param filename - Name of the file
 * @param bucketName - Storage bucket name (default: 'seedream-images')
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToSupabase(
  file: Buffer,
  filename: string,
  bucketName: string = 'seedream-images'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        error: 'Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your environment variables.',
      };
    }

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filename, file, {
        contentType: 'image/png', // or detect from filename
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('❌ Supabase upload error:', error);
      return {
        success: false,
        error: `Failed to upload to Supabase: ${error.message}`,
      };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filename);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      return {
        success: false,
        error: 'Failed to get public URL from Supabase',
      };
    }

    console.log(`✅ Supabase upload complete: ${filename}`);
    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (error: any) {
    console.error('❌ Supabase upload exception:', error);
    return {
      success: false,
      error: error.message || 'Unknown error during Supabase upload',
    };
  }
}
