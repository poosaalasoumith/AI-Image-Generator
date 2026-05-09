import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://janbagkhgzlkajhrezoo.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function uploadImage(userId: string, imageBuffer: ArrayBuffer): Promise<string> {
  if (!supabaseServiceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY configuration.");
  }

  const filename = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
  
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filename, imageBuffer, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error("Supabase Storage Error:", error)
    throw new Error("Failed to upload image to storage.")
  }

  const { data: publicData } = supabase.storage
    .from('images')
    .getPublicUrl(data.path)

  return publicData.publicUrl
}

export async function deleteImagesFromStorage(urls: string[]): Promise<void> {
  if (!supabaseServiceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY configuration.");
  }
  
  if (!urls || urls.length === 0) return;

  // Extract filenames from public URLs
  // Example URL: https://xyz.supabase.co/storage/v1/object/public/images/user-123-456.jpg
  const filenames = urls.map(url => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }).filter(Boolean);

  if (filenames.length === 0) return;

  const { error } = await supabase.storage
    .from('images')
    .remove(filenames);

  if (error) {
    console.error("Supabase Storage Delete Error:", error);
    throw new Error("Failed to delete images from storage.");
  }
}
