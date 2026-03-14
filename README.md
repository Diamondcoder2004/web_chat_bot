# 🏭 AI Ассистент Башкирэнерго

Система вопросно-ответного чат-бота для компании "Башкирэнерго" с использованием RAG (Retrieval-Augmented Generation) технологии.

## 🚀 Технологический стек

### Фронтенд (Клиентская часть)
- **Vue.js 3** (Composition API) - прогрессивный JavaScript фреймворк
- **Vue Router** - маршрутизация для SPA
- **Pinia** - управление состоянием приложения
- **Supabase JS Client** - работа с аутентификацией и базой данных
- **Axios** - HTTP клиент для работы с API
- **Tailwind CSS** - утилитарные CSS классы

### Бэкенд (Серверная часть)
- **FastAPI** - Python веб-фреймворк для создания API
- **Ollama** - локальная LLM (используется модель bambucha/saiga-llama3)
- **LangChain** - фреймворк для работы с языковыми моделями
- **Qdrant** - векторная база данных для семантического поиска
- **Sentence Transformers** - модели для создания эмбеддингов

### База данных и инфраструктура
- **Supabase** - облачная платформа (PostgreSQL + Auth + Storage)
- **PostgreSQL** - реляционная база данных
- **Docker** - контейнеризация сервисов

## 📋 Архитектура

Проект состоит из следующих основных компонентов:

1. **Фронтенд (Vue 3)** - пользовательский интерфейс с компонентами чата, историей, профилем
2. **Бэкенд (FastAPI)** - RAG-система для обработки вопросов и генерации ответов
3. **Supabase** - аутентификация пользователей через JWT-токены
4. **Векторная БД (Qdrant)** - хранение эмбеддингов документов для семантического поиска

### Взаимодействие компонентов

```
┌─────────────┐     JWT Token      ┌─────────────┐
│   Vue 3     │ ◄────────────────► │  Supabase   │
│  Frontend   │                    │    Auth     │
└──────┬──────┘                    └─────────────┘
       │
       │ HTTP Requests (with JWT)
       ▼
┌─────────────┐     Search         ┌─────────────┐
│  FastAPI    │ ◄────────────────► │   Qdrant    │
│   RAG API   │                    │ Vector DB   │
└──────┬──────┘                    └─────────────┘
       │
       │ LLM Generation
       ▼
┌─────────────┐
│   Ollama    │
│   (LLM)     │
└─────────────┘
```

### Сервисы (`src/services/supabase.js`)

- **authService** - регистрация, вход, выход, получение текущего пользователя
- **chatService** - отправка вопросов (`sendQuery`), получение истории чатов (`getHistory`)
- **feedbackService** - создание, получение и удаление фидбека (лайк/дизлайк/звёзды)
- **profileService** - работа с профилями пользователей в Supabase

Все сервисы автоматически добавляют JWT-токен из сессии Supabase в заголовки запросов к бэкенду.

## 📋 Предварительные требования

### Обязательные компоненты
- Node.js 18+ и npm
- Python 3.9+
- Docker и Docker Compose
- Git

### Локальные сервисы для запуска

#### 1. Supabase (локально через Docker)
```bash
# Установка Supabase CLI
npm install -g supabase

# Инициализация проекта
supabase init

# Запуск локального Supabase
supabase start
```
Порт: 54321 (веб-интерфейс), 54322 (база данных)

#### 2. Ollama (локальная LLM)
```bash
# Установка Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Загрузка модели
ollama pull bambucha/saiga-llama3

# Запуск Ollama
ollama serve
```
Порт: 11434

#### 3. Qdrant (векторная БД)
```bash
# Запуск через Docker
docker run -p 6333:6333 qdrant/qdrant
```
Порт: 6333

#### 4. FastAPI RAG сервис
```bash
# requirements.txt
fastapi
uvicorn
langchain
langchain-ollama
qdrant-client
sentence-transformers
python-dotenv
```

## 🛠 Установка и запуск

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd bashkirenergo-chat
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта на основе `.env.example`:

```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите ваши значения:

```env
# Supabase Configuration
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# FastAPI RAG Backend
VITE_API_BASE_URL=http://localhost:8880
```

**Описание переменных:**
- `VITE_SUPABASE_URL` - URL вашего Supabase инстанса (локальный или облачный)
- `VITE_SUPABASE_ANON_KEY` - публичный анонимный ключ Supabase (можно получить в Dashboard)
- `VITE_API_BASE_URL` - URL вашего FastAPI бэкенда

### 3. Установка зависимостей фронтенда
```bash
npm install
```

### 4. Настройка бэкенда
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
```

Настройте `.env` бэкенда:
```env
OLLAMA_HOST=http://localhost:11434
QDRANT_HOST=localhost
COLLECTION_NAME=bashkir_energo_minilm_v2
OLLAMA_MODEL=bambucha/saiga-llama3
```

### 5. Подготовка данных
```bash
# Загрузка документов в векторную БД
python scripts/ingest_documents.py

# Загрузка FAQ в Supabase Storage
supabase storage upload df/faq_question.csv ./data/faq_questions.csv
```

### 6. Запуск системы

Откройте несколько терминалов:

**Терминал 1: Supabase**
```bash
supabase start
```

**Терминал 2: Ollama**
```bash
ollama serve
```

**Терминал 3: Qdrant**
```bash
docker run -p 6333:6333 qdrant/qdrant
```

**Терминал 4: FastAPI бэкенд**
```bash
cd backend
uvicorn main:app --reload --port 8880
```

**Терминал 5: Vue.js фронтенд**
```bash
npm run dev
```

После запуска фронтенд будет доступен по адресу `http://localhost:5173` (или другой порт, указанный в консоли).

## 📁 Структура проекта

```
bashkirenergo-chat/
├── src/
│   ├── components/          # Vue компоненты
│   │   ├── AssistantChat.vue    # Компонент чата с ассистентом
│   │   ├── FaqSeqtion.vue       # Секция FAQ
│   │   ├── Header.vue           # Шапка сайта
│   │   └── Footer.vue           # Подвал сайта
│   ├── views/               # Страницы приложения
│   │   ├── Home.vue             # Главная страница с чатом
│   │   ├── Login.vue            # Страница входа
│   │   ├── Register.vue         # Страница регистрации
│   │   ├── Profile.vue          # Профиль пользователя
│   │   └── History.vue          # История чатов
│   ├── stores/              # Состояние Pinia
│   │   ├── authStore.js         # Аутентификация
│   │   └── chatStore.js         # Состояние чата, история, фидбек
│   ├── services/            # API клиенты
│   │   └── supabase.js          # Сервисы: auth, chat, feedback, profile
│   ├── router/              # Маршрутизация
│   │   └── index.js
│   ├── App.vue              # Корневой компонент
│   └── main.js              # Точка входа
├── public/                  # Статические файлы
├── .env                     # Переменные окружения
├── .env.example             # Пример переменных окружения
├── package.json             # Зависимости и скрипты
└── README.md                # Документация
```

## 🔧 Конфигурация баз данных

### Supabase таблицы

#### Таблица profiles
```sql
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
```

#### Таблица chats
```sql
CREATE TABLE chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Qdrant коллекция
```yaml
collection_name: bashkir_energo_minilm_v2
vector_size: 384  # all-MiniLM-L6-v2
distance: Cosine
```

## 🔌 API Endpoints

### FastAPI RAG сервис

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| POST | `/query` | Отправка вопроса, получение ответа с источниками |
| GET | `/history` | Получение истории чатов текущего пользователя |
| POST | `/feedback` | Создание/обновление фидбека |
| GET | `/feedback/{chat_id}` | Получение фидбека для чата |
| DELETE | `/feedback/{chat_id}` | Удаление фидбека |
| GET | `/health` | Проверка здоровья сервиса |

#### Пример запроса к `/query`:
```json
{
  "query": "Как подать заявку на подключение?",
  "k": 30,
  "rerank_top_k": 3,
  "temperature": 0.8,
  "max_tokens": 2000,
  "min_score": 0.0
}
```

#### Пример ответа:
```json
{
  "chat_id": "uuid-чата",
  "answer": "Текст ответа...",
  "sources": [
    {
      "filename": "document.pdf",
      "breadcrumbs": "Раздел > Подраздел",
      "summary": "Краткое содержание",
      "score_hybrid": 0.85,
      "score_rerank": 0.92,
      "chunk_id": "chunk-123"
    }
  ]
}
```

## 👥 Аутентификация и безопасность

- **JWT токены** через Supabase Auth
- **Row Level Security (RLS)** в PostgreSQL для защиты данных
- **CORS настройки** для локальной разработки
- **Валидация входных данных** на фронтенде и бэкенде

Аутентификация работает следующим образом:
1. Пользователь входит через форму логина/регистрации
2. Supabase выдаёт JWT-токен и сохраняет сессию
3. При каждом запросе к бэкенду токен автоматически добавляется в заголовок `Authorization: Bearer <token>`
4. Бэкенд проверяет токен и определяет пользователя

## 📊 Функциональные возможности

### 1. Аутентификация
- Регистрация нового пользователя с указанием email, пароля и полного имени
- Вход по email и паролю
- Выход из системы
- Автоматическое создание профиля при регистрации

### 2. Отправка вопросов к RAG-системе
- Ввод вопроса в текстовое поле
- Использование быстрых шаблонов вопросов
- Отображение индикатора загрузки во время обработки

### 3. Отображение источников ответа
- Карточки источников под каждым ответом ассистента
- Информация о файле, разделе, кратком содержании
- Показатели релевантности (Hybrid Score, Rerank Score)
- Модальное окно с подробной информацией об источнике

### 4. Оценка ответов (фидбек)
- **Лайк/Дизлайк** - кнопки под каждым ответом
- **5-звёздочный рейтинг** - появляется после ответа ассистента
- Сохранение состояния оценки (визуальное отображение)
- Возможность изменить или удалить оценку

### 5. Просмотр истории чатов
- Страница истории со всеми диалогами пользователя
- Поиск по вопросам и ответам
- Отображение даты и времени каждого чата

## 🐛 Отладка и логирование

### Проверка компонентов

```bash
# Проверка Ollama
curl http://localhost:11434/api/generate -d '{"model": "bambucha/saiga-llama3", "prompt": "test"}'

# Проверка Qdrant
curl http://localhost:6333/collections

# Проверка Supabase
supabase status
```

### Логи

- **Фронтенд**: Консоль браузера + Vue DevTools
- **Бэкенд**: Uvicorn лог + файловые логи
- **Базы данных**: Supabase Logs + Qdrant мониторинг

### Частые проблемы и решения

| Проблема | Решение |
|----------|---------|
| Ошибка "Supabase not initialized" | Проверьте правильность `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` в `.env` |
| Ошибка подключения к API | Убедитесь, что FastAPI запущен на порту, указанном в `VITE_API_BASE_URL` |
| JWT token expired | Обновите страницу или перезайдите в систему |
| Источники не отображаются | Проверьте, что бэкенд возвращает поле `sources` в ответе |
| Фидбек не сохраняется | Убедитесь, что `chat_id` возвращается в ответе на `/query` |

## 🔄 Деплоймент

### Локальный (разработка)
```bash
docker-compose up -d
```

### Продакшн рекомендации

1. **Supabase** - использовать облачную версию (https://supabase.com)
2. **Ollama** - выделенный сервер с GPU для производительности
3. **Qdrant** - кластерная конфигурация для отказоустойчивости
4. **Nginx** - реверс-прокси и балансировка нагрузки
5. **PM2** - менеджер процессов для Node.js
6. **HTTPS** - обязательное использование SSL/TLS

## 📚 Дополнительные ресурсы

### Документация
- [Vue.js 3](https://vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Supabase](https://supabase.com/docs)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Ollama](https://ollama.ai/)
- [Qdrant](https://qdrant.tech/)

### Модели
- **LLM**: bambucha/saiga-llama3 (русскоязычная)
- **Эмбеддинги**: sentence-transformers/all-MiniLM-L6-v2

### Полезные команды

```bash
# Сброс базы данных
supabase db reset

# Пересоздание векторной БД
docker-compose down -v
docker-compose up -d

# Обновление зависимостей
npm update
pip install --upgrade -r requirements.txt

# Сборка для production
npm run build

# Запуск production сборки
npm run preview
```

## 📄 Лицензия

MIT License

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте ветку для фичи (`git checkout -b feature/amazing-feature`)
3. Закоммитьте изменения (`git commit -m 'Add amazing feature'`)
4. Запушьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📞 Поддержка

Для вопросов и поддержки:
1. Проверьте раздел "Отладка и логирование"
2. Откройте Issue в репозитории
3. Обратитесь к документации соответствующих технологий