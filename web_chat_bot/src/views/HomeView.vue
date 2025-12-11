<template>
  <div class="home-container">
    <!-- Контейнер для интеграции с сайтом Башкирэнерго -->
    <div class="main-content">
      <h1>Личный кабинет "Энергосфера"</h1>
      <p>Добро пожаловать в систему личного кабинета потребителя услуг Башкирэнерго</p>
      
      <!-- Кнопка/иконка для открытия чат-бота -->
      <div class="chat-button-container">
        <button class="chat-button" @click="openChat">
          <span class="chat-icon">💬</span>
          Чат-бот
        </button>
      </div>
      
      <!-- Основной контент страницы -->
      <div class="content-section">
        <h2>Ваши услуги</h2>
        <ul>
          <li>Просмотр показаний счетчиков</li>
          <li>Оплата счетов</li>
          <li>Подача заявок на технологическое присоединение</li>
          <li>Обращения в службу поддержки</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  methods: {
    openChat() {
      // Переход на страницу чата
      this.$router.push('/chat')
    }
  }
}
</script>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.main-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  max-width: 800px;
  width: 100%;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 20px;
}

p {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.chat-button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.chat-button {
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 20px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
}

.chat-button:hover {
  background-color: #2980b9;
}

.chat-icon {
  font-size: 18px;
}

.content-section h2 {
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

.content-section ul {
  list-style-type: none;
  padding-left: 0;
}

.content-section li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  padding-left: 20px;
  position: relative;
}

.content-section li:before {
  content: "✓";
  color: #27ae60;
  position: absolute;
  left: 0;
}
</style>