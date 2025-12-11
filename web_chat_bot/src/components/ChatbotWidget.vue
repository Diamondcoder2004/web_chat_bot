<template>
  <!-- Компонент для встраивания в существующую страницу Башкирэнерго -->
  <div class="chatbot-widget">
    <button 
      class="chatbot-button" 
      @click="toggleChat"
      :class="{ 'active': isChatOpen }"
    >
      <span class="chatbot-icon">💬</span>
    </button>
    
    <div 
      v-if="isChatOpen" 
      class="chatbot-popup"
      :class="{ 'minimized': isMinimized }"
    >
      <div class="chatbot-header" @dblclick="toggleMinimize">
        <h3>Чат-бот поддержки</h3>
        <div class="chatbot-controls">
          <button @click="toggleMinimize" class="control-btn">
            {{ isMinimized ? '🗗️' : '🗕️' }}
          </button>
          <button @click="closeChat" class="control-btn">✕</button>
        </div>
      </div>
      
      <div v-if="!isMinimized" class="chatbot-content">
        <div class="chat-messages" ref="messagesContainer">
          <div 
            v-for="(message, index) in messages" 
            :key="index" 
            :class="['message', message.sender]"
          >
            <div class="message-content">{{ message.text }}</div>
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
          <button @click="sendMessage" class="send-btn">➤</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'

export default {
  name: 'ChatbotWidget',
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
      isChatOpen: false,
      isMinimized: false,
      inputMessage: '',
      messages: [
        {
          text: 'Здравствуйте! Я чат-бот поддержки Башкирэнерго. Чем могу вам помочь?',
          sender: 'bot'
        }
      ]
    }
  },
  methods: {
    toggleChat() {
      this.isChatOpen = !this.isChatOpen
      if (this.isChatOpen) {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },
    
    closeChat() {
      this.isChatOpen = false
    },
    
    toggleMinimize() {
      this.isMinimized = !this.isMinimized
    },
    
    async sendMessage() {
      if (!this.inputMessage.trim()) return
      
      // Добавляем сообщение пользователя
      const userMessage = {
        text: this.inputMessage,
        sender: 'user'
      }
      
      this.messages.push(userMessage)
      const userInput = this.inputMessage
      this.inputMessage = ''
      
      // Прокручиваем вниз
      await this.scrollToBottom()
      
      // Имитация ответа бота
      setTimeout(() => {
        this.getBotResponse(userInput)
      }, 1000)
    },
    
    getBotResponse(userInput) {
      let botResponse = 'Спасибо за ваш запрос. Наш специалист свяжется с вами в ближайшее время.'
      
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
        sender: 'bot'
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
    }
  }
}
</script>

<style scoped>
.chatbot-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10000;
}

.chatbot-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #0057a0;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.chatbot-button:hover {
  background-color: #0077cc;
  transform: scale(1.05);
}

.chatbot-button.active {
  background-color: #ff6b00;
}

.chatbot-icon {
  transition: transform 0.3s ease;
}

.chatbot-popup {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 350px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chatbot-popup.minimized {
  width: 350px;
  height: 40px;
}

.chatbot-header {
  background-color: #0057a0;
  color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
}

.chatbot-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
}

.chatbot-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  padding: 2px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.chatbot-content {
  display: flex;
  flex-direction: column;
  height: 400px;
}

.chat-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: #f9f9f9;
}

.message {
  margin-bottom: 10px;
  max-width: 80%;
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
  padding: 8px 12px;
  border-radius: 18px;
  font-size: 14px;
}

.message.user .message-content {
  background-color: #0057a0;
  color: white;
}

.message.bot .message-content {
  background-color: #e5e5ea;
  color: black;
}

.chat-input-area {
  display: flex;
  padding: 10px;
  background: white;
  border-top: 1px solid #eee;
}

.message-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
}

.message-input:focus {
  border-color: #0057a0;
}

.send-btn {
  margin-left: 8px;
  background-color: #0057a0;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
}

.send-btn:hover {
  background-color: #0077cc;
}