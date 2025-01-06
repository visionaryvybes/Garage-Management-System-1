import { supabase } from './supabase'

export async function createBucketIfNotExists() {
  const { data: buckets } = await supabase.storage.listBuckets()
  
  if (!buckets?.find(bucket => bucket.name === 'images')) {
    const { data, error } = await supabase.storage.createBucket('images', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif']
    })
    
    if (error) {
      console.error('Error creating bucket:', error)
    }
  }
} 