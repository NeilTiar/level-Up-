<script setup>
import { onMounted, ref } from 'vue'
import gsap from "gsap"

const title = ref(null)

onMounted(() => {
  gsap.from(title.value, {
    opacity: 0,
    y: -100,          // descend depuis le haut
    scaleY: 1.5,      // effet d’élongation verticale
    scaleX: 0.8,      // léger aplatissement horizontal
    skewX: 10,        // effet fluide en biais
    duration: 1.2,
    ease: "elastic.out(1, 0.5)" // effet “liquid”
  })
})
</script>

<template>
  <div class="home-container">
    <h3 class="home-container__welcome-title">Welcome</h3>

    <div class="home-container__title-container">
      <h1 ref="title" class="home-container__level-up-title">level up</h1>
      <h2 class="home-container__english-subtitle">English training App</h2>
      <h2 class="home-container__V1-subtitle">V1</h2>
    </div>

    <button class="home-container__button-exercises">Exercices</button>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  gap: 40px;
  background-color: #000000;
}

/* Container du titre */
.home-container__title-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-family: "Edu NSW ACT Cursive", cursive;
  font-size: clamp(1.5rem, 5vw, 3rem);
  line-height: 1.2;
}

/* Welcome */
.home-container__welcome-title {
  font-family: 'BBH Hegarty', cursive;
  font-size: 1.8rem;
  color: #c2c9c8;
  margin-bottom: 2rem;
}

/* Level up */
.home-container__level-up-title {
  font-size: 4.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  background: linear-gradient(80deg, #438eca, #f378ed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Subtitle */
.home-container__english-subtitle {
  font-size: 1.5rem;
  font-weight: normal;
  background: linear-gradient(80deg, #438eca, #f378ed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Bouton exercices */
.home-container__button-exercises {
  padding: 1rem 2rem;
  font-size: 1.5rem;
  background: linear-gradient(90deg, #442d58, #06dfcd);
  color: #000000;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.3s ease;
  margin-top: 3rem;
  font-weight: bold;
}

.home-container__button-exercises:hover {
  transform: scale(1.05);
}
</style>
