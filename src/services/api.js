// src/services/api.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

// Запрос к вашему FastAPI
export async function askQuestion(question, top_k = 3, temperature = 0.1, rerank_threshold = 0.1) {
    const response = await fetch(`${apiBaseUrl}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, top_k, temperature, rerank_threshold })
    })
    if (!response.ok) throw new Error('Ошибка API')
    return response.json()
}