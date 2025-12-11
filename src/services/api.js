import axios from 'axios'

// Безопасно получаем URL API
const API_BASE = import.meta.env.VITE_API_RAG || 'http://localhost:8880/ask'
console.log('API Base URL:', API_BASE)

export const apiService = {
  async askQuestion(question, top_k = 3, temperature = 0.1, rerank_threshold = 0.1) {
    try {
      console.log('Sending question to API:', question.substring(0, 50) + '...')

      const response = await axios.post(API_BASE, {
        question,
        top_k,
        temperature,
        rerank_threshold
      }, {
        timeout: 30000, // 30 секунд таймаут
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('API response received')
      return response.data
    } catch (error) {
      console.error('Error asking question:', error)

      // Возвращаем заглушку если API недоступно
      if (error.code === 'ERR_NETWORK') {
        return {
          question,
          answer: "В настоящее время сервис временно недоступен. Пожалуйста, попробуйте позже.",
          sources: [],
          parameters: { top_k, temperature, rerank_threshold }
        }
      }

      throw error
    }
  }
}
