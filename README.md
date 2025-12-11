🏭 AI Ассистент Башкирэнерго
Система вопросно-ответного чат-бота для компании "Башкирэнерго" с использованием RAG (Retrieval-Augmented Generation) технологии.

🚀 Технологический стек
Фронтенд (Клиентская часть)
Vue.js 3 - прогрессивный JavaScript фреймворк

Vue Router - маршрутизация для SPA

Pinia - управление состоянием приложения

Axios - HTTP клиент для работы с API

Supabase JS Client - работа с базой данных и аутентификацией

Tailwind CSS (опционально) - утилитарные CSS классы

Бэкенд (Серверная часть)
FastAPI - Python веб-фреймворк для создания API

Ollama - локальная LLM (используется модель bambucha/saiga-llama3)

LangChain - фреймворк для работы с языковыми моделями

Qdrant - векторная база данных для семантического поиска

Sentence Transformers - модели для создания эмбеддингов

База данных и инфраструктура
Supabase - облачная платформа (PostgreSQL + Auth + Storage)

PostgreSQL - реляционная база данных

Docker - контейнеризация сервисов

📋 Предварительные требования
1. Обязательные компоненты
   text
   Node.js 18+ и npm
   Python 3.9+
   Docker и Docker Compose
   Git
2. Локальные сервисы для запуска
   Supabase (локально через Docker)
   bash
# Установка Supabase CLI
npm install -g supabase

# Инициализация проекта
supabase init

# Запуск локального Supabase
supabase start
Порт: 54321 (веб-интерфейс), 54322 (база данных)

Ollama (локальная LLM)
bash
# Установка Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Загрузка модели
ollama pull bambucha/saiga-llama3

# Запуск Ollama
ollama serve
Порт: 11434

Qdrant (векторная БД)
bash
# Запуск через Docker
docker run -p 6333:6333 qdrant/qdrant
Порт: 6333

FastAPI RAG сервис
python
# requirements.txt
fastapi
uvicorn
langchain
langchain-ollama
qdrant-client
sentence-transformers
python-dotenv
🛠 Установка и запуск
1. Клонирование репозитория
   bash
   git clone <repository-url>
   cd bashkirenergo-chat
2. Настройка фронтенда
   bash
   cd frontend
   npm install
   cp .env.example .env.local
   .env.local настройки:

env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_API_RAG=http://localhost:8880/ask
3. Настройка бэкенда
   bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   .env настройки:

env
OLLAMA_HOST=http://localhost:11434
QDRANT_HOST=localhost
COLLECTION_NAME=bashkir_energo_minilm_v2
OLLAMA_MODEL=bambucha/saiga-llama3
4. Подготовка данных
   bash
# Загрузка документов в векторную БД
python scripts/ingest_documents.py

# Загрузка FAQ в Supabase Storage
supabase storage upload df/faq_question.csv ./data/faq_questions.csv
5. Запуск системы
   bash
# Терминал 1: Supabase
supabase start

# Терминал 2: Ollama
ollama serve

# Терминал 3: Qdrant
docker run -p 6333:6333 qdrant/qdrant

# Терминал 4: FastAPI бэкенд
cd backend
uvicorn main:app --reload --port 8880

# Терминал 5: Vue.js фронтенд
cd frontend
npm run dev
📁 Структура проекта
text
bashkirenergo-chat/
├── frontend/                    # Vue.js приложение
│   ├── src/
│   │   ├── components/         # Компоненты Vue
│   │   ├── views/             # Страницы приложения
│   │   ├── stores/            # Состояние Pinia
│   │   ├── services/          # API клиенты
│   │   └── router/            # Маршрутизация
│   ├── public/                # Статические файлы
│   └── package.json
│
├── backend/                    # FastAPI сервис
│   ├── main.py                # Основное приложение
│   ├── reranker.py            # Реранкинг документов
│   ├── requirements.txt       # Python зависимости
│   └── .env                  # Конфигурация
│
├── supabase/                  # Конфигурация Supabase
│   ├── migrations/            # SQL миграции
│   └── storage/              # Файловое хранилище
│
├── data/                      # Исходные данные
│   ├── documents/            # Документы для индексации
│   ├── faq_questions.csv     # Частые вопросы
│   └── embeddings/           # Предобработанные эмбеддинги
│
└── docker-compose.yml        # Docker конфигурация
🔧 Конфигурация баз данных
Supabase таблицы
sql
-- Профили пользователей
CREATE TABLE profiles (
id UUID REFERENCES auth.users PRIMARY KEY,
email TEXT NOT NULL,
full_name TEXT,
last_name TEXT,
phone TEXT,
telegram TEXT,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- История чатов
CREATE TABLE chats (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
user_id UUID REFERENCES auth.users,
question TEXT NOT NULL,
answer TEXT NOT NULL,
created_at TIMESTAMPTZ DEFAULT NOW()
);
Qdrant коллекция
yaml
collection_name: bashkir_energo_minilm_v2
vector_size: 384  # all-MiniLM-L6-v2
distance: Cosine
🔌 API Endpoints
FastAPI RAG сервис
text
POST /ask                - Задать вопрос ассистенту
GET  /health             - Проверка здоровья сервиса
POST /clear-cache        - Очистка кэша GPU
GET  /test              - Тестовый эндпоинт
Пример запроса:
json
{
"question": "Как подать заявку на подключение?",
"top_k": 3,
"temperature": 0.1,
"rerank_threshold": 0.1
}
👥 Аутентификация и безопасность
JWT токены через Supabase Auth

Row Level Security (RLS) в PostgreSQL

CORS настройки для локальной разработки

Валидация входных данных на фронтенде и бэкенде

📊 Особенности системы
Семантический поиск - поиск по смыслу, а не ключевым словам

Реранкинг результатов - улучшение релевантности ответов

Контекстуальные ответы - генерация ответов на основе документов

История чатов - сохранение диалогов пользователя

FAQ система - быстрые ответы на частые вопросы

🐛 Отладка и логирование
Проверка компонентов:
bash
# Проверка Ollama
curl http://localhost:11434/api/generate -d '{"model": "bambucha/saiga-llama3", "prompt": "test"}'

# Проверка Qdrant
curl http://localhost:6333/collections

# Проверка Supabase
supabase status
Логи:
Фронтенд: Консоль браузера + Vue DevTools

Бэкенд: Uvicorn лог + файловые логи

Базы данных: Supabase Logs + Qdrant мониторинг

🔄 Деплоймент
Локальный (разработка)
bash
docker-compose up -d
Продакшн рекомендации:
Supabase - использовать облачную версию

Ollama - выделенный сервер с GPU

Qdrant - кластерная конфигурация

Nginx - реверс-прокси и балансировка нагрузки

PM2 - менеджер процессов для Node.js

📚 Дополнительные ресурсы
Документация:
Vue.js 3

FastAPI

Supabase

Ollama

Qdrant

Модели:
LLM: bambucha/saiga-llama3 (русскоязычная)

Эмбеддинги: sentence-transformers/all-MiniLM-L6-v2

Полезные команды:
bash
# Сброс базы данных
supabase db reset

# Пересоздание векторной БД
docker-compose down -v
docker-compose up -d

# Обновление зависимостей
npm update
pip install --upgrade -r requirements.txt
📄 Лицензия
MIT License

🤝 Участие в разработке
Форкните репозиторий

Создайте ветку для фичи (git checkout -b feature/amazing-feature)

Закоммитьте изменения (git commit -m 'Add amazing feature')

Запушьте в ветку (git push origin feature/amazing-feature)

Откройте Pull Request

📞 Поддержка
Для вопросов и поддержки:

Проверьте раздел "Отладка и логирование"

Откройте Issue в репозитории

Обратитесь к документации соответствующих технологий