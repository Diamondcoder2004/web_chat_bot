<template>
  <div class="faq-section">
    <h3>Частые вопросы (FAQ)</h3>

    <!-- Поиск по FAQ -->
    <div class="faq-search-box">
      <input
        v-model="searchQuery"
        placeholder="Поиск в FAQ..."
        @input="filterFaq"
        class="faq-search-input"
      >
      <span class="faq-count">Найдено: {{ filteredFaq.length }}</span>
    </div>

    <!-- Список FAQ -->
    <div class="faq-list">
      <div v-if="loading" class="loading-faq">
        Загрузка FAQ...
      </div>

      <div v-else-if="filteredFaq.length === 0" class="empty-faq">
        Нет вопросов для отображения
      </div>

      <div v-else>
        <div
          v-for="item in filteredFaq"
          :key="item.id"
          class="faq-item"
        >
          <div class="faq-question" @click="toggleFaq(item.id)">
            <span class="question-text">{{ item.question }}</span>
            <span class="faq-toggle">{{ openFaqId === item.id ? '−' : '+' }}</span>
          </div>
          <div v-if="openFaqId === item.id" class="faq-answer">
            {{ item.answer }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {supabase} from '../services/supabase'

const faqData = ref([])
const searchQuery = ref('')
const openFaqId = ref(null)
const loading = ref(false)

// Фильтрация FAQ
const filteredFaq = computed(() => {
  if (!searchQuery.value.trim()) {
    return faqData.value
  }

  const query = searchQuery.value.toLowerCase()
  return faqData.value.filter(item =>
    item. question.toLowerCase().includes(query) ||
    item.answer.toLowerCase().includes(query)
  )
})

// Загрузка FAQ из CSV файла
async function loadFaqFromCsv() {
  loading.value = true
  try {
    // Загружаем CSV файл из Supabase Storage
    const { data, error } = await supabase.storage
      .from('df')  // bucket name
      .download('faq_questions.csv')

    if (error) {
      console.error('Ошибка загрузки CSV:', error)
      return
    }

    // Читаем CSV файл
    const text = await data.text()
    faqData.value = parseCsv(text)

  } catch (error) {
    console.error('Ошибка обработки FAQ:', error)
  } finally {
    loading.value = false
  }
}

// Парсинг CSV
function parseCsv(csvText) {
  const lines = csvText.split('\n')
  const result = []

  // Пропускаем заголовок, если есть
  const startIndex = lines[0].toLowerCase().includes('вопрос') ? 1 : 0

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Простой парсинг CSV (разделитель - запятая)
    const parts = line.split(',')
    if (parts.length >= 2) {
      result.push({
        id: i + 1,
        question: parts[0].trim(),
        answer: parts[1].trim()
      })
    }
  }

  return result
}



// Переключение FAQ
function toggleFaq(id) {
  openFaqId.value = openFaqId.value === id ? null : id
}

// Фильтрация FAQ
function filterFaq() {
  // Автоматически фильтруется через computed свойство
}

onMounted(() => {
  loadFaqFromCsv()
})
</script>

<style scoped>
.faq-section {
  margin-top: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.faq-section h3 {
  color: #003366;
  margin-bottom: 20px;
  font-size: 20px;
}

.faq-search-box {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.faq-search-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.faq-search-input:focus {
  outline: none;
  border-color: #0066cc;
}

.faq-count {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.loading-faq, .empty-faq {
  text-align: center;
  padding: 30px;
  color: #666;
}

.faq-list {
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.faq-item {
  border-bottom: 1px solid #ddd;
  background: white;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  padding: 15px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
}

.faq-question:hover {
  background: #f5f5f5;
}

.question-text {
  font-weight: 500;
  color: #333;
  flex: 1;
}

.faq-toggle {
  font-size: 20px;
  color: #0066cc;
  font-weight: bold;
  margin-left: 10px;
}

.faq-answer {
  padding: 15px;
  background: #f8f9fa;
  border-top: 1px solid #ddd;
  color: #333;
  line-height: 1.5;
}
</style>
