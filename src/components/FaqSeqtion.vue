<template>
  <div class="faq-section">
    <h3 class="faq-title">Частые вопросы (FAQ)</h3>
    
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

      <div v-else class="faq-cards-container">
        <div
          v-for="item in filteredFaq"
          :key="item.id"
          class="faq-card"
          :class="{ 'active': openFaqId === item.id }"
        >
          <div class="faq-question" @click="toggleFaq(item.id)">
            <div class="question-content">
              <span class="question-icon">❓</span>
              <span class="question-text">{{ item.question }}</span>
            </div>
            <span class="faq-toggle" :class="{ 'rotated': openFaqId === item.id }">▼</span>
          </div>
          <div v-if="openFaqId === item.id" class="faq-answer">
            <div class="answer-content">
              <span class="answer-icon">💡</span>
              <p class="answer-text">{{ item.answer }}</p>
            </div>
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
    item.question.toLowerCase().includes(query) ||
    item.answer.toLowerCase().includes(query)
  )
})

// Загрузка FAQ из CSV файла
async function loadFaqFromCsv() {
  loading.value = true
  try {
    const { data, error } = await supabase.storage
      .from('df')
      .download('faq_questions.csv')

    if (error) {
      console.error('Ошибка загрузки CSV:', error)
      faqData.value = getDefaultFaq()
      return
    }

    const text = await data.text()
    faqData.value = parseCsv(text)

  } catch (error) {
    console.error('Ошибка обработки FAQ:', error)
    faqData.value = getDefaultFaq()
  } finally {
    loading.value = false
  }
}

// Парсинг CSV
function parseCsv(csvText) {
  const lines = csvText.split('\n')
  const result = []

  const startIndex = lines[0].toLowerCase().includes('вопрос') ? 1 : 0

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    let question, answerText

    if (line.includes('","')) {
      const parts = line.split('","')
      if (parts.length >= 2) {
        question = parts[0].replace(/^"/, '').trim()
        answerText = parts[1].replace(/"$/, '').trim()
      }
    } else if (line.includes(',')) {
      const parts = line.split(',')
      if (parts.length >= 2) {
        question = parts[0].trim()
        answerText = parts.slice(1).join(',').trim()
      }
    } else {
      question = line
      answerText = 'Ответ не указан'
    }

    if (question && answerText) {
      result.push({
        id: i + 1,
        question: question,
        answer: answerText
      })
    }
  }

  return result
}

// Заглушка FAQ если CSV не загрузился
function getDefaultFaq() {
  return [
    { id: 1, question: 'Как подать заявку на технологическое присоединение?', answer: 'Заявку можно подать через личный кабинет на сайте или в клиентском офисе компании.' },
    { id: 2, question: 'Какие документы нужны для подключения?', answer: 'Паспорт, право собственности на объект, схема расположения энергопринимающих устройств.' },
    { id: 3, question: 'Сроки технологического присоединения?', answer: 'Стандартные сроки составляют от 3 до 30 рабочих дней в зависимости от категории заявителя.' }
  ]
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
  padding: 30px;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8efff 100%);
  border-radius: 12px;
  border: 2px solid #c7d2fe;
}

.faq-title {
  color: #1e3a8a;
  margin-bottom: 25px;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  padding-bottom: 15px;
  border-bottom: 3px solid #3b82f6;
}

.faq-search-box {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 2px solid #e0e7ff;
}

.faq-search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #c7d2fe;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.2s;
}

.faq-search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.faq-count {
  font-size: 14px;
  color: #6366f1;
  font-weight: 600;
  white-space: nowrap;
  background: #e0e7ff;
  padding: 6px 12px;
  border-radius: 6px;
}

.loading-faq, .empty-faq {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 16px;
  background: white;
  border-radius: 8px;
  border: 2px dashed #d1d5db;
}

.faq-list {
  background: transparent;
}

.faq-cards-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.faq-card:hover {
  border-color: #9ca3af;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.faq-card.active {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.faq-question {
  padding: 18px 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
  background: linear-gradient(to right, #eff6ff, white);
  border-left: 4px solid #3b82f6;
}

.faq-question:hover {
  background: linear-gradient(to right, #dbeafe, #eff6ff);
}

.question-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.question-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.question-text {
  font-weight: 600;
  color: #1f2937;
  flex: 1;
  font-size: 16px;
  line-height: 1.5;
}

.faq-toggle {
  font-size: 14px;
  color: #3b82f6;
  font-weight: bold;
  margin-left: 15px;
  transition: transform 0.3s ease;
  background: #dbeafe;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.faq-toggle.rotated {
  transform: rotate(180deg);
  background: #3b82f6;
  color: white;
}

.faq-answer {
  background: #f8fafc;
  border-top: 2px solid #e2e8f0;
  animation: slideDown 0.3s ease-out;
}

.answer-content {
  padding: 20px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.answer-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.answer-text {
  color: #374151;
  line-height: 1.7;
  font-size: 15px;
  margin: 0;
  white-space: pre-wrap;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .faq-section {
    padding: 20px;
    margin-top: 30px;
  }

  .faq-title {
    font-size: 20px;
  }

  .faq-search-box {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .faq-count {
    align-self: flex-start;
  }

  .question-text {
    font-size: 15px;
  }

  .answer-text {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .faq-question {
    padding: 15px;
  }

  .answer-content {
    padding: 15px;
  }
}
</style>
