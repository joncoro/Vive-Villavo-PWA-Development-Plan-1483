import {createClient} from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://kospzoflmiixfqhwepbo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvc3B6b2ZsbWlpeGZxaHdlcGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDUxOTgsImV4cCI6MjA2OTAyMTE5OH0.rDfrjtkSUOE83BAPOYtbUd8c6LDmuVfCqwVQUiyW84A'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database types
export const USER_ROLES = {
  USER: 'user',
  BUSINESS: 'business',
  ADMIN: 'admin'
}

export const CONTENT_STATUS = {
  PENDING: 'pendiente',
  APPROVED: 'aprobado',
  REJECTED: 'rechazado'
}

export const MOOD_TYPES = {
  HAPPY: 'feliz',
  EXCITED: 'emocionado',
  RELAXED: 'relajado',
  ADVENTUROUS: 'aventurero',
  SOCIAL: 'social',
  CULTURAL: 'cultural'
}

// Utility functions
export const uploadFile = async (bucket, file, path) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export const getPublicUrl = (bucket, path) => {
  try {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  } catch (error) {
    console.error('Error getting public URL:', error)
    return null
  }
}

export const calculateRewards = (amount) => {
  return Math.floor(amount / 1000)
}

// Test connection function
export const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('eventos_vv23')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection test failed:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Connection test error:', error)
    return false
  }
}

// Initialize connection test
testConnection()

export default supabase