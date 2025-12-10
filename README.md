# web_chat_bot

This template should help get you started developing with Vue 3 in Vite.

web_chat_bot/
├── .env                   ← тут будут ваши ключи
├── docker-compose.yml     ← для локального запуска dev-контейнера
├── Dockerfile             ← сборка фронтенда
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ChatButton.vue
│   │   ├── ChatWidget.vue
│   │   ├── LoginForm.vue
│   │   └── RegisterForm.vue
│   ├── services/
│   │   └── api.js         ← вызов FastAPI и Supabase
│   ├── views/
│   │   ├── HomeView.vue
│   │   └── AuthView.vue
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
└── vite.config.js

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
