<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content source-detail">
      <div class="modal-header">
        <h3>Детали источника</h3>
        <button @click="$emit('close')" class="modal-close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="detail-section">
          <h4>Файл</h4>
          <p class="filename">{{ formatFilename(source.filename) || 'Не указан' }}</p>
        </div>

        <div class="detail-section" v-if="source.breadcrumbs">
          <h4>Раздел</h4>
          <p>{{ source.breadcrumbs }}</p>
        </div>

        <div class="detail-section" v-if="source.category">
          <h4>Категория</h4>
          <p>{{ source.category }}</p>
        </div>

        <div class="detail-section" v-if="source.summary">
          <h4>Краткое содержание</h4>
          <p>{{ source.summary }}</p>
        </div>

        <div class="detail-section" v-if="source.content">
          <h4>Полное содержание</h4>
          <p class="full-content">{{ source.content }}</p>
        </div>

        <div class="detail-section">
          <h4>Оценки релевантности</h4>
          <div class="scores-grid">
            <div v-if="source.score_semantic !== undefined" class="score-card semantic">
              <span class="score-label">Смысловая</span>
              <span class="score-value">{{ formatScore(source.score_semantic) }}</span>
            </div>
            <div v-if="source.score_lexical !== undefined" class="score-card lexical">
              <span class="score-label">Словесная</span>
              <span class="score-value">{{ formatScore(source.score_lexical) }}</span>
            </div>
            <div v-if="source.score_hybrid !== undefined" class="score-card hybrid">
              <span class="score-label">Общая</span>
              <span class="score-value">{{ formatScore(source.score_hybrid) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="source.chunk_id">
          <h4>Chunk ID</h4>
          <p class="chunk-id">{{ source.chunk_id }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  source: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

defineEmits(['close'])

function formatScore(score) {
  if (score === undefined || score === null || score === '') return '0%'
  // Если оценка > 1, значит она уже в процентах (0-100)
  const normalizedScore = score > 1 ? score : score * 100
  return `${normalizedScore.toFixed(0)}%`
}

function formatFilename(filename) {
  if (!filename) return ''
  // Убираем расширение .md и заменяем подчёркивания на пробелы
  return filename
    .replace(/\.md$/i, '')
    .replace(/_/g, ' ')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.modal-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.modal-body {
  padding: 20px;
  max-height: calc(80vh - 70px);
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  color: #374151;
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 6px 0;
}

.detail-section p {
  margin: 0;
  color: #4b5563;
  line-height: 1.6;
  font-size: 14px;
}

.detail-section .filename {
  font-weight: 500;
  color: #0066cc;
  word-break: break-word;
}

.detail-section .full-content {
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  font-family: monospace;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
  font-size: 13px;
}

.detail-section .chunk-id {
  font-family: monospace;
  background: #f3f4f6;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 13px;
  color: #4b5563;
}

.scores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.score-card {
  padding: 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.score-card.semantic {
  background: #dbeafe;
  color: #1e40af;
}

.score-card.lexical {
  background: #fef3c7;
  color: #92400e;
}

.score-card.hybrid {
  background: #dcfce7;
  color: #166534;
}

.score-card .score-label {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
}

.score-card .score-value {
  font-size: 16px;
  font-weight: 700;
}
</style>
