<template>
  <div class="history">
    <Header />

    <div class="container">
      <h1>История чатов</h1>

      <div class="search-box">
        <input
          v-model="searchQuery"
          placeholder="Поиск по истории..."
          @input="searchHistory"
        >
      </div>

      <div v-if="loading" class="loading">
        Загрузка истории...
      </div>

      <div v-else-if="filteredChats.length === 0" class="empty">
        История чатов пуста
      </div>

      <div v-else class="chat-list">
        <div v-for="chat in filteredChats" :key="chat.id" class="chat-item">
          <div class="chat-date">
            {{ formatDate(chat.created_at) }}
          </div>
          <div class="chat-question">
            <strong>Вопрос:</strong> {{ chat.question }}
          </div>
          <div class="chat-answer">
            <strong>Ответ:</strong> {{ chat.answer }}
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { useAuthStore } from '../stores/authStore'
import { chatService } from '../services/supabase'

const authStore = useAuthStore()
const chats = ref([])
const filteredChats = ref([])
const searchQuery = ref('')
const loading = ref(true)

// Загрузка истории
async function loadHistory() {
  if (!authStore.user) return

  loading.value = true
  try {
    const { data } = await chatService.getChatHistory(authStore.user.id)
    chats.value = data || []
    filteredChats.value = chats.value
  } catch (error) {
    console.error('Ошибка загрузки истории:', error)
  } finally {
    loading.value = false
  }
}

// Поиск по истории
function searchHistory() {
  if (!searchQuery.value.trim()) {
    filteredChats.value = chats.value
    return
  }

  const query = searchQuery.value.toLowerCase()
  filteredChats.value = chats.value.filter(chat =>
    chat.question.toLowerCase().includes(query) ||
    chat.answer.toLowerCase().includes(query)
  )
}

// Форматирование даты
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #003366;
  margin-bottom: 20px;
}

.search-box {
  margin-bottom: 20px;
}

.search-box input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #666;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chat-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
}

.chat-date {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.chat-question {
  margin-bottom: 10px;
  line-height: 1.5;
}

.chat-answer {
  line-height: 1.5;
  color: #333;
}
</style>
