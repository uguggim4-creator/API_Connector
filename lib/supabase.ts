// Supabase Client for Storage
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create Supabase client instance
 * Lazy initialization to avoid build-time errors when env vars are not set
 */
function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }

  return supabaseInstance;
}

/**
 * Upload an image to Supabase Storage and return the public URL
 * @param file - File buffer to upload
 * @param filename - Name of the file
 * @param bucketName - Storage bucket name (default: 'seedream-images')
 * @param contentType - MIME type to store (default: 'image/png')
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToSupabase(
  file: Buffer,
  filename: string,
  bucketName: string = 'seedream-images',
  contentType?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your environment variables.',
      };
    }

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filename, file, {
        contentType: contentType || 'image/png',
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