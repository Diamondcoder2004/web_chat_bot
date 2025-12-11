<template>
  <header class="header">
    <div class="header-content">
      <!-- Логотип из локального файла -->
      <router-link to="/" class="logo">
        <img src="../assets/images/logo.png" alt="Башкирэнерго" class="logo-img">
        <span class="logo-text"></span>
      </router-link>

      <!-- Навигация -->
      <nav class="nav">
        <router-link to="/" class="nav-link">Главная</router-link>
        <router-link to="/history" class="nav-link">История</router-link>
        <router-link to="/profile" class="nav-link">Профиль</router-link>
      </nav>

      <!-- Кнопки входа/выхода -->
      <div class="auth">
        <span v-if="authStore.user" class="user-email">{{ authStore.user.email }}</span>
        <button v-if="authStore.user" @click="logout" class="btn-logout">Выйти</button>
        <router-link v-else to="/login" class="btn-login">Войти</router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.header {
  background: white;
  border-bottom: 1px solid #ddd;
  padding: 15px 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-img {
  height: 40px;
  width: auto;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #003366;
}

.nav {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: #333;
  text-decoration: none;
  padding: 8px 0;
  font-size: 16px;
  position: relative;
}

.nav-link:hover {
  color: #0066cc;
}

.nav-link.router-link-active {
  color: #0066cc;
  font-weight: 500;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #0066cc;
}

.auth {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-email {
  font-size: 14px;
  color: #666;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-logout, .btn-login {
  background: #0066cc;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-logout:hover, .btn-login:hover {
  background: #0052a3;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
  }

  .nav {
    gap: 15px;
  }

  .logo-text {
    display: none;
  }
}
</style>
