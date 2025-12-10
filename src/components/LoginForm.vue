<template>
  <div class="form-container">
    <h2>Вход в личный кабинет</h2>
    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Пароль" required />
      <button type="submit">Войти</button>
    </form>
    <p>Нет аккаунта? <router-link to="/auth?tab=register">Зарегистрироваться</router-link></p>
  </div>
</template>

<script>
import { ref } from 'vue'
import { supabase } from '../services/api'

export default {
  name: 'LoginForm',
  setup() {
    const email = ref('')
    const password = ref('')

    const login = async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      })
      if (error) alert('Ошибка входа: ' + error.message)
      else location.reload() // или перенаправление
    }

    return { email, password, login }
  }
}
</script>