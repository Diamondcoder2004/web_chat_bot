<template>
  <button class="chat-button" @click="toggleChat">
    💬
  </button>
  <teleport to="body">
    <ChatWidget v-if="isOpen" @close="isOpen = false" />
  </teleport>
</template>

<script>
import { ref } from 'vue'
import ChatWidget from './ChatWidget.vue'

export default {
  components: { ChatWidget },
  setup() {
    const isOpen = ref(false)
    const toggleChat = () => { isOpen.value = !isOpen.value }
    return { isOpen, toggleChat }
  }
}
</script>

<style scoped>
.chat-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #0056b3;
  color: white;
  font-size: 24px;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  cursor: pointer;
  z-index: 1000;
}
</style>