<template>
  <div class="form-container">
    <h2>Регистрация</h2>
    <form @submit.prevent="register">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Пароль (мин. 6 символов)" required minlength="6" />
      <button type="submit">Зарегистрироваться</button>
    </form>
    <p>Уже есть аккаунт? <router-link to="/auth">Войти</router-link></p>
  </div>
</template>

<script>
import { ref } from 'vue'
import { supabase } from '../services/api'

export default {
  name: 'RegisterForm',
  setup() {
    const email = ref('')
    const password = ref('')

    const register = async () => {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value
      })
      if (error) alert('Ошибка регистрации: ' + error.message)
      else alert('Проверьте почту для подтверждения!')
    }

    return { email, password, register }
  }
}
</script>