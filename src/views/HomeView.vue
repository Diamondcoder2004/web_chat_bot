<template>
  <div class="home">
    <h1>Личный кабинет потребителя</h1>
    <p>Добро пожаловать в систему «Энергосфера»</p>
    <ChatButton />
  </div>
</template>

<script>
import ChatButton from '../components/ChatButton.vue'

export default {
  components: { ChatButton }
}
</script>

<style scoped>
.home {
  padding: 2rem;
  text-align: center;
}
</style>