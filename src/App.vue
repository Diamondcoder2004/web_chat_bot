<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { supabase } from './services/api'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()

    onMounted(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session && router.currentRoute.value.path !== '/auth') {
        router.push('/auth')
      }
    })
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f5f7fa;
}
</style>