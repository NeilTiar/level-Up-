
// utils/answerEngine.js
export function evaluateAnswer({ userResponse, correctWord, synonyms = [] }) {
  const candidates = [correctWord, ...(synonyms.map(s => s.toLowerCase()))];
  let bestScore = 0;
  let bestMatch = correctWord; // par défaut

  candidates.forEach(candidate => {
    const score = levenshteinPercentage(userResponse, candidate);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate; // on mémorise le mot le plus proche
    }
  });

  let status = 'wrong';
  if (bestScore === 100) status = 'correct';
  else if (bestScore >= 70) status = 'partial'; // seuil ajustable

  return { score: bestScore, status, bestMatch };
}



// transforme la distance Levenshtein en pourcentage de similitude
function levenshteinPercentage(a, b) {

  if (!a && !b) return 100;
  if (!a || !b) return 0;

  const matrix = Array.from({ length: b.length + 1 }, () => []);
  for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (b[i - 1] === a[j - 1] ? 0 : 1)
      );
    }
  }

  const distance = matrix[b.length][a.length];
  const maxLen = Math.max(a.length, b.length);
  return Math.round((1 - distance / maxLen) * 100);
}





// Mélange un tableau
export function shuffle(array) {
  
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}


export function useNextQuestion(currentIndex, finished, exercices) {
  function nextQuestion() {
    if (currentIndex.value < exercices.value.length - 1) {
      currentIndex.value++
    } else {
      finished.value = true
    }
  }

  return { nextQuestion }
}





// Mélange un tableau avec 33% de chaque difficulté 
export function pickByDifficulty(questions, total, config) {

  const byLevel = {}
  let quiz = []
  

  // 1️- Grouper par niveau
  for (const level in config) {
    byLevel[level] = shuffle(
      questions.filter(q => q.difficulte === level)
    )
  }

  // 2️- Tirage initial (floor)
  let remaining = total

  for (const level in config) {
    const count = Math.floor(total * config[level])
    const picked = byLevel[level].splice(0, count)
    quiz.push(...picked)
    remaining -= picked.length
  }

  // 3️ - Compléter avec les questions restantes (tous niveaux)
  if (remaining > 0) {
    const leftovers = shuffle(
      Object.values(byLevel).flat()
    )
    quiz.push(...leftovers.slice(0, remaining))
  }

  // 4- Shuffle final
  return shuffle(quiz)
}



// Comparaison avec l'algorithme de Levenshtein
export function compareWithLevenshtein(a, b) {
  if (a === b) return 100
  if (!a || !b) return 0

  const matrix = Array.from({ length: b.length + 1 }, () => [])

  for (let i = 0; i <= b.length; i++) matrix[i][0] = i
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (b[i - 1] === a[j - 1] ? 0 : 1)
      )
    }
  }

  const distance = matrix[b.length][a.length]
  const maxLength = Math.max(a.length, b.length)

  return Math.round(((maxLength - distance) / maxLength) * 100)
}

/**
 * Détermine le statut d'une réponse à partir du score Levenshtein
 * et prend en compte les mots corrects mais mal ordonnés.
 *
 * @param {number} score - Score de similarité (0–100)
 * @param {string} correctWord - Mot de référence
 * @param {string} userResponse - Réponse de l'utilisateur
 * @returns {'correct' | 'partial' | 'wrong'}
 */
export function getStatus(score, correctWord, userResponse = '') {

  if (!correctWord) return 'wrong'

  const correct = correctWord.trim().toLowerCase()
  const userResp = (userResponse || '').trim().toLowerCase()
  const length = correct.length

  if (score === 100) return 'correct'

  // Vérifie tous les mots présents (ordre différent accepté)
  const correctWords = correct.split(' ').filter(Boolean)
  const userWords = userResp.split(' ').filter(Boolean)

  const wordsMatch =
    correctWords.every(w => userWords.includes(w)) &&
    correctWords.length === userWords.length

  if (wordsMatch) return 'partial'

  // Seuils selon longueur
  if (length <= 4) return score >= 85 ? 'partial' : 'wrong'
  if (length <= 7) return score >= 70 ? 'partial' : 'wrong'
  return score >= 60 ? 'partial' : 'wrong'
}






// Vérification réponse
 export async function checkAnswer( ) {

  if (!userAnswer.value || finished.value) return

  const userResponse = userAnswer.value.trim().toLowerCase()
  const correctWord = currentExercice.value.correction.trim().toLowerCase()

  // 1️- Score pur (0–100)
  const score = Math.max(
  0,
  Math.min(100, compareWithLevenshtein(userResponse, correctWord))
)

// reset explicite si tu veux
currentWordScore.value = null
currentWordScore.value = score


if (typeof getStatus !== 'function') {
  console.error('getStatus is not defined')
  return
}


  // 2️- Statut dérivé du score
  const status = getStatus(score, correctWord)


  // 3️- Feedback visuel
  flashCardResult(status)

  // 4️- Historique (score = source de vérité)
  history.value.push({
    word: currentExercice.value.word,
    answer: userAnswer.value,
    score,                 // 0–100
    status,                // 'correct' | 'partial' | 'wrong'
    correct: status === 'correct',
    correctAnswer: status === 'correct' ? null : correctWord
  })

  // 5️- Affichage correction si faux
  if (status === 'wrong') {
    await nextTick()
    await flipCard()
  }

  // 6️- Reset input
  userAnswer.value = ''

  // 7️- Question suivante ou fin
  if (currentIndex.value < exercices.value.length - 1) {

    console.log('Current index:', currentIndex.value, 'Mot:', currentExercice.value.word)

    currentIndex.value++
    resetWordAnimation()
    await nextTick()
    animateCard(animations[Math.floor(Math.random() * animations.length)])
    animateWord()
    animateWordLettersRandom()
  } else {
    setTimeout(() => {
      finished.value = true
    }, 2800)
   
  }
}




// Recommencer
export function restartExercise() {
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
export function goToSelection() {
  router.push('/select-exercises')
}
