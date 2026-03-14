import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chatService, feedbackService } from '../services/supabase'
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
// Вместо apiService.askQuestion используем chatService.sendQuery
  async function sendQuestion(question, parameters = {}) {
    isLoading.value = true;
    error.value = null;

    try {
      // Добавляем вопрос пользователя
      addMessage('user', question);

      console.log('Sending question to RAG API via chatService...');
      // Формируем параметры запроса
      const params = {
        k: parameters.top_k || 30,                 // переименовать в соответствии с QueryRequest
        rerank_top_k: parameters.rerank_top_k || 3,
        temperature: parameters.temperature || 0.8,
        max_tokens: parameters.max_tokens || 2000,
        min_score: parameters.min_score || 0.0
      };
      const response = await chatService.sendQuery(question, params);

      // Добавляем ответ ассистента
      addMessage('assistant', response.answer, response.sources || []);

      // Сохранение в БД происходит на бэкенде автоматически — не нужно вызывать дополнительно

      return response;
    } catch (err) {
      error.value = err.message || 'Ошибка при обработке вопроса';
      console.error('Send question error:', err);
      addMessage('assistant', 'Извините, произошла ошибка. Пожалуйста, попробуйте позже.');
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // В chatStore.js добавить
  const feedbacks = ref({}); // key: chatId, value: feedback object

  async function submitFeedback(chatId, type, rating, comment) {
    try {
      const result = await feedbackService.createFeedback(chatId, type, rating, comment);
      feedbacks.value[chatId] = result;
      return result;
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      throw err;
    }
  }

  async function loadFeedback(chatId) {
    try {
      const result = await feedbackService.getFeedback(chatId);
      if (result) feedbacks.value[chatId] = result;
    } catch (err) {
      console.error('Failed to load feedback:', err);
    }
  }



  // Загрузить историю чатов
  async function loadHistory(limit = 50) {
    if (!authStore.user) {
      console.log('User not authenticated, skipping history load');
      return;
    }

    try {
      const data = await chatService.getHistory(limit); // ← исправлено
      history.value = data || [];
      console.log('Chat history loaded:', history.value.length, 'items');
    } catch (err) {
      console.error('Failed to load chat history:', err);
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
    feedbacks,        // добавить, если хотите использовать
    addMessage,
    sendQuestion,
    loadHistory,
    clearChat,
    submitFeedback,   // добавить
    loadFeedback      // добавить
  }
})
