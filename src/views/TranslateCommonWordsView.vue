<template>
  <div class="exercise-container">

    <div class="title-container">
    <h1 ref="title" class="exercise-title">Level up</h1>
    <h2 ref="subtitle" class="exercise-subtitle">Translate Common English words</h2>
    </div>
    <div class="exercise-stats">
      <p>Questions: {{ totalQuestions }}</p>
      <p>Success: {{ successRate }}%</p>
    </div>

    <div class="exercise-card-container">
      <template v-if="!finished">
        <div ref="cardRef" class="exercise-card">
          <!-- Front -->
          <div class="card-face front" v-if="!flipped">
            <span class="exercise-level">{{ currentExercice.difficulte }}</span>
            <p class="exercise-word" ref="wordRef">{{ currentExercice.word }}</p>
            <div class="exercise-input-container">
              <input
                v-model="userAnswer"
                @keyup.enter="checkAnswer"
                placeholder="Entrez votre traduction"
              />
              <button class="validation-button" @click="checkAnswer">Valider</button>
            </div>
          </div>

          <!-- Back -->
          <div class="card-face back" v-if="flipped">
            <div class="corection-word" v-if="showCorrection">
              <p class="correction-introduction">The correct answer is:</p>
              <p class="good-answare">{{ currentExercice.correction }}</p>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="finished-message">
          <h2>Exercice terminé ! 🎉</h2>
          <div class="finished-buttons">
            <button @click="restartExercise">Recommencer</button>
            <button @click="goToSelection">Choix des exercices</button>
          </div>
        </div>
      </template>
    </div>

    <!-- Historique amélioré -->
    <div class="exercise-history">
      <h3>Historique</h3>
      <ul>
        <li
          v-for="(item, index) in history"
          :key="index"
          :class="['history-item', item.correct ? 'correct' : 'wrong']"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="history-word">{{ item.word }}</div>
          <div class="history-answer">
            <span>{{ item.answer }}</span>
            <span class="history-icon">
              <template v-if="item.correct">✔️</template>
              <template v-else>❌ {{ item.correctAnswer }}</template>
            </span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import gsap from 'gsap'
import SplitText from 'gsap/SplitText'
import router from '@/router'
import { watch } from 'vue'
import { exercices_common_english } from '@/data/commonWords.js'


gsap.registerPlugin(SplitText)

// Exercices
const exercices = exercices_common_english

const currentIndex = ref(0)
const userAnswer = ref('')
const history = ref([])
const finished = ref(false)
const flipped = ref(false)
const showCorrection = ref(false)

const cardRef = ref(null)
const wordRef = ref(null)
const animations = ['fade', 'scale', 'rotate', 'slide']
let wordSplit = null
let wordInterval = null

const currentExercice = computed(() => exercices[currentIndex.value])
const totalQuestions = computed(() => exercices.length)
const successRate = computed(() => {
  if (!history.value.length) return 0
  return Math.round(
    (history.value.filter(h => h.correct).length / history.value.length) * 100
  )
})

watch(finished, value => {
  if (value) stopWordRandomAnimation()
})



// Animation de la carte
function animateCard(type) {
  switch (type) {
    case 'fade':
      gsap.fromTo(cardRef.value, { opacity: 0 }, { opacity: 1, duration: 0.8 })
      break
    case 'scale':
      gsap.fromTo(
        cardRef.value,
        { scale: 0 },
        { scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
      )
      break
    case 'rotate':
      gsap.fromTo(
        cardRef.value,
        { rotationY: 180 },
        { rotationY: 0, duration: 0.8, ease: 'elastic.out(1,0.5)' }
      )
      break
    case 'slide':
      gsap.fromTo(
        cardRef.value,
        { x: -300, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      )
      break
  }
}


// Animation de résultat (vert ou rouge)
function flashCardResult(isCorrect) {
  const color = isCorrect ? '#22c55e' : '#ef4444'
  const glow = isCorrect
    ? '0 0 35px rgba(34,197,94,0.8)'
    : '0 0 35px rgba(239,68,68,0.8)'

  gsap.timeline()
    .to(cardRef.value, {
      backgroundColor: color,
      boxShadow: glow,
      duration: 0.25,
      ease: 'power2.out'
    })
    .to({}, { duration: 0.09}) // ⏱ maintien 1,5 sec
    .to(cardRef.value, {
      backgroundColor: '#1a1a1a',
      boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
      duration: 0.4,
      ease: 'power2.inOut'
    })
}


// Animation des lettres du mot de façon aléatoire en boucle
function startWordRandomAnimation() {
  stopWordRandomAnimation()
  wordInterval = setInterval(animateWordLettersRandom, 5000)
}

function stopWordRandomAnimation() {
  if (wordInterval) {
    clearInterval(wordInterval)
    wordInterval = null
  }
}

function resetWordAnimation() {
  stopWordRandomAnimation()

  if (wordSplit) {
    wordSplit.revert()
    wordSplit = null
  }
}



// Animation du mot avec alternance
function animateWord() {
  const anim = animations[Math.floor(Math.random() * animations.length)]
  switch (anim) {
    case 'fade':
      gsap.fromTo(wordRef.value, { opacity: 0 }, { opacity: 1, duration: 0.8 })
      break
    case 'scale':
      gsap.fromTo(
        wordRef.value,
        { scale: 0 },
        { scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
      )
      break
    case 'rotate':
      gsap.fromTo(
        wordRef.value,
        { rotationY: 180 },
        { rotationY: 0, duration: 0.8, ease: 'elastic.out(1,0.5)' }
      )
      break
    case 'slide':
      gsap.fromTo(
        wordRef.value,
        { x: -300, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      )
      break
  }
}

// Animation des lettres du mot de façon aléatoire
function animateWordLettersRandom() {
  if (!wordRef.value) return

  if (wordSplit) {
    wordSplit.revert()
    wordSplit = null
  }

  wordSplit = new SplitText(wordRef.value, {
    type: 'chars',
    charsClass: 'char'
  })

  gsap.fromTo(
    wordSplit.chars,
    {
      x: () => gsap.utils.random(-4000, 40),
      y: () => gsap.utils.random(-1330, 1330),
      rotation: () => gsap.utils.random(-25, 25),
      opacity: 0.6
    },
    {
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
      stagger: { each: 0.05, from: 'random' }
    }
  )
}



// Flip avec délai pour correction
async function flipCard(delay = 100) {
  flipped.value = true
  showCorrection.value = false
  await gsap.to(cardRef.value, { rotationY: 180, duration: 0.3, ease: 'power2.inOut' })
  setTimeout(() => {
    showCorrection.value = true
  }, delay)
  await new Promise(r => setTimeout(r, delay + 1500))
  showCorrection.value = false
  await gsap.to(cardRef.value, { rotationY: 0, duration: 0.3, ease: 'power2.inOut' })
  flipped.value = false
}

// Vérification réponse
async function checkAnswer() {
  if (!userAnswer.value || finished.value) return

  const correct =
    userAnswer.value.trim().toLowerCase() === currentExercice.value.correction.toLowerCase()

  // FEEDBACK VISUEL IMMÉDIAT
  flashCardResult(correct)

  history.value.push({
    word: currentExercice.value.word,
    answer: userAnswer.value,
    correct,
    correctAnswer: correct ? null : currentExercice.value.correction
  })

  if (!correct) {
    await nextTick()
    await flipCard()
  }

  userAnswer.value = ''

  if (currentIndex.value < exercices.length - 1) {
    currentIndex.value++
    resetWordAnimation()
    animateWord()
    animateWordLettersRandom()
    await nextTick()
    animateCard(animations[Math.floor(Math.random() * animations.length)])
    animateWord()
  } else {
    finished.value = true
  }
}

// Recommencer
function restartExercise() {
  currentIndex.value = 0
  history.value = []
  finished.value = false
  userAnswer.value = ''
  nextTick(() => {
    animateCard(animations[currentIndex.value % animations.length])
    animateWord()
  })
}

// Aller à la sélection
function goToSelection() {
  router.push('/select-exercises')
}

// Animation des titres
const title = ref(null)
const subtitle = ref(null)
function animateTitles() {
  gsap.set(title.value, { opacity: 1, y: 0, scaleY: 1, scaleX: 1, skewX: 0 })
  gsap.set(subtitle.value, { opacity: 1, y: 0, rotation: 0 })

  gsap.from(title.value, {
    opacity: 0.4,
    y: -38,
    scaleY: 1.5,
    scaleX: 0.8,
    skewX: 5,
    duration: 1.8,
    ease: 'elastic.out(12, 1.2)'
  })

  const split = new SplitText(subtitle.value, { type: 'chars', charsClass: 'char' })
  gsap.from(split.chars, {
    opacity: 0,
    y: 80,
    rotation: 90,
    duration: 0.6,
    ease: 'back.out(1.7)',
    stagger: 0.05
  })
}

onMounted(() => {
  animateTitles()
  animateWordLettersRandom()
  startWordRandomAnimation()
  setInterval(animateTitles, 6500)
  animateCard(animations[currentIndex.value % animations.length])
  animateWord()
})
</script>

<style scoped>

.correction-introduction {
    font-family: 'BBH Hegarty', cursive;
    font-size: 1.4rem;
    margin-bottom: 1rem;
}    

.validation-button {
    font-family: '"Edu NSW ACT Cursive", cursive', cursive;
}

.corection-word {
  transform: scaleX(-1);
}

.good-answare {
  font-family: 'BBH Hegarty', cursive;
  font-size: 2.4rem;
  font-weight: lighter;
  text-align: center;
  width: max-content;

  background: linear-gradient(80deg, #438eca, #f378ed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  /* optionnel (compatibilité future) */
  background-clip: text;
  color: transparent;
}

.exercise-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #0d0d0d;
  min-height: 100vh;
  color: #fff;
  gap: 2rem;
  position: relative;
}

.exercise-title {
  font-size: clamp(4.3rem, 6vw, 4rem);
  font-family: "Edu NSW ACT Cursive", cursive;
  background: linear-gradient(80deg, #438eca, #f378ed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
}

.exercise-subtitle {
  font-size: 1.2rem;
  color: #ffffff;
  text-align: center;
  margin-bottom: 4rem;
}

.exercise-stats {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 400px;
  font-weight: bold;
  color: #c2c9c8;
  padding:0 1rem;
}

.exercise-card-container {
  width: 100%;
  display: flex;
  justify-content: center;
  
}

.exercise-card {
  margin-top: 1rem;
  position: relative;
  background-color: #1a1a1a;
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
  perspective: 1000px;
}

.exercise-level {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: #414650;
  padding: 0.3rem 0.7rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  font-weight: bold;
}


.exercise-word {
  font-size: 5rem;
  font-weight: bold;
  margin: 3rem 0;
  text-shadow:
     2px 4px 0 #438eca,
     4px 6px 0 #631463a1,
     6px 9px 0 #481158,
      4px 12px 0 #1c2361,
     6px 14px 0 #099151,
     8px 16px 0 #37579c;
}


.exercise-input-container {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.exercise-input-container input {
  flex: 1;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  border: none;
  outline: none;
  font-size: 1rem;
}

.exercise-input-container button {
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  border: none;
  background-color: #97c5c5;
  color: #1b4930;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.exercise-input-container button:hover {
  background-color: #f378ed;
}

/* Historique amélioré */
.exercise-history {
  width: 100%;
  max-width: 450px;
  margin-top: 2rem;
}

.exercise-history h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-align: center;
  color: #f0f0f0;
}

.exercise-history ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  border-radius: 0.8rem;
  background-color: #2a2a2a;
  color: #fff;
  font-size: 1rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.3s forwards;
}

.history-item.correct {
  border-left: 5px solid #4ade80;
}

.history-item.wrong {
  border-left: 5px solid #f87171;
}

.history-word {
  font-weight: bold;
  flex: 1;
}

.history-answer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-style: italic;
  color: #c2c9c8;
}

.history-icon {
  font-weight: bold;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Message final */
.finished-message {
  background-color: #1a1a1a;
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
}

.finished-message h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.finished-buttons {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.finished-buttons button {
  padding: 0.5rem 1.2rem;
  border-radius: 1rem;
  border: none;
  background-color: #438eca;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.finished-buttons button:hover {
  background-color: #f378ed;
}

.char {
  display: inline-block;
}
</style>
