<template>
  <div class="chat-overlay" @click.self="close">
    <div class="chat-widget">
      <div class="chat-header">
        <h3>AI-помощник Башкирэнерго</h3>
        <button @click="close">×</button>
      </div>
      <div class="chat-messages" ref="messages">
        <div v-for="(msg, i) in messages" :key="i" :class="['message', msg.role]">
          <strong v-if="msg.role === 'user'">Вы:</strong>
          <strong v-if="msg.role === 'bot'">AI:</strong>
          {{ msg.text }}
        </div>
      </div>
      <div class="chat-input">
        <input
            v-model="input"
            @keyup.enter="sendMessage"
            placeholder="Задайте вопрос..."
            :disabled="loading"
        />
        <button @click="sendMessage" :disabled="loading">Отправить</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick, onMounted } from 'vue'
import { askQuestion } from '../services/api'

export default {
  emits: ['close'],
  setup(_, { emit }) {
    const messages = ref([])
    const input = ref('')
    const loading = ref(false)
    const messagesEl = ref(null)

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
      })
    }

    const sendMessage = async () => {
      if (!input.value.trim() || loading.value) return

      const userMsg = { role: 'user', text: input.value }
      messages.value.push(userMsg)
      input.value = ''
      loading.value = true
      scrollToBottom()

      try {
        const response = await askQuestion(userMsg.text)
        messages.value.push({ role: 'bot', text: response.answer })
      } catch (e) {
        messages.value.push({ role: 'bot', text: 'Не удалось получить ответ: ' + e.message })
      } finally {
        loading.value = false
        scrollToBottom()
      }
    }

    const close = () => emit('close')

    onMounted(() => {
      messages.value.push({ role: 'bot', text: 'Здравствуйте! Чем могу помочь?' })
    })

    return { messages, input, loading, messagesEl, sendMessage, close, scrollToBottom }
  }
}
</script>

<style scoped>
.chat-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  z-index: 2000;
}
.chat-widget {
  width: 360px;
  height: 500px;
  background: white;
  margin: 20px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
.chat-header {
  padding: 12px 16px;
  background: #0056b3;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-header button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}
.chat-messages {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background: #f9f9f9;
}
.message {
  margin-bottom: 8px;
  padding: 6px 0;
}
.message.user { color: #0056b3; }
.message.bot { color: #333; }
.chat-input {
  display: flex;
  padding: 8px;
  border-top: 1px solid #eee;
}
.chat-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.chat-input button {
  margin-left: 8px;
  padding: 8px 12px;
  background: #0056b3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>