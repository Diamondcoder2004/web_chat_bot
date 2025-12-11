<template>
  <div class="login-container">
    <div class="login-form">
      <h2>Вход в личный кабинет</h2>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="email">Email или Логин</label>
          <input 
            type="text" 
            id="email" 
            v-model="email" 
            placeholder="Введите ваш email или логин"
            required
          >
        </div>
        
        <div class="input-group">
          <label for="password">Пароль</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="Введите ваш пароль"
            required
          >
        </div>
        
        <button type="submit" class="submit-btn">Войти</button>
        
        <div class="form-footer">
          <p>
            Нет аккаунта? 
            <router-link to="/register">Зарегистрироваться</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import supabase from '../lib/supabaseClient'

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    async handleLogin() {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: this.email,
          password: this.password
        })
        
        if (error) throw error
        
        // Перенаправление на главную страницу после успешного входа
        this.$router.push('/')
      } catch (error) {
        alert('Ошибка входа: ' + error.message)
        console.error('Ошибка входа:', error)
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.login-form {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 25px;
}

.input-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.submit-btn {
  width: 100%;
  background-color: #3498db;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

.submit-btn:hover {
  background-color: #2980b9;
}

.form-footer {
  margin-top: 20px;
  text-align: center;
}

.form-footer p {
  color: #666;
}

.form-footer a {
  color: #3498db;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style>