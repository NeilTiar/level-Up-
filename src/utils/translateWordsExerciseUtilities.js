// src/utils/translateWordsExerciseUtilities.js
import { ref, computed, nextTick, watch } from 'vue'
import { exercices_tech_fr_to_en } from '@/data/techWords.js'

export function useExercise(totalQuestions = 10, config = { easy: 0.33, medium: 0.33, hard: 0.34 }) {
  const exercices = ref([])
  const currentIndex = ref(0)
  const userAnswer = ref('')
  const history = ref([])
  const finished = ref(false)
  const flipped = ref(false)
  const showCorrection = ref(false)

  const currentExercice = computed(() => exercices.value[currentIndex.value] ?? null)
  const total = computed(() => exercices.value.length)
  const successRate = computed(() => {
    if (!history.value.length) return 0
    return Math.round((history.value.filter(h => h.correct).length / history.value.length) * 100)
  })

  function resetExercise() {
    exercices.value = pickByDifficulty(exercices_tech_fr_to_en, totalQuestions, config)
    currentIndex.value = 0
    history.value = []
    finished.value = false
    userAnswer.value = ''
  }

  function nextQuestion() {
    if (currentIndex.value < exercices.value.length - 1) {
      currentIndex.value++
    } else {
      finished.value = true
    }
  }

  function pushHistory(item) {
    history.value.push(item)
  }

  // Fonction pour mélanger un tableau
  function shuffle(array) {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  function pickByDifficulty(questions, total, config) {
    const byLevel = {}
    let quiz = []

    for (const level in config) {
      byLevel[level] = shuffle(questions.filter(q => q.difficulte === level))
    }

    let remaining = total
    for (const level in config) {
      const count = Math.floor(total * config[level])
      const picked = byLevel[level].splice(0, count)
      quiz.push(...picked)
      remaining -= picked.length
    }

    if (remaining > 0) {
      const leftovers = shuffle(Object.values(byLevel).flat())
      quiz.push(...leftovers.slice(0, remaining))
    }

    return shuffle(quiz)
  }

  return {
    exercices,
    currentIndex,
    userAnswer,
    history,
    finished,
    flipped,
    showCorrection,
    currentExercice,
    total,
    successRate,
    resetExercise,
    nextQuestion,
    pushHistory,
    shuffle,
  }
}
