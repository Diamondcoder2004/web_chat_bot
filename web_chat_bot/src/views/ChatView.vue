<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>Чат-бот поддержки</h2>
      <button class="close-btn" @click="goHome">Закрыть</button>
    </div>
    
    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="(message, index) in messages" 
        :key="index" 
        :class="['message', message.sender]"
      >
        <div class="message-content">{{ message.text }}</div>
        <div class="message-time">{{ formatTime(message.timestamp) }}</div>
      </div>
    </div>
    
    <div class="chat-input-area">
      <input 
        type="text" 
        v-model="inputMessage" 
        @keyup.enter="sendMessage" 
        placeholder="Введите сообщение..."
        class="message-input"
      >
      <button @click="sendMessage" class="send-btn">Отправить</button>
    </div>
  </div>
</template>

<script>
import supabase from '../lib/supabaseClient'
import { ref, onMounted, nextTick } from 'vue'

export default {
  name: 'ChatView',
  setup() {
    const messagesContainer = ref(null)
    
    onMounted(async () => {
      await nextTick()
      scrollToBottom()
    })
    
    return {
      messagesContainer
    }
  },
  data() {
    return {
      inputMessage: '',
      messages: [
        {
          text: 'Здравствуйте! Я чат-бот поддержки Башкирэнерго. Чем могу вам помочь?',
          sender: 'bot',
          timestamp: new Date()
        }
      ]
    }
  },
  methods: {
    async sendMessage() {
      if (!this.inputMessage.trim()) return
      
      // Добавляем сообщение пользователя
      const userMessage = {
        text: this.inputMessage,
        sender: 'user',
        timestamp: new Date()
      }
      
      this.messages.push(userMessage)
      const userInput = this.inputMessage
      this.inputMessage = ''
      
      // Прокручиваем вниз
      await this.scrollToBottom()
      
      // Имитация ответа бота (в реальном приложении здесь будет вызов API)
      setTimeout(() => {
        this.getBotResponse(userInput)
      }, 1000)
    },
    
    getBotResponse(userInput) {
      // Простая логика ответа бота
      let botResponse = 'Спасибо за ваш запрос. Наш специалист свяжется с вами в ближайшее время.'
      
      // Проверяем ключевые слова в сообщении пользователя
      const lowerInput = userInput.toLowerCase()
      
      if (lowerInput.includes('счет') || lowerInput.includes('оплат')) {
        botResponse = 'Для оплаты счетов вы можете воспользоваться разделом "Оплата услуг" в личном кабинете. Также доступны сторонние сервисы оплаты.'
      } else if (lowerInput.includes('показания') || lowerInput.includes('счетчи')) {
        botResponse = 'Для передачи показаний счетчиков перейдите в раздел "Передать показания" в личном кабинете.'
      } else if (lowerInput.includes('отключ') || lowerInput.includes('подключ')) {
        botResponse = 'По вопросам технологического присоединения и отключения электроэнергии обращайтесь в соответствующий раздел личного кабинета или к специалистам.'
      } else if (lowerInput.includes('авария') || lowerInput.includes('обрыв') || lowerInput.includes('обрывает')) {
        botResponse = 'При аварийных ситуациях звоните в круглосуточную аварийную службу по телефону 8-800-200-5-200.'
      } else if (lowerInput.includes('привет') || lowerInput.includes('здравствуй')) {
        botResponse = 'Здравствуйте! Рады вас видеть в нашем личном кабинете. Могу ли я чем-то еще вам помочь?'
      }
      
      const botMessage = {
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }
      
      this.messages.push(botMessage)
      this.scrollToBottom()
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.messagesContainer) {
          this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight
        }
      })
    },
    
    formatTime(date) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chat-header {
  background-color: #3498db;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h2 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f9f9f9;
}

.message {
  margin-bottom: 15px;
  max-width: 80%;
  word-wrap: break-word;
}

.message.user {
  margin-left: auto;
  text-align: right;
}

.message.bot {
  margin-right: auto;
}

.message-content {
  display: inline-block;
  padding: 10px 15px;
  border-radius: 18px;
  margin-bottom: 5px;
}

.message.user .message-content {
  background-color: #3498db;
  color: white;
}

.message.bot .message-content {
  background-color: #e5e5ea;
  color: black;
}

.message-time {
  font-size: 12px;
  color: #888;
  text-align: right;
}

.message.user .message-time {
  text-align: right;
}

.message.bot .message-time {
  text-align: left;
}

.chat-input-area {
  display: flex;
  padding: 15px;
  background: white;
  border-top: 1px solid #eee;
}

.message-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 16px;
  outline: none;
}

.message-input:focus {
  border-color: #3498db;
}

.send-btn {
  margin-left: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.send-btn:hover {
  background-color: #2980b9;
}
</style>