<template>
  <div class="auth-page">
    <div v-if="tab === 'login'">
      <LoginForm />
    </div>
    <div v-else>
      <RegisterForm />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LoginForm from '../components/LoginForm.vue'
import RegisterForm from '../components/RegisterForm.vue'

export default {
  components: { LoginForm, RegisterForm },
  setup() {
    const route = useRoute()
    const tab = ref('login')

    onMounted(() => {
      tab.value = route.query.tab === 'register' ? 'register' : 'login'
    })

    return { tab }
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f7fa;
}
.form-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}
.form-container input {
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.form-container button {
  width: 100%;
  padding: 0.75rem;
  background: #0056b3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>