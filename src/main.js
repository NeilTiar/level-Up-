import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './asset/global.css'  // <-- import global CSS

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')


// HMR pour ce fichier
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('Module main.js mis à jour !')
  })
}