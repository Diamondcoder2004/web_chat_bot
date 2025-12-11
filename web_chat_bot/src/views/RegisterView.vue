<template>
  <div class="register-container">
    <div class="register-form">
      <h2>Регистрация в личном кабинете</h2>
      <form @submit.prevent="handleRegister">
        <div class="input-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="Введите ваш email"
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
            minlength="6"
          >
        </div>
        
        <div class="input-group">
          <label for="confirmPassword">Подтверждение пароля</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            placeholder="Подтвердите ваш пароль"
            required
            minlength="6"
          >
        </div>
        
        <button type="submit" class="submit-btn">Зарегистрироваться</button>
        
        <div class="form-footer">
          <p>
            Уже есть аккаунт? 
            <router-link to="/login">Войти</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import supabase from '../lib/supabaseClient'

export default {
  name: 'RegisterView',
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: ''
    }
  },
  methods: {
    async handleRegister() {
      // Проверяем совпадение паролей
      if (this.password !== this.confirmPassword) {
        alert('Пароли не совпадают')
        return
      }
      
      try {
        const { data, error } = await supabase.auth.signUp({
          email: this.email,
          password: this.password
        })
        
        if (error) throw error
        
        if (data.user) {
          alert('Регистрация прошла успешно! Проверьте ваш email для подтверждения.')
          this.$router.push('/login')
        } else {
          alert('Регистрация прошла успешно! Проверьте ваш email для подтверждения.')
          this.$router.push('/login')
        }
      } catch (error) {
        alert('Ошибка регистрации: ' + error.message)
        console.error('Ошибка регистрации:', error)
      }
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.register-form {
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
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

.submit-btn:hover {
  background-color: #219653;
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