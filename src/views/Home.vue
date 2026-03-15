<template>
  <div class="home">
    <Header />

    <div class="main-layout">
      <!-- Левая колонка: быстрые шаблоны и FAQ -->
      <aside class="sidebar-left">
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

        <!-- FAQ (используем обновленный FaqSeqtion) -->
        <FaqSeqtion />
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

              <!-- Фидбек (только для ассистента) -->
              <div v-if="msg.role === 'assistant' && msg.sessionId" class="feedback">
                <button
                  class="feedback-btn"
                  :class="{ active: chatStore.feedbacks[msg.sessionId]?.feedback_type === 'like' }"
                  @click="handleFeedback(msg.sessionId, 'like')"
                  title="Полезно"
                >
                  👍
                </button>
                <button
                  class="feedback-btn"
                  :class="{ active: chatStore.feedbacks[msg.sessionId]?.feedback_type === 'dislike' }"
                  @click="handleFeedback(msg.sessionId, 'dislike')"
                  title="Не полезно"
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

        <!-- Панель настроек и поле ввода -->
        <div class="input-wrapper">
          <div class="settings-panel">
            <button @click="showSettings = !showSettings" class="settings-toggle">
              ⚙️ Параметры поиска
            </button>
            <div v-if="showSettings" class="settings-content">
              <div class="setting-row">
                <label>Кол-во документов (k): {{ searchParams.k }}</label>
                <input type="range" v-model.number="searchParams.k" min="5" max="50" step="1" />
              </div>
              <div class="setting-row">
                <label>Топ после реранка: {{ searchParams.rerank_top_k }}</label>
                <input type="range" v-model.number="searchParams.rerank_top_k" min="1" max="10" step="1" />
              </div>
              <div class="setting-row">
                <label>Температура: {{ searchParams.temperature.toFixed(1) }}</label>
                <input type="range" v-model.number="searchParams.temperature" min="0" max="1.5" step="0.1" />
              </div>
              <div class="setting-row">
                <label>Макс. токенов: {{ searchParams.max_tokens }}</label>
                <input type="range" v-model.number="searchParams.max_tokens" min="500" max="4000" step="100" />
              </div>
              <div class="setting-row">
                <label>Мин. оценка: {{ searchParams.min_score.toFixed(2) }}</label>
                <input type="range" v-model.number="searchParams.min_score" min="0" max="1" step="0.05" />
              </div>
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

      <!-- Правая колонка: источники -->
      <!-- Правая колонка: источники с деталями -->
      <aside class="sidebar-right" v-if="currentSources.length > 0">
        <div class="sources-panel">
          <h3>📚 Источники ответа</h3>
          <div class="sources-list">
            <div
              v-for="(source, idx) in currentSources"
              :key="idx"
              class="source-card-detailed"
              @click="openSourceModal(source)"
            >
              <div class="source-header">
                <span class="source-number">{{ idx + 1 }}</span>
                <span class="source-filename">{{ truncate(source.filename, 35) }}</span>
              </div>

              <div class="source-breadcrumbs" v-if="source.breadcrumbs">
                <span class="badge">📌 Раздел:</span> {{ source.breadcrumbs }}
              </div>

              <div class="source-content-preview" v-if="source.content">
                <span class="badge">📄 Содержание:</span>
                <p class="preview-text">{{ truncate(source.content, 150) }}</p>
              </div>

              <div class="source-summary" v-if="source.summary">
                <span class="badge">📝 Кратко:</span>
                <p class="preview-text">{{ truncate(source.summary, 120) }}</p>
              </div>

              <div class="source-metadata">
          <span class="metadata-item" v-if="source.category">
            <span class="badge">🏷️ Категория:</span> {{ source.category }}
          </span>
              </div>

              <div class="source-scores-detailed">
                <div class="score-item hybrid" :title="`Гибридная оценка: ${(source.score_hybrid * 100).toFixed(2)}%`">
                  <span class="score-label">Hybrid</span>
                  <span class="score-value">{{ (source.score_hybrid * 100).toFixed(0) }}%</span>
                </div>
                <div class="score-item rerank" :title="`Оценка реранкера: ${(source.score_rerank * 100).toFixed(2)}%`">
                  <span class="score-label">Rerank</span>
                  <span class="score-value">{{ (source.score_rerank * 100).toFixed(0) }}%</span>
                </div>
                <div class="score-item bm25" v-if="source.score_bm25" :title="`BM25: ${(source.score_bm25 * 100).toFixed(2)}%`">
                  <span class="score-label">BM25</span>
                  <span class="score-value">{{ (source.score_bm25 * 100).toFixed(0) }}%</span>
                </div>
              </div>

              <div class="source-footer">
                <span class="chunk-id" v-if="source.chunk_id">ID: {{ truncate(source.chunk_id, 10) }}</span>
                <span class="click-hint">👆 Подробнее</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
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
          <li>Гибридная: {{ (selectedSource.score_hybrid * 100).toFixed(2) }}%</li>
          <li>Реранк: {{ (selectedSource.score_rerank * 100).toFixed(2) }}%</li>
          <li>BM25: {{ (selectedSource.score_bm25 * 100).toFixed(2) }}%</li>
          <li>Hype: {{ (selectedSource.score_hype * 100).toFixed(2) }}%</li>
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
import FaqSeqtion from '../components/FaqSeqtion.vue'
import { useChatStore } from '../stores/chatStore'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const chatStore = useChatStore()

// Поле ввода
const newMessage = ref('')
const messagesContainer = ref(null)

// Параметры поиска
const searchParams = ref({
  k: 30,
  rerank_top_k: 3,
  temperature: 0.8,
  max_tokens: 2000,
  min_score: 0.0
})

// Видимость панели настроек
const showSettings = ref(false)

// Модальные окна
const selectedSource = ref(null)
const showStarRating = ref(false)
const tempStarRating = ref(0)
const currentFeedbackSessionId = ref(null)

// Текущие источники (из последнего сообщения ассистента)
const currentSources = computed(() => {
  const lastAssistant = [...chatStore.messages]
    .reverse()
    .find(m => m.role === 'assistant')
  return lastAssistant?.sources || []
})

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

// Фидбек
async function handleFeedback(sessionId, type) {
  if (!sessionId) {
    console.warn('Нет sessionId для фидбека')
    return
  }

  const current = chatStore.feedbacks[sessionId]
  try {
    if (current?.feedback_type === type) {
      await chatStore.removeFeedback(sessionId)
    } else {
      await chatStore.submitFeedback(sessionId, type)
    }
  } catch (err) {
    console.error('Ошибка фидбека:', err)
    alert('Не удалось отправить оценку. Попробуйте позже.')
  }
}

function openStarRating(sessionId) {
  if (!sessionId) {
    console.warn('Нет sessionId для звёздного рейтинга')
    return
  }
  currentFeedbackSessionId.value = sessionId
  showStarRating.value = true
}

async function submitStarRating(rating) {
  if (!currentFeedbackSessionId.value || rating < 1) return
  try {
    await chatStore.submitFeedback(currentFeedbackSessionId.value, 'star', rating)
    showStarRating.value = false
    tempStarRating.value = 0
    currentFeedbackSessionId.value = null
  } catch (err) {
    console.error('Ошибка звёздного рейтинга:', err)
    alert('Не удалось отправить оценку.')
  }
}

// Модалка с деталями источника
function openSourceModal(source) {
  selectedSource.value = source
}

// Вспомогательная функция обрезки текста
const truncate = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}





// Автоскролл при новых сообщениях
watch(() => chatStore.messages.length, scrollToBottom, { flush: 'post' })
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.main-layout {
  display: flex;
  flex: 1;
  min-height: 0;  /* Важно для правильной работы flex-детей */
  height: calc(100vh - 140px); /* Высота с учётом Header и Footer */
  overflow: hidden;
}

/* Левая колонка с прокруткой */
.sidebar-left {
  width: 420px;
  background: #f8f9fa;
  border-right: 1px solid #ddd;
  padding: 20px;
  overflow-y: auto;  /* Включаем вертикальную прокрутку */
  flex-shrink: 0;
  height: 100%;      /* Занимает всю высоту родителя */
}

/* Центральная колонка (чат) */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  min-width: 0;      /* Предотвращает переполнение */
  height: 100%;
  overflow: hidden;  /* Скрываем переполнение, прокрутка будет внутри сообщений */
}

/* Правая колонка (источники) */
.sidebar-right {
  width: 320px;
  background: #ffffff;
  border-left: 1px solid #ddd;
  padding: 20px;
  overflow-y: auto;  /* Тоже с прокруткой, если источников много */
  flex-shrink: 0;
  height: 100%;
}

/* Контейнер сообщений с прокруткой */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 0;
}

/* Остальные стили остаются без изменений */
.chat-header {
  padding: 10px 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
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
  max-width: 80%;
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

/* Панель настроек */
.input-wrapper {
  padding: 16px;
  background: #fff;
  border-top: 1px solid #ddd;
  flex-shrink: 0;
}

.settings-panel {
  margin-bottom: 12px;
}

.settings-toggle {
  width: 100%;
  padding: 10px;
  background: #e3f2fd;
  border: 1px solid #0066cc;
  color: #0066cc;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
}

.settings-content {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-top: 10px;
}

.setting-row {
  margin-bottom: 12px;
}

.setting-row label {
  display: block;
  margin-bottom: 5px;
  font-size: 13px;
  color: #333;
}

.setting-row input[type=range] {
  width: 100%;
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

/* Источники в правой панели */
.sources-panel h3 {
  font-size: 16px;
  color: #003366;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e7ff;
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.source-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.source-item:hover {
  background: #eff6ff;
  border-color: #3b82f6;
  transform: translateX(2px);
}

.source-number {
  width: 28px;
  height: 28px;
  background: #0066cc;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.source-info {
  flex: 1;
  min-width: 0;
}

.source-filename {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.source-breadcrumbs {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.source-scores {
  display: flex;
  gap: 8px;
  font-size: 11px;
}

.score {
  padding: 2px 6px;
  border-radius: 4px;
}

.score.hybrid {
  background: #dcfce7;
  color: #166534;
}

.score.rerank {
  background: #f3e8ff;
  color: #6b21a8;
}

/* Быстрые шаблоны */
.quick-templates h3 {
  margin-bottom: 10px;
  font-size: 16px;
  color: #003366;
}

.templates {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 25px;
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
  transition: all 0.2s;
}

.templates button:hover {
  background: #0066cc;
  color: white;
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

/* Адаптивность */
@media (max-width: 1200px) {
  .sidebar-right {
    width: 280px;
  }
}

@media (max-width: 992px) {
  .sidebar-right {
    display: none;
  }
}

@media (max-width: 768px) {
  .sidebar-left {
    display: none;
  }

  .chat-area {
    max-width: 100%;
  }
}


/* Улучшенные карточки источников */
.sources-panel h3 {
  font-size: 18px;
  color: #003366;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e7ff;
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.source-card-detailed {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.source-card-detailed:hover {
  border-color: #3b82f6;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.source-header {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.source-number {
  width: 28px;
  height: 28px;
  background: #0066cc;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.source-filename {
  font-weight: 600;
  font-size: 15px;
  color: #1f2937;
  flex: 1;
  word-break: break-word;
}

.badge {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  margin-right: 6px;
}

.source-breadcrumbs,
.source-content-preview,
.source-summary,
.source-metadata {
  font-size: 13px;
  line-height: 1.5;
  color: #374151;
}

.preview-text {
  margin: 4px 0 0 0;
  color: #4b5563;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.source-scores-detailed {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.score-item {
  flex: 1;
  min-width: 60px;
  padding: 6px 8px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 11px;
}

.score-item.hybrid {
  background: #dcfce7;
  color: #166534;
}

.score-item.rerank {
  background: #f3e8ff;
  color: #6b21a8;
}

.score-item.bm25 {
  background: #fff3cd;
  color: #856404;
}

.score-label {
  font-weight: 500;
  margin-bottom: 2px;
}

.score-value {
  font-weight: 700;
  font-size: 14px;
}

.source-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  font-size: 11px;
  color: #9ca3af;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}

.chunk-id {
  font-family: monospace;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.click-hint {
  color: #3b82f6;
  font-weight: 500;
}
</style>
