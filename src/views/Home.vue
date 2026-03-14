<template>
  <div class="home">
    <Header />

    <div class="container">
      <!-- Приветствие -->
      <div class="welcome">
        <h1>Башкирэнерго - AI Ассистент</h1>
        <p>Задайте вопрос о технологическом присоединении к электросетям</p>
      </div>

      <!-- Поле для вопроса -->
      <div class="question-box">
        <textarea
          v-model="question"
          placeholder="Введите ваш вопрос здесь..."
          rows="3"
        ></textarea>
        <button @click="askQuestion" :disabled="loading" class="btn-ask">
          {{ loading ? 'Отправка...' : 'Задать вопрос' }}
        </button>
      </div>

      <!-- Ответ -->
      <div v-if="answer" class="answer-box">
        <h3>Ответ:</h3>
        <div class="answer-text">{{ answer }}</div>
      </div>

      <!-- Быстрые шаблоны -->
      <div class="quick-templates">
        <h3>Быстрые вопросы:</h3>
        <div class="templates">
          <button @click="useTemplate('технологическое присоединение')" class="template-btn">
            Технологическое присоединение
          </button>
          <button @click="useTemplate('документы для подключения')" class="template-btn">
            Документы для подключения
          </button>
          <button @click="useTemplate('сроки подключения')" class="template-btn">
            Сроки подключения
          </button>
          <button @click="useTemplate('стоимость подключения')" class="template-btn">
            Стоимость подключения
          </button>
          <button @click="useTemplate('тарифы на электроэнергию')" class="template-btn">
            Тарифы на электроэнергию
          </button>
          <button @click="useTemplate('технические условия')" class="template-btn">
            Технические условия
          </button>
        </div>
      </div>

      <!-- FAQ -->
      <div class="faq-section">
        <h3>Частые вопросы (FAQ)</h3>

        <!-- Поиск по FAQ -->
        <div class="faq-search-box">
          <input
            v-model="faqSearch"
            placeholder="Поиск в FAQ..."
            class="faq-search-input"
          >
          <span class="faq-count">Найдено: {{ filteredFaq.length }}</span>
        </div>

        <!-- Список FAQ -->
        <div class="faq-list">
          <div v-if="faqLoading" class="loading-faq">
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
    </div>

    <Footer />

    <!-- Кнопка чата -->
    <button @click="scrollToQuestion" class="chat-button">
      💬
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

import { chatService } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../services/supabase'

const authStore = useAuthStore()
const question = ref('')
const answer = ref('')
const loading = ref(false)
const faqSearch = ref('')
const openFaqId = ref(null)
const faqData = ref([])
const faqLoading = ref(false)

// Фильтрация FAQ
const filteredFaq = computed(() => {
  if (!faqSearch.value.trim()) {
    return faqData.value
  }

  const query = faqSearch.value.toLowerCase()
  return faqData.value.filter(item =>
    item.question.toLowerCase().includes(query) ||
    item.answer.toLowerCase().includes(query)
  )
})

// Загрузка FAQ из CSV файла в Supabase Storage
async function loadFaqFromCsv() {
  faqLoading.value = true
  try {
    // Пытаемся загрузить из Supabase Storage
    const { data, error } = await supabase.storage
      .from('df')
      .download('faq_question.csv')

    if (error) {
      console.error('Ошибка загрузки CSV:', error)
      // Если файла нет, используем заглушки
      faqData.value = getDefaultFaq()
      return
    }

    // Читаем CSV файл
    const text = await data.text()
    const parsedData = parseCsv(text)
    faqData.value = parsedData

  } catch (error) {
    console.error('Ошибка обработки FAQ:', error)
    faqData.value = getDefaultFaq()
  } finally {
    faqLoading.value = false
  }
}

// Парсинг CSV
function parseCsv(csvText) {
  const lines = csvText.split('\n')
  const result = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Пытаемся разобрать разные форматы CSV
    let question, answerText

    // Формат с кавычками: "Вопрос","Ответ"
    if (line.includes('","')) {
      const parts = line.split('","')
      if (parts.length >= 2) {
        question = parts[0].replace(/^"/, '').trim()
        answerText = parts[1].replace(/"$/, '').trim()
      }
    }
    // Формат без кавычек: Вопрос,Ответ
    else if (line.includes(',')) {
      const parts = line.split(',')
      if (parts.length >= 2) {
        question = parts[0].trim()
        answerText = parts.slice(1).join(',').trim()
      }
    }
    // Если не удалось распарсить, пропускаем или используем всю строку
    else {
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

// Отправка вопроса
async function askQuestion() {
  if (!question.value.trim()) {
    alert('Введите вопрос')
    return
  }

  if (!authStore.isAuthenticated) {
    alert('Для использования ассистента необходимо войти в систему')
    return
  }

  loading.value = true
  answer.value = ''

  try {
    const response = await apiService.askQuestion(question.value)
    answer.value = response.answer

    // Сохраняем в историю
    if (authStore.user) {
      await chatService.saveChat(authStore.user.id, question.value, response.answer)
    }
  } catch (error) {
    console.error('Ошибка:', error)
    answer.value = 'Произошла ошибка при получении ответа. Пожалуйста, попробуйте еще раз или проверьте подключение к интернету.'
  } finally {
    loading.value = false
  }
}

// Использование шаблона
function useTemplate(topic) {
  question.value = `Вопрос по теме "${topic}": `

  // Автоматически фокусируемся на текстовом поле
  const textarea = document.querySelector('textarea')
  if (textarea) {
    textarea.focus()
  }
}

// Переключение FAQ
function toggleFaq(id) {
  openFaqId.value = openFaqId.value === id ? null : id
}

// Прокрутка к полю вопроса
function scrollToQuestion() {
  const questionBox = document.querySelector('.question-box')
  if (questionBox) {
    questionBox.scrollIntoView({ behavior: 'smooth' })

    // Автоматически фокусируемся на текстовом поле
    const textarea = document.querySelector('textarea')
    if (textarea) {
      textarea.focus()
    }
  }
}

// Инициализация
onMounted(() => {
  loadFaqFromCsv()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  flex: 1;
}

/* Приветствие */
.welcome {
  text-align: center;
  margin-bottom: 40px;
  padding-top: 20px;
}

.welcome h1 {
  color: #003366;
  margin-bottom: 15px;
  font-size: 32px;
}

.welcome p {
  color: #666;
  font-size: 18px;
  line-height: 1.5;
}

/* Поле для вопроса */
.question-box {
  margin-bottom: 30px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.question-box textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 16px;
  margin-bottom: 15px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.question-box textarea:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.btn-ask {
  background: #0066cc;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;
}

.btn-ask:hover:not(:disabled) {
  background: #0052a3;
}

.btn-ask:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Ответ */
.answer-box {
  background: #f8f9fa;
  border-left: 4px solid #0066cc;
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 0 6px 6px 0;
}

.answer-box h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #003366;
  font-size: 20px;
}

.answer-text {
  line-height: 1.6;
  white-space: pre-wrap;
  color: #333;
  font-size: 16px;
}

/* Быстрые шаблоны */
.quick-templates {
  margin-bottom: 40px;
}

.quick-templates h3 {
  color: #003366;
  margin-bottom: 15px;
  font-size: 20px;
}

.templates {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.template-btn {
  background: #e3f2fd;
  border: 1px solid #0066cc;
  color: #0066cc;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
}

.template-btn:hover {
  background: #0066cc;
  color: white;
  transform: translateY(-1px);
}

/* FAQ секция */
.faq-section {
  margin-top: 40px;
  margin-bottom: 40px;
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
  border-radius: 6px;
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
  background: #f8f9fa;
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.loading-faq, .empty-faq {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.faq-list {
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  background: white;
}

.faq-item {
  border-bottom: 1px solid #ddd;
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
  background: white;
}

.faq-question:hover {
  background: #f8f9fa;
}

.question-text {
  font-weight: 500;
  color: #333;
  flex: 1;
  font-size: 16px;
  line-height: 1.4;
}

.faq-toggle {
  font-size: 20px;
  color: #0066cc;
  font-weight: bold;
  margin-left: 15px;
  min-width: 20px;
  text-align: center;
}

.faq-answer {
  padding: 15px;
  background: #f8f9fa;
  border-top: 1px solid #ddd;
  color: #333;
  line-height: 1.6;
  font-size: 15px;
}

/* Кнопка чата */
.chat-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: all 0.2s;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-button:hover {
  background: #0052a3;
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

/* Адаптивность */
@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  .welcome h1 {
    font-size: 24px;
  }

  .welcome p {
    font-size: 16px;
  }

  .templates {
    justify-content: center;
  }

  .template-btn {
    padding: 8px 12px;
    font-size: 13px;
  }

  .faq-search-box {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .faq-count {
    align-self: flex-start;
  }

  .chat-button {
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .question-box {
    padding: 15px;
  }

  .answer-box {
    padding: 15px;
  }

  .faq-question {
    padding: 12px;
  }

  .faq-answer {
    padding: 12px;
  }
}
</style>
