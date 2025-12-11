import { createClient } from '@supabase/supabase-js'

// Используем переменные окружения для подключения к Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Необходимо указать SUPABASE_URL и SUPABASE_ANON_KEY в .env файле')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase