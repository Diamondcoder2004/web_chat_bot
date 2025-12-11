# Используем официальный образ Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Экспортируем порт, который будет использоваться приложением
EXPOSE 5173

# Команда для запуска приложения
CMD ["npm", "run", "dev", "--", "--host"]