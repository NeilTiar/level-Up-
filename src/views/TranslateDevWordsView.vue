<!-- This style section is the most successful and should be implemented across all exercises. -->
<template  v-if="currentExercice" >
  <div class="exercise-container">

    <div class="title-container">
    <h1 ref="title" class="exercise-title">Level up</h1>
    <h2 ref="subtitle" class="exercise-subtitle">Translate French Words Into English</h2>
    <h3 ref="subtitle" class="theme-exercise"> Tech & dev vocabulary <img class="tech-dev-icon" src="../asset/tech-dev-icon.png" alt="Tech Icon"></h3>
    </div>
    <div class="exercise-stats">
     <p>Question : {{ currentIndex + 1 }} / {{ totalQuestions }}</p>
      <p>Session success: {{ successRate }}%</p>
    </div>

     <p>Latest word precision {{ currentWordScore }} %</p>

    <div class="exercise-card-container">
      <template v-if="!finished">
        <div ref="cardRef" class="exercise-card">
          <!-- Front -->
          <div class="card-face front" v-if="!flipped">
            <span class="exercise-level">{{ currentExercice?.difficulte }}</span>
            <p v-if="currentExercice" class="exercise-word"> {{ currentExercice.word }}</p>
            <div class="exercise-input-container">
              <input
                id="user-answer"
                v-model="userAnswer"
                @keyup.enter="checkAnswer"
                placeholder="Entrez votre reponse"
              />
              <button class="validation-button" @click="checkAnswer">Valider</button>
            </div>
          </div>

          <!-- Back -->
          <div class="card-face back" v-if="flipped">
            <div class="correction-word" v-if="showCorrection">
              <p class="correction-introduction">The correct answer is:</p>
              <p class="good-answare">{{ currentExercice.correction }}</p>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="finished-message-container">
          <h2 class="finished-message">Exercice terminé ! 🎉</h2>
          <div class="finished-buttons">
            <button class="restart-button" @click="restartExercise">Recommencer</button>
            <button class="redirect-menu-button" @click="goToSelection">Choix des exercices</button>
          </div>
        </div>
      </template>
    </div>

    <!-- Historique amélioré -->
    <div class="exercise-history">
      <h3 class="history-title">Historique</h3>
      <ul>
        <li
          v-for="(item, index) in [...history].reverse()"
          :key="index"
          :class="[
          'history-item', item.status === 'correct' ? 'correct' : item.status === 'partial' ? 'partial' :'wrong'
      ]"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="history-word">{{ item.word }} &nbsp;&nbsp; </div>
          <div class="history-answer">
            <span class> &nbsp;{{ item.answer }}</span>
            <span class="history-icon">
              <template v-if="item.correct"></template>
              <template v-else-if="item.status === 'partial'"> {{ item.correctAnswer }}</template>
              <template v-else> {{ item.correctAnswer }}</template>
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
import { exercices_tech_fr_to_en } from '@/data/techWords.js'
import { pickByDifficulty , compareWithLevenshtein , getStatus, shuffle } from '../utils/ReverseTranslateExerciseEngine.js'
import { useNextQuestion,  evaluateAnswer } from '../utils/ReverseTranslateExerciseEngine.js'






gsap.registerPlugin(SplitText)

// Exercices
const exercices = ref([])
const currentWordScore = ref(0)
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

const currentExercice = computed(() => exercices.value[currentIndex.value] ?? null)
const { nextQuestion } = useNextQuestion(currentIndex, finished, exercices)
const totalQuestions = computed(() => exercices.value.length)
const successRate = computed(() => {
  if (!history.value.length) return 0

  const total = history.value.reduce((sum, h) => {
    if (h.status === 'correct') return sum + 1
    if (h.status === 'partial') return sum + 0.5
    return sum
  }, 0)

  return Math.round((total / history.value.length) * 100)
})



// Configuration de la répartition des difficultés ( pour alimenter la fonction pickByDifficulty )
const config = {
  easy: 0.33,
  medium: 0.33,
  hard: 0.34,
}



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
function flashCardResult(status) {
  
  let color = '#ef4444'  // défaut rouge
  let glow = '0 0 35px rgba(239,68,68,0.8)'

  if (status === 'correct') {
    color = '#22c55e'
    glow = '0 0 35px rgba(34,197,94,0.8)'
  } else if (status === 'partial') {
    color = '#fbbf24'      // jaune/orange pour partiel
    glow = '0 0 35px rgba(251,191,36,0.8)'
  }

  gsap.timeline()
    .to(cardRef.value, {
      backgroundColor: color,
      boxShadow: glow,
      duration: 0.25,
      ease: 'power2.out'
    })
    .to({}, { duration: 0.09 }) // maintien
    .to(cardRef.value, {
      backgroundColor: '#191c29', // ou #1a1a1a selon ton style
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

  const { score, status } = evaluateAnswer({
    userResponse: userAnswer.value.trim().toLowerCase(),
    correctWord: currentExercice.value.correction.trim().toLowerCase()
  })

  currentWordScore.value = score
  flashCardResult(status)

  history.value.push({
    word: currentExercice.value.word,
    answer: userAnswer.value,
    score,
    status,
    correct: status === 'correct',
    correctAnswer: status === 'correct'
      ? null
      : currentExercice.value.correction
  })

  if (status === 'wrong') {
    await nextTick()
    await flipCard()
  }

  userAnswer.value = ''
  nextQuestion()
}




// Recommencer
function restartExercise() {
  exercices.value = pickByDifficulty(
    exercices_tech_fr_to_en,
    10,
    config
  )

  currentIndex.value = 0
  history.value = []
  finished.value = false
  userAnswer.value = ''

  nextTick(() => {
    animateCard(animations[0])
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
  

     exercices.value = pickByDifficulty(
    exercices_tech_fr_to_en,
    10,
    config
  )

  console.log("Nombre de questions générées :", exercices.value.length)
console.log(exercices.value)

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

.correction-word {
  transform: scaleX(-1);
}

.good-answare {
  font-family: 'BBH Hegarty', cursive;
  font-size: clamp(1.5rem, 3vw, 2rem);
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


.tech-dev-icon {
  width: 60px;
  height: 60px;
  vertical-align: middle;
  margin-left: 0.5rem;
}

.exercise-title {
  margin-bottom: 0.3rem;
  font-size: clamp(4.3rem, 6vw, 4rem);
  font-family: "Edu NSW ACT Cursive", cursive;
  background: linear-gradient(80deg, #438eca, #f378ed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  text-shadow:
    -8px -3px 0 #d9d9e2,
     -4px 4.5px 0 #bdb1c7;
}

.exercise-subtitle {
  font-family: "Edu NSW ACT Cursive", cursive;
  font-size: 1rem;
  color: #ffffff;
  text-align: center;
  margin-bottom: 0.5rem;
   text-shadow:
     2px 3px 0 #36113b,
     -1.5px 4.5px 0 #bd9ddba2;
    
}

.exercise-stats {
  display: flex;
  justify-content:space-around;
  width: 98%;
  font-size: 0.8rem;
  max-width: 400px;
  font-weight: bold;
  color: #c2c9c8;
  
}

.exercise-card-container {
  width: 80vw;
  display: flex;
  justify-content: center;
  
  
}

.finished-message {
  margin: 1rem 0;
  position: relative;
  background-color: #191c29;
  border-radius: 1rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
}

.exercise-card {
  margin-top: 1rem;
  position: relative;
  background-color: #191c29;
  border-radius: 1rem;
  padding: 1.5rem;
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

.theme-exercise {

  margin-bottom: 4rem;
  font-family: "Edu NSW ACT Cursive", cursive;
  font-size: 0.9rem;
  color: #ffffff;
  text-align: left;
  margin-bottom: 2rem;
   text-shadow:
     2px 3px 0 #36113b,
     -1.5px 4.5px 0 #bd9ddba2;
    
}



.exercise-word {
  font-family: "arial black", sans-serif;
  font-weight: bold;
  margin: 3rem 0;
  text-shadow:
     2px 5px 0 #5d4964,
     4px 6px 0 #631463a1;
   
  font-size: clamp(1.8rem, 2vw, 5rem); /* min 2rem, max 5rem, s’adapte selon la largeur */
  word-break: break-word;             /* casse les mots longs */
}

.redirect-menu-button {
  background: linear-gradient(80deg, #2a5274, #8d45898f);
}

.restart-button {
  background: linear-gradient(80deg, #1b4e52, #454680);
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
  display:flex;
  flex-direction: column;
  align-items: center;
  
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
  font-size: 1.1rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.3s forwards;
  min-width: 85%;
  
}

.history-item.correct {
  border-left: 20px solid #4dd892;
}

.history-item.partial {
  border-left: 20px solid #dd993f;
}

.history-item.wrong {
  border-left: 20px solid #e66883;
}

.history-item:first-child {
  font-size: clamp(1.8rem, 2vw, 2.2rem);
  font-weight: bold;
  background-color: #2e2e2e; /* légèrement différent pour mettre en avant */
  box-shadow: 0 5px 15px rgba(67,142,202,0.4);
}


.history-word {
  font-size: 0.9rem;
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
  background-color: #1c4f58;
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

.history-title {
  font-family: "Edu NSW ACT Cursive", cursive;
  font-size: 1.8rem;
  margin-bottom: 1rem;
  background: linear-gradient(80deg, #8598a8, #ffe1fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.history-answer-texte{
  text-align: center;
}
</style>
