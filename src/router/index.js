import AnkiExerciceView from '@/views/ankiExerciceView.vue'
import GrammarExerciseView from '../views/GrammarExerciseView.vue'
import HomePageView from '@/views/HomePageView.vue'
import SelectExercisesView from '@/views/SelectExercisesView.vue'
import TranslateCommonWordsView from '@/views/TranslateCommonWordsView.vue'
import TranslateDevWordsView from '@/views/TranslateDevWordsView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePageView
    },
    {
      path: '/Grammar',
      name: 'grammar',
      component: GrammarExerciseView
    },
    {
      path: '/select-exercises',
      name: 'select-exercises',
      component: SelectExercisesView
    },
    {
      path: '/translate-common',
      name: 'translate-common',
      component:TranslateCommonWordsView
    },
    {
      path: '/translate-dev',
      name: 'translate-dev',
      component: TranslateDevWordsView
    },
    {
      path: '/anki-exercise',
      name: 'anki-exercise',
      component: AnkiExerciceView
    }
  ]
})

export default router
