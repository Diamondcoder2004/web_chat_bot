import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chatService, feedbackService } from '../services/supabase'
import { useAuthStore } from './authStore'

export const useChatStore = defineStore('chat', () => {
  const messages = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const history = ref([])
  const sessionId = ref(null)               // идентификатор текущего диалога
  const feedbacks = ref({})                  // key: chatId, value: feedback object

  const authStore = useAuthStore()

  // Добавить сообщение в локальный список
  function addMessage(role, content, sources = [], msgSessionId = null) {
    messages.value.push({
      id: Date.now(),
      role,
      content,
      sources,
      sessionId: msgSessionId,
      timestamp: new Date()
    })
  }

  // Начать новый чат (очистить всё и сбросить sessionId)
  function newChat() {
    messages.value = []
    sessionId.value = null
    error.value = null
  }

  // Отправить вопрос
  async function sendQuestion(question, parameters = {}) {
    isLoading.value = true
    error.value = null

    try {
      addMessage('user', question)

      const params = {
        k: parameters.top_k || 30,
        rerank_top_k: parameters.rerank_top_k || 3,
        temperature: parameters.temperature || 0.8,
        max_tokens: parameters.max_tokens || 2000,
        min_score: parameters.min_score || 0.0
      }

      // Добавляем session_id только если он есть, иначе не передаём
      if (sessionId.value) {
        params.session_id = sessionId.value
      }

      const response = await chatService.sendQuery(question, params)

      if (response.session_id) {
        sessionId.value = response.session_id
      }

      addMessage('assistant', response.answer, response.sources || [], response.session_id)

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

  // Отправить фидбек (лайк/дизлайк/звезда)
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

  // Загрузить фидбек для конкретного чата
  async function loadFeedback(chatId) {
    try {
      const result = await feedbackService.getFeedback(chatId)
      if (result) feedbacks.value[chatId] = result
    } catch (err) {
      console.error('Failed to load feedback:', err)
    }
  }

  // Загрузить историю чатов пользователя
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

  // Очистить текущий чат (синоним newChat)
  function clearChat() {
    newChat()
  }

  return {
    messages,
    isLoading,
    error,
    history,
    sessionId,
    feedbacks,
    addMessage,
    sendQuestion,
    newChat,
    clearChat,
    loadHistory,
    submitFeedback,
    removeFeedback,
    loadFeedback
  }
})
