import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function ensureStorageBucket() {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const vehiclesBucket = buckets?.find(b => b.name === 'vehicles')

    if (!vehiclesBucket) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket('vehicles', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })

      if (createError) {
        throw createError
      }
    }

    return true
  } catch (error) {
    console.error('Error ensuring storage bucket:', error)
    return false
  }
}

export async function ensureServiceTable() {
  try {
    // Check if services table exists
    const { error } = await supabase.from('services').select('id').limit(1);
    return !error || !error.message.includes('does not exist');
  } catch (error) {
    console.error('Error checking services table:', error);
    return false;
  }
}

export async function ensureVehiclesTable() {
  try {
    // Check if vehicles table exists
    const { error } = await supabase.from('vehicles').select('id').limit(1);
    return !error || !error.message.includes('does not exist');
  } catch (error) {
    console.error('Error checking vehicles table:', error);
    return false;
  }
} 