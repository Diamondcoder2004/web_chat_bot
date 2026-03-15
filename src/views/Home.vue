<template>
  <div class="home">
    <Header />

    <div class="main-layout">
      <!-- Левая колонка: быстрые шаблоны и FAQ -->
      <aside class="sidebar">
        <!-- Быстрые шаблоны -->
        <div class="quick-templates">
          <h3>Быстрые вопросы</h3>
          <div class="templates">
            <button @click="useTemplate('технологическое присоединение')">🔌 Техприсоединение</button>
            <button @click="useTemplate('документы для подключения')">📄 Документы</button>
            <button @click="useTemplate('сроки подключения')">⏱ Сроки</button>
            <button @click="useTemplate('стоимость подключения')">💰 Стоимость</button>
            <button @click="useTemplate('тарифы на электроэнергию')">⚡ Тарифы</button>
            <button @click="useTemplate('технические условия')">📋 Техусловия</button>
          </div>
        </div>

        <!-- FAQ -->
        <div class="faq-section">
          <h3>Частые вопросы</h3>
          <div class="faq-search">
            <input
              v-model="faqSearch"
              type="text"
              placeholder="Поиск в FAQ..."
            />
          </div>
          <div class="faq-list">
            <div v-if="faqLoading" class="faq-loading">Загрузка FAQ...</div>
            <div v-else-if="filteredFaq.length === 0" class="faq-empty">Нет вопросов</div>
            <div v-else>
              <div
                v-for="item in displayedFaq"
                :key="item.id"
                class="faq-item"
              >
                <div class="faq-question" @click="toggleFaq(item.id)">
                  <span>{{ item.question }}</span>
                  <span class="faq-toggle">{{ openFaqId === item.id ? '−' : '+' }}</span>
                </div>
                <div v-if="openFaqId === item.id" class="faq-answer">
                  {{ item.answer }}
                </div>
              </div>
              <button
                v-if="filteredFaq.length > 5 && !showAllFaq"
                @click="showAllFaq = true"
                class="faq-show-more"
              >
                Показать все ({{ filteredFaq.length }})
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Основная область чата -->
      <main class="chat-area">
        <!-- Шапка чата с кнопкой "Новый чат" -->
        <div class="chat-header">
          <button @click="handleNewChat" class="new-chat-btn" :disabled="chatStore.isLoading">
            🆕 Новый чат
          </button>
        </div>

        <!-- Сообщения -->
        <div class="messages-container" ref="messagesContainer">
          <div
            v-for="(msg, index) in chatStore.messages"
            :key="msg.id"
            class="message"
            :class="{ 'user-message': msg.role === 'user', 'assistant-message': msg.role === 'assistant' }"
          >
            <div class="message-bubble">
              <div class="message-content">{{ msg.content }}</div>

              <!-- Источники (только для ассистента) -->
              <div v-if="msg.role === 'assistant' && msg.sources?.length" class="sources">
                <div class="sources-title">Источники:</div>
                <div class="source-cards">
                  <div
                    v-for="(src, idx) in msg.sources.slice(0, 3)"
                    :key="idx"
                    class="source-card"
                    @click="openSourceModal(src)"
                  >
                    <div class="source-header">
                      <span class="source-filename">{{ truncate(src.filename, 20) }}</span>
                      <button class="source-detail-btn" @click.stop="openSourceModal(src)">🔍</button>
                    </div>
                    <div class="source-breadcrumbs">{{ src.breadcrumbs || '—' }}</div>
                    <div class="source-summary">{{ truncate(src.summary, 80) }}</div>
                    <div class="source-content-preview" v-if="src.content">
                      {{ truncate(src.content, 120) }}
                    </div>
                    <div class="source-scores">
                      <span title="Гибридная оценка">🔹 {{ src.score_hybrid?.toFixed(2) }}</span>
                      <span title="Оценка реранкера">⭐ {{ src.score_rerank?.toFixed(2) }}</span>
                    </div>
                  </div>
                  <div
                    v-if="msg.sources.length > 3"
                    class="source-card more"
                    @click="showAllSources(msg)"
                  >
                    +{{ msg.sources.length - 3 }} ещё
                  </div>
                </div>
              </div>

              <!-- Фидбек (только для ассистента) -->
              <div v-if="msg.role === 'assistant' && msg.sessionId" class="feedback">
                <button
                  class="feedback-btn"
                  :class="{ active: chatStore.feedbacks[msg.sessionId]?.feedback_type === 'like' }"
                  @click="handleFeedback(msg.sessionId, 'like')"
                  title="Нравится"
                >
                  👍
                </button>
                <button
                  class="feedback-btn"
                  :class="{ active: chatStore.feedbacks[msg.sessionId]?.feedback_type === 'dislike' }"
                  @click="handleFeedback(msg.sessionId, 'dislike')"
                  title="Не нравится"
                >
                  👎
                </button>
                <button
                  class="feedback-btn star-btn"
                  :class="{ active: chatStore.feedbacks[msg.sessionId]?.feedback_type === 'star' }"
                  @click="openStarRating(msg.sessionId)"
                  title="Оценить звёздами"
                >
                  ★
                </button>
              </div>
            </div>
          </div>
          <div v-if="chatStore.isLoading" class="message assistant-message">
            <div class="message-bubble typing">✍️ Печатает...</div>
          </div>
        </div>

        <!-- Поле ввода с параметрами -->
        <div class="input-wrapper">
          <div class="input-toolbar">
            <button @click="toggleOptions" class="toolbar-btn">⚙️</button>
          </div>
          <div v-if="showOptions" class="options-panel">
            <div class="option-row">
              <span>k (кол-во документов):</span>
              <input type="range" v-model.number="searchParams.k" min="5" max="50" step="1" />
              <span class="option-value">{{ searchParams.k }}</span>
            </div>
            <div class="option-row">
              <span>Ранжирование топ:</span>
              <input type="range" v-model.number="searchParams.rerank_top_k" min="1" max="10" step="1" />
              <span class="option-value">{{ searchParams.rerank_top_k }}</span>
            </div>
            <div class="option-row">
              <span>Температура:</span>
              <input type="range" v-model.number="searchParams.temperature" min="0" max="1.5" step="0.1" />
              <span class="option-value">{{ searchParams.temperature.toFixed(1) }}</span>
            </div>
            <div class="option-row">
              <span>Макс. токенов:</span>
              <input type="range" v-model.number="searchParams.max_tokens" min="500" max="4000" step="100" />
              <span class="option-value">{{ searchParams.max_tokens }}</span>
            </div>
            <div class="option-row">
              <span>Мин. оценка:</span>
              <input type="range" v-model.number="searchParams.min_score" min="0" max="1" step="0.05" />
              <span class="option-value">{{ searchParams.min_score.toFixed(2) }}</span>
            </div>
          </div>
          <div class="input-area">
            <textarea
              v-model="newMessage"
              @keydown.enter.prevent="sendMessage"
              placeholder="Введите ваш вопрос..."
              rows="1"
            ></textarea>
            <button @click="sendMessage" :disabled="!newMessage.trim() || chatStore.isLoading">
              Отправить
            </button>
          </div>
        </div>
      </main>
    </div>

    <Footer />

    <!-- Модальное окно деталей источника -->
    <div v-if="selectedSource" class="modal-overlay" @click.self="selectedSource = null">
      <div class="modal-content source-detail">
        <h3>Детали источника</h3>
        <p><strong>Файл:</strong> {{ selectedSource.filename }}</p>
        <p><strong>Раздел:</strong> {{ selectedSource.breadcrumbs || '—' }}</p>
        <p><strong>Кратко:</strong> {{ selectedSource.summary }}</p>
        <p><strong>Оценки:</strong></p>
        <ul>
          <li>Гибридная: {{ selectedSource.score_hybrid?.toFixed(3) }}</li>
          <li>Реранк: {{ selectedSource.score_rerank?.toFixed(3) }}</li>
          <li>BM25: {{ selectedSource.score_bm25?.toFixed(3) }}</li>
          <li>Hype: {{ selectedSource.score_hype?.toFixed(3) }}</li>
        </ul>
        <button @click="selectedSource = null">Закрыть</button>
      </div>
    </div>

    <!-- Модальное окно звёздного рейтинга -->
    <div v-if="showStarRating" class="modal-overlay" @click.self="showStarRating = false">
      <div class="modal-content">
        <h3>Оцените ответ</h3>
        <div class="star-rating">
          <span
            v-for="star in 5"
            :key="star"
            @click="submitStarRating(star)"
            @mouseover="tempStarRating = star"
            @mouseleave="tempStarRating = 0"
            :class="{ active: star <= tempStarRating }"
          >
            ★
          </span>
        </div>
        <div class="star-actions">
          <button @click="showStarRating = false">Отмена</button>
          <button @click="submitStarRating(tempStarRating)" :disabled="!tempStarRating">Оценить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { useChatStore } from '../stores/chatStore'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../services/supabase'

const authStore = useAuthStore()
const chatStore = useChatStore()

// Поле ввода
const newMessage = ref('')
const messagesContainer = ref(null)

// Параметры поиска (значения по умолчанию)
const searchParams = ref({
  k: 30,
  rerank_top_k: 3,
  temperature: 0.8,
  max_tokens: 2000,
  min_score: 0.0
})

// Видимость панели параметров
const showOptions = ref(false)

// Модальные окна
const selectedSource = ref(null)
const showStarRating = ref(false)
const tempStarRating = ref(0)
const currentFeedbackSessionId = ref(null)

// FAQ
const faqSearch = ref('')
const openFaqId = ref(null)
const faqData = ref([])
const faqLoading = ref(false)
const showAllFaq = ref(false)

// Фильтрация FAQ
const filteredFaq = computed(() => {
  if (!faqSearch.value.trim()) return faqData.value
  const q = faqSearch.value.toLowerCase()
  return faqData.value.filter(item =>
    item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
  )
})

// Отображаемые вопросы (первые 5 или все)
const displayedFaq = computed(() => {
  if (showAllFaq.value) return filteredFaq.value
  return filteredFaq.value.slice(0, 5)
})

// Загрузка FAQ из CSV
async function loadFaq() {
  faqLoading.value = true
  try {
    const { data, error } = await supabase.storage
      .from('df')
      .download('faq_question.csv')
    if (error) throw error
    const text = await data.text()
    faqData.value = parseCsv(text)
  } catch (err) {
    console.error('Ошибка загрузки FAQ:', err)
    faqData.value = getDefaultFaq()
  } finally {
    faqLoading.value = false
  }
}

function parseCsv(csv) {
  const lines = csv.split('\n')
  const result = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const parts = line.split(',')
    if (parts.length >= 2) {
      result.push({
        id: i,
        question: parts[0].replace(/^"|"$/g, '').trim(),
        answer: parts.slice(1).join(',').replace(/^"|"$/g, '').trim()
      })
    }
  }
  return result
}

function getDefaultFaq() {
  return [
    { id: 1, question: 'Как подать заявку на подключение?', answer: 'Заявку можно подать через личный кабинет или в офисе.' },
    { id: 2, question: 'Какие документы нужны?', answer: 'Паспорт, ИНН, документы на участок.' }
  ]
}

function toggleFaq(id) {
  openFaqId.value = openFaqId.value === id ? null : id
}

// Вспомогательная функция обрезки текста
const truncate = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}

// Использование шаблона
function useTemplate(topic) {
  newMessage.value = `Вопрос по теме "${topic}": `
  const textarea = document.querySelector('textarea')
  if (textarea) textarea.focus()
}

// Отправка сообщения
async function sendMessage() {
  const text = newMessage.value.trim()
  if (!text || chatStore.isLoading) return
  newMessage.value = ''
  try {
    await chatStore.sendQuestion(text, searchParams.value)
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Ошибка отправки:', err)
  }
}

// Прокрутка вниз
function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Начать новый чат
function handleNewChat() {
  chatStore.newChat()
  newMessage.value = ''
}

// Переключение панели параметров
function toggleOptions() {
  showOptions.value = !showOptions.value
}

// Фидбек
async function handleFeedback(sessionId, type) {
  if (!sessionId) return
  const current = chatStore.feedbacks[sessionId]
  if (current?.feedback_type === type) {
    await chatStore.removeFeedback(sessionId)
  } else {
    await chatStore.submitFeedback(sessionId, type)
  }
}

function openStarRating(sessionId) {
  currentFeedbackSessionId.value = sessionId
  showStarRating.value = true
}

async function submitStarRating(rating) {
  if (!currentFeedbackSessionId.value || rating < 1) return
  await chatStore.submitFeedback(currentFeedbackSessionId.value, 'star', rating)
  showStarRating.value = false
  tempStarRating.value = 0
  currentFeedbackSessionId.value = null
}

// Модалка с деталями источника
function openSourceModal(source) {
  selectedSource.value = source
}

function showAllSources(msg) {
  // Можно показать все источники в модалке, например:
  selectedSource.value = { ...msg.sources[0], all: true } // упрощённо
}

// При монтировании загружаем FAQ и устанавливаем автоскролл
onMounted(async () => {
  await loadFaq()
  watch(() => chatStore.messages.length, scrollToBottom, { flush: 'post' })
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-layout {
  display: flex;
  flex: 1;
  height: calc(100vh - 140px); /* Подогнать под Header и Footer */
}

.sidebar {
  width: 300px;
  background: #f8f9fa;
  border-right: 1px solid #ddd;
  padding: 20px;
  overflow-y: auto;
  flex-shrink: 0;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  height: 100%;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.chat-header {
  padding: 10px 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: flex-end;
}

.new-chat-btn {
  background: #0066cc;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.new-chat-btn:hover:not(:disabled) {
  background: #0052a3;
}

.new-chat-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  display: flex;
  margin-bottom: 10px;
}

.user-message {
  justify-content: flex-end;
}

.assistant-message {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  background: #f1f1f1;
  color: #333;
  word-wrap: break-word;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid rgba(0,0,0,0.05);
}

.user-message .message-bubble {
  background: #0066cc;
  color: white;
  border-bottom-right-radius: 4px;
  border-color: #0052a3;
}

.assistant-message .message-bubble {
  background: #e9ecef;
  border-bottom-left-radius: 4px;
  border-color: #ced4da;
}

.typing {
  font-style: italic;
  color: #666;
}

/* Источники */
.sources {
  margin-top: 10px;
  border-top: 1px solid rgba(0,0,0,0.1);
  padding-top: 10px;
}

.sources-title {
  font-size: 12px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
}

.source-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.source-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px;
  font-size: 12px;
  cursor: pointer;
  width: calc(33% - 6px);
  transition: all 0.2s;
}

.source-card:hover {
  border-color: #0066cc;
  box-shadow: 0 2px 8px rgba(0,102,204,0.1);
}

.source-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.source-filename {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.source-detail-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  color: #666;
}

.source-breadcrumbs {
  color: #888;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.source-summary {
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 4px 0;
}

.source-content-preview {
  color: #666;
  font-size: 11px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 4px 0;
  padding: 4px;
  background: #f5f5f5;
  border-radius: 4px;
}

.source-scores {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #888;
  margin-top: 4px;
}

.source-card.more {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f1f1;
  font-weight: 500;
}

/* Фидбек */
.feedback {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  justify-content: flex-end;
}

.feedback-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s, transform 0.1s;
  padding: 4px;
}

.feedback-btn.active {
  opacity: 1;
  transform: scale(1.1);
}

.feedback-btn:hover {
  opacity: 1;
}

.star-btn {
  font-size: 22px;
}

/* Поле ввода и параметры */
.input-wrapper {
  padding: 16px;
  background: #fff;
  border-top: 1px solid #ddd;
}

.input-toolbar {
  display: flex;
  margin-bottom: 8px;
}

.toolbar-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
}

.options-panel {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.option-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.option-row span:first-child {
  width: 140px;
  font-size: 14px;
}

.option-row input {
  flex: 1;
  margin: 0 8px;
}

.option-value {
  width: 40px;
  text-align: right;
  font-size: 14px;
  color: #666;
}

.input-area {
  display: flex;
}

.input-area textarea {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 24px;
  resize: none;
  font-size: 16px;
  outline: none;
}

.input-area button {
  margin-left: 10px;
  padding: 0 24px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.input-area button:hover:not(:disabled) {
  background: #0052a3;
}

.input-area button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Быстрые шаблоны */
.quick-templates h3, .faq-section h3 {
  margin-bottom: 10px;
  font-size: 16px;
  color: #003366;
}

.templates {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.templates button {
  padding: 8px 12px;
  background: #e3f2fd;
  border: 1px solid #0066cc;
  border-radius: 6px;
  color: #0066cc;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

/* FAQ */
.faq-search input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
}

.faq-item {
  border-bottom: 1px solid #eee;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  cursor: pointer;
  font-size: 14px;
}

.faq-question:hover {
  color: #0066cc;
}

.faq-toggle {
  font-weight: bold;
  color: #0066cc;
}

.faq-answer {
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 10px;
}

.faq-show-more {
  width: 100%;
  padding: 8px;
  background: none;
  border: 1px dashed #0066cc;
  color: #0066cc;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
}

/* Модальные окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.source-detail {
  max-width: 600px;
}

/* Звёздный рейтинг */
.star-rating {
  display: flex;
  gap: 10px;
  font-size: 30px;
  justify-content: center;
  margin: 20px 0;
  cursor: pointer;
}

.star-rating span {
  color: #ccc;
  transition: color 0.2s;
}

.star-rating span.active,
.star-rating span:hover {
  color: gold;
}

.star-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>
