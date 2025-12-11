<template>
  <div class="fixed bottom-6 right-6 z-50">
    <!-- Кнопка открытия чата -->
    <button
      v-if="!isOpen"
      @click="openChat"
      class="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      aria-label="Открыть ассистент"
    >
      <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
      </svg>
    </button>

    <!-- Окно чата -->
    <div
      v-else
      class="bg-white rounded-lg shadow-2xl w-96 h-[500px] flex flex-col"
    >
      <!-- Заголовок -->
      <div class="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
        <h3 class="font-semibold">🤖 Ассистент Башкирэнерго</h3>
        <button @click="closeChat" class="text-white hover:text-gray-200">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- История сообщений -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-for="(message, index) in messages" :key="index">
          <!-- Сообщение пользователя -->
          <div v-if="message.role === 'user'" class="flex justify-end mb-2">
            <div class="bg-primary text-white rounded-lg rounded-tr-none p-3 max-w-[80%]">
              {{ message.content }}
            </div>
          </div>

          <!-- Сообщение ассистента -->
          <div v-else class="flex justify-start mb-2">
            <div class="bg-gray-100 text-gray-800 rounded-lg rounded-tl-none p-3 max-w-[80%]">
              {{ message.content }}
              <!-- Источники -->
              <div v-if="message.sources && message.sources.length > 0" class="mt-2 pt-2 border-t border-gray-300">
                <p class="text-sm font-semibold mb-1">Источники:</p>
                <div v-for="(source, i) in message.sources" :key="i" class="text-xs text-gray-600 mb-1">
                  {{ i + 1 }}. {{ source.content.substring(0, 100) }}...
                  <span class="text-primary">(релевантность: {{ source.relevance_score }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Индикатор загрузки -->
        <div v-if="isLoading" class="flex justify-start">
          <div class="bg-gray-100 rounded-lg rounded-tl-none p-3">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Поле ввода -->
      <div class="border-t p-4">
        <form @submit.prevent="sendMessage" class="flex space-x-2">
          <input
            v-model="inputMessage"
            type="text"
            placeholder="Задайте вопрос о подключении..."
            class="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            :disabled="isLoading"
          />
          <button
            type="submit"
            class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
            :disabled="isLoading || !inputMessage.trim()"
          >
            Отправить
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { apiService } from '../services/api'
import { chatService } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()

const isOpen = ref(false)
const inputMessage = ref('')
const messages = ref([])
const isLoading = ref(false)
const messagesContainer = ref(null)

// Пример начальных сообщений
onMounted(() => {
  messages.value = [
    {
      role: 'assistant',
      content: 'Здравствуйте! Я ассистент Башкирэнерго. Задайте мне вопрос о технологическом присоединении, тарифах или услугах компании.'
    }
  ]
})

function openChat() {
  isOpen.value = true
}

function closeChat() {
  isOpen.value = false
}

async function sendMessage() {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = inputMessage.value.trim()
  messages.value.push({ role: 'user', content: userMessage })
  inputMessage.value = ''
  isLoading.value = true

  try {
    const response = await apiService.askQuestion(userMessage)

    messages.value.push({
      role: 'assistant',
      content: response.answer,
      sources: response.sources
    })

    // Сохраняем в историю если пользователь авторизован
    if (authStore.user) {
      await chatService.saveChat(authStore.user.id, userMessage, response.answer)
    }
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: 'Извините, произошла ошибка. Пожалуйста, попробуйте позже.'
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Автоматическая прокрутка при новых сообщениях
watch(messages, () => {
  scrollToBottom()
}, { deep: true })
</script>
