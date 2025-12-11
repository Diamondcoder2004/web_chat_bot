import { defineStore } from 'pinia'
import { authService } from '../services/supabase'
import { ref, computed } from 'vue'
import { supabase } from '../services/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  async function init() {
    try {
      console.log('Инициализация auth store...')
      const currentUser = await authService.getCurrentUser()
      user.value = currentUser

      if (currentUser) {
        await loadProfile()
      }

      console.log('Auth store инициализирован')
    } catch (err) {
      console.error('Auth init error:', err)
      user.value = null
      profile.value = null
    }
  }

  async function login(email, password) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: authError } = await authService.signIn(email, password)

      if (authError) {
        throw new Error(authError.message || 'Ошибка авторизации')
      }

      user.value = data.user
      await loadProfile()
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Неверный email или пароль'
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function register(email, password, fullName) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: authError } = await authService.signUp(email, password, fullName)

      if (authError) {
        throw new Error(authError.message || 'Ошибка регистрации')
      }

      user.value = data.user
      // Профиль создается автоматически, нужно немного подождать
      await new Promise(resolve => setTimeout(resolve, 500))
      await loadProfile()
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Ошибка при регистрации'
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await authService.signOut()
      user.value = null
      profile.value = null
    } catch (err) {
      error.value = err.message
      console.error('Logout error:', err)
    }
  }

  // Загрузка профиля
  async function loadProfile() {
    if (!user.value) {
      profile.value = null
      return
    }

    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (profileError) {
        // Если профиля нет, создаем его
        if (profileError.code === 'PGRST116') {
          await createProfile()
          await loadProfile() // Повторно загружаем
        } else {
          throw profileError
        }
      } else {
        profile.value = data
      }
    } catch (err) {
      console.error('Ошибка загрузки профиля:', err)
      profile.value = null
    }
  }

  // Создание профиля
  async function createProfile() {
    if (!user.value) return

    try {
      const { data, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.value.id,
          email: user.value.email,
          full_name: user.value.user_metadata?.full_name || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) throw createError
      return data
    } catch (err) {
      console.error('Ошибка создания профиля:', err)
      throw err
    }
  }

  // Обновление профиля
  async function updateProfile(profileData) {
    if (!user.value) {
      return { success: false, error: 'Не авторизован' }
    }

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      profile.value = data
      return { success: true }
    } catch (err) {
      console.error('Ошибка обновления профиля:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    user,
    profile,
    isLoading,
    error,
    isAuthenticated,
    init,
    login,
    register,
    logout,
    loadProfile,
    updateProfile
  }
})
