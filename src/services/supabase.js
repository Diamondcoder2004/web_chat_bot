import { createClient } from '@supabase/supabase-js'

// Безопасно получаем переменные окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:8000'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzczMjU1NjAwLCJleHAiOjE5MzEwMjIwMDB9.50mP01rS2HH53tuHsgQd7kg-Uc3OSQBeaHOkyejEPQQ'

console.log('Supabase URL:', supabaseUrl)

// Создаем клиент с обработкой ошибок
let supabase = null
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
  console.log('Supabase client created successfully')
} catch (error) {
  console.error('Error creating Supabase client:', error)
}

// Функции для работы с аутентификацией
export const authService = {
  async signUp(email, password, fullName) {
    if (!supabase) {
      console.warn('Supabase client not initialized')
      return { data: null, error: 'Supabase not initialized' }
    }

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
    if (!supabase) {
      console.warn('Supabase client not initialized')
      return { data: null, error: 'Supabase not initialized' }
    }

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
    if (!supabase) {
      console.warn('Supabase client not initialized')
      return { error: 'Supabase not initialized' }
    }

    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    }
  },

  async getCurrentUser() {
    if (!supabase) {
      console.warn('Supabase client not initialized')
      return null
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  },

  async getSession() {
    if (!supabase) {
      console.warn('Supabase client not initialized')
      return null
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session from Supabase:', session ? '✅ exists' : '❌ null')
      if (session) {
        console.log('Token preview:', session.access_token.substring(0, 20) + '...')
      }
      return session
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  }
}

// Сервис для работы с фидбеком (через FastAPI)
export const feedbackService = {
  async createFeedback(chatId, feedbackType, rating, comment) {
    const session = await authService.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        chat_id: chatId,
        feedback_type: feedbackType,
        rating,
        comment
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Feedback error: ${error}`);
    }

    return response.json();
  },

  async getFeedback(chatId) {
    const session = await authService.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/feedback/${chatId}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      const error = await response.text();
      throw new Error(`Feedback error: ${error}`);
    }

    return response.json();
  },

  async deleteFeedback(chatId) {
    const session = await authService.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/feedback/${chatId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Feedback error: ${error}`);
    }

    return response.json();
  }
};

// Сервис для работы с чатами (FastAPI)
export const chatService = {
  async sendQuery(query, params = {}) {
    const session = await authService.getSession();
    console.log('Session in sendQuery:', session ? '✅' : '❌');
    if (!session) throw new Error('Not authenticated');

    console.log('Sending token:', session.access_token.substring(0, 20) + '...');

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        query,
        k: params.k || 30,
        rerank_top_k: params.rerank_top_k || 3,
        temperature: params.temperature || 0.8,
        max_tokens: params.max_tokens || 2000,
        min_score: params.min_score || 0.0,
        session_id: params.session_id || null
      })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('API error response:', error);
      throw new Error(`API error: ${error}`);
    }

    return response.json();
  },

  async getHistory(limit = 50) {
    const session = await authService.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/history?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${error}`);
    }

    return response.json();
  }
};

// Сервис для работы с профилем (Supabase напрямую)
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

      // Если таблицы нет, создадим её автоматически через API позже
      if (error && error.code === '42P01') {
        console.warn('Profiles table does not exist. Create it in Supabase Studio.');
        return { data: null, error: 'Profiles table not created yet' }
      }

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
  },

  async createProfile(userId, fullName) {
    if (!supabase) {
      console.warn('Supabase client not initialized')
      return { data: null, error: 'Supabase not initialized' }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            full_name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()
      return { data, error }
    } catch (error) {
      console.error('Create profile error:', error)
      return { data: null, error }
    }
  }
}

export { supabase }
