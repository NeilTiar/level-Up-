// src/utils/animationsWordExercise.js
import { ref } from 'vue'
import gsap from 'gsap'
import SplitText from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

export function useAnimations() {
  const cardRef = ref(null)
  const wordRef = ref(null)
  let wordSplit = null
  let wordInterval = null
  const animations = ['fade', 'scale', 'rotate', 'slide']

  function animateCard(type) {
    switch (type) {
      case 'fade':
        gsap.fromTo(cardRef.value, { opacity: 0 }, { opacity: 1, duration: 0.8 })
        break
      case 'scale':
        gsap.fromTo(cardRef.value, { scale: 0 }, { scale: 1, duration: 0.8, ease: 'back.out(1.7)' })
        break
      case 'rotate':
        gsap.fromTo(cardRef.value, { rotationY: 180 }, { rotationY: 0, duration: 0.8, ease: 'elastic.out(1,0.5)' })
        break
      case 'slide':
        gsap.fromTo(cardRef.value, { x: -300, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' })
        break
    }
  }

  function animateWordLettersRandom() {
    if (!wordRef.value) return

    if (wordSplit) {
      wordSplit.revert()
      wordSplit = null
    }

    wordSplit = new SplitText(wordRef.value, { type: 'chars', charsClass: 'char' })

    gsap.fromTo(
      wordSplit.chars,
      {
        x: () => gsap.utils.random(-40, 40),
        y: () => gsap.utils.random(-30, 30),
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

  return { cardRef, wordRef, animateCard, animateWordLettersRandom, animations }
}
