import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiService } from '../services/api'
import { chatService } from '../services/supabase'
import { useAuthStore } from './authStore'

export const useChatStore = defineStore('chat', () => {
  const messages = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const history = ref([])

  const authStore = useAuthStore()

  // Добавить сообщение
  function addMessage(role, content, sources = []) {
    messages.value.push({
      id: Date.now(),
      role,
      content,
      sources,
      timestamp: new Date()
    })
  }

  // Отправить вопрос
  async function sendQuestion(question, parameters = {}) {
    isLoading.value = true
    error.value = null

    try {
      // Добавляем вопрос пользователя
      addMessage('user', question)

      console.log('Sending question to RAG API...')
      const response = await apiService.askQuestion(
        question,
        parameters.top_k || 3,
        parameters.temperature || 0.1,
        parameters.rerank_threshold || 0.1
      )

      // Добавляем ответ ассистента
      addMessage('assistant', response.answer, response.sources || [])

      // Сохраняем в историю если пользователь авторизован
      if (authStore.user) {
        try {
          await chatService.saveChat(authStore.user.id, question, response.answer)
          console.log('Chat saved to history')
        } catch (saveError) {
          console.error('Failed to save chat to history:', saveError)
        }
      }

      return response
    } catch (err) {
      error.value = err.message || 'Ошибка при обработке вопроса'
      console.error('Send question error:', err)

      // Добавляем сообщение об ошибке
      addMessage('assistant', 'Извините, произошла ошибка. Пожалуйста, попробуйте позже.')

      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Загрузить историю чатов
  async function loadHistory() {
    if (!authStore.user) {
      console.log('User not authenticated, skipping history load')
      return
    }

    try {
      const { data, error: historyError } = await chatService.getChatHistory(authStore.user.id)

      if (historyError) {
        console.error('History load error:', historyError)
        return
      }

      history.value = data || []
      console.log('Chat history loaded:', history.value.length, 'items')
    } catch (err) {
      console.error('Failed to load chat history:', err)
    }
  }

  // Очистить текущий чат
  function clearChat() {
    messages.value = []
    error.value = null
  }

  return {
    messages,
    isLoading,
    error,
    history,
    addMessage,
    sendQuestion,
    loadHistory,
    clearChat
  }
})
