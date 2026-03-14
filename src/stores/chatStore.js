import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chatService, feedbackService } from '../services/supabase'
import { useAuthStore } from './authStore'

export const useChatStore = defineStore('chat', () => {
  const messages = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const history = ref([])
  const currentChatId = ref(null) // Добавлено для хранения ID текущего чата
  const feedbacks = ref({}) // key: chatId, value: feedback object
  
  const authStore = useAuthStore()

  // Добавить сообщение
  function addMessage(role, content, sources = [], chatId = null) {
    messages.value.push({
      id: Date.now(),
      role,
      content,
      sources,
      chatId, // Сохраняем chatId для каждого сообщения ассистента
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

      console.log('Sending question to RAG API via chatService...')
      // Формируем параметры запроса
      const params = {
        k: parameters.top_k || 30,
        rerank_top_k: parameters.rerank_top_k || 3,
        temperature: parameters.temperature || 0.8,
        max_tokens: parameters.max_tokens || 2000,
        min_score: parameters.min_score || 0.0
      }
      const response = await chatService.sendQuery(question, params)

      // Сохраняем chat_id из ответа (если бэкенд возвращает)
      if (response.chat_id) {
        currentChatId.value = response.chat_id
      }

      // Добавляем ответ ассистента с chatId
      addMessage('assistant', response.answer, response.sources || [], response.chat_id || null)

      // Загружаем фидбек для этого чата если есть chat_id
      if (response.chat_id) {
        await loadFeedback(response.chat_id)
      }

      return response
    } catch (err) {
      error.value = err.message || 'Ошибка при обработке вопроса'
      console.error('Send question error:', err)
      addMessage('assistant', 'Извините, произошла ошибка. Пожалуйста, попробуйте позже.')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Отправить фидбек (лайк/дизлайк)
  async function submitFeedback(chatId, type, rating = null, comment = null) {
    try {
      const result = await feedbackService.createFeedback(chatId, type, rating, comment)
      feedbacks.value[chatId] = result
      return result
    } catch (err) {
      console.error('Failed to submit feedback:', err)
      throw err
    }
  }

  // Удалить фидбек
  async function removeFeedback(chatId) {
    try {
      await feedbackService.deleteFeedback(chatId)
      delete feedbacks.value[chatId]
    } catch (err) {
      console.error('Failed to delete feedback:', err)
      throw err
    }
  }

  // Загрузить фидбек для чата
  async function loadFeedback(chatId) {
    try {
      const result = await feedbackService.getFeedback(chatId)
      if (result) feedbacks.value[chatId] = result
    } catch (err) {
      console.error('Failed to load feedback:', err)
    }
  }

  // Загрузить историю чатов
  async function loadHistory(limit = 50) {
    if (!authStore.user) {
      console.log('User not authenticated, skipping history load')
      return
    }

    try {
      const data = await chatService.getHistory(limit)
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
    currentChatId.value = null
  }

  return {
    messages,
    isLoading,
    error,
    history,
    currentChatId,
    feedbacks,
    addMessage,
    sendQuestion,
    loadHistory,
    clearChat,
    submitFeedback,
    removeFeedback,
    loadFeedback
  }
})
