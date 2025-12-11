import { createClient } from '@supabase/supabase-js'

// Безопасно получаем переменные окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'test-key'

console.log('Supabase URL:', supabaseUrl)

// Создаем клиент с обработкой ошибок
let supabase = null
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('Supabase client created successfully')
} catch (error) {
  console.error('Error creating Supabase client:', error)
}

// Функции для работы с аутентификацией
export const authService = {
  async signUp(email, password, fullName) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })
      return { data, error }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    }
  },

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { data, error }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  },

  async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  }
}

// Функции для работы с историей чатов
export const chatService = {
  async saveChat(userId, question, answer) {
    if (!supabase) {
      console.warn('Supabase client not initialized')
      return { data: null, error: 'Supabase not initialized' }
    }

    try {
      const { data, error } = await supabase
        .from('chats')
        .insert([
          {
            user_id: userId,
            question,
            answer,
            created_at: new Date().toISOString()
          }
        ])
        .select()
      return { data, error }
    } catch (error) {
      console.error('Save chat error:', error)
      return { data: null, error }
    }
  },

  async getChatHistory(userId) {
    if (!supabase) {
      console.warn('Supabase client not initialized')
      return { data: null, error: 'Supabase not initialized' }
    }

    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
      return { data, error }
    } catch (error) {
      console.error('Get chat history error:', error)
      return { data: null, error }
    }
  }
}
// Функции для работы с профилем
export const profileService = {
  async getProfile(userId) {
    if (!supabase) {
      console.warn('Supabase client not initialized')
      return { data: null, error: 'Supabase not initialized' }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      return { data, error }
    } catch (error) {
      console.error('Get profile error:', error)
      return { data: null, error }
    }
  },

  async updateProfile(userId, profileData) {
    if (!supabase) {
      console.warn('Supabase client not initialized')
      return { data: null, error: 'Supabase not initialized' }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()
      return { data, error }
    } catch (error) {
      console.error('Update profile error:', error)
      return { data: null, error }
    }
  }
}

export { supabase }
