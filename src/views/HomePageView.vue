<script setup>
import { onMounted, ref } from 'vue'
import gsap from "gsap"
import SplitText from "gsap/SplitText";
import router from '@/router'

gsap.registerPlugin(SplitText);


const title = ref(null)
const subtitle = ref(null);

function animateTitles() {
  // Reset styles pour relancer l'animation
  gsap.set(title.value, { opacity: 1, y: 0, scaleY: 1, scaleX: 1, skewX: 0 });
  gsap.set(subtitle.value, { opacity: 1, y: 0, rotation: 0 });

  // Titre
  gsap.from(title.value, {
    opacity: 0,
    y: -120,
    scaleY: 1.9,
    scaleX: 0.8,
    skewX: 5,
    duration: 1.8,
    ease: "elastic.out(5, 1.2)"
  });

  // Sous-titre lettre par lettre
  const split = new SplitText(subtitle.value, { type: "chars", charsClass: "char" });
  gsap.from(split.chars, {
    opacity: 0,
    y: 40,
    rotation: 90,
    duration: 0.8,
    ease: "back.out(1.7)",
    stagger: 0.05
  });
}




onMounted(() => {
   animateTitles();

  // Relance toutes les 3 secondes
  setInterval(() => {
    animateTitles();
  }, 4500);


})



</script>

<template>
  <div class="home-container">
    <h3 class="home-container__welcome-title">Welcome</h3>
   
    <div class="home-container__title-container">
      <h1 ref="title" class="home-container__level-up-title">level up</h1>
       <h2 ref="subtitle" class="home-container__english-subtitle">English training App</h2>
      <h2 class="home-container__V1-subtitle">V1</h2>
    </div>

 

    <button @click="() => {router.push('/select-exercises')}" class="home-container__button-exercises">Exercices</button>

       <div class="container-author">
      <p class="container-author__name">By Neil T.</p>
    </div>
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
  font-size: 5.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  background: linear-gradient(80deg, #438eca, #f378ed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
 
}

/* Subtitle */
.home-container__english-subtitle {
  font-size: 1.5rem;
  font-weight: normal;
   color: #ffffff; 
}

:deep(.char) {
  display: inline-block;
  transform-origin: center;
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
}



/* Bouton exercices */
.home-container__button-exercises {
  padding: 0.5rem 1rem;
  font-size: 1.5rem;
  background: linear-gradient(90deg, #332d58, #264d96);
  color: #ffffff;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.3s ease;
  margin-top: 3rem;
  font-weight: bold;
  font-family: "Edu NSW ACT Cursive", cursive;
}

.home-container__button-exercises:hover {
  transform: scale(1.05);
}


.container-author {
  width: 100%;
  padding: 1rem;
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.container-author__name {
display: flex;
align-items: end;
justify-content: end;
color:#ffffff;
font-family: "Edu NSW ACT Cursive", cursive;
font-size: 0.rem;
}


</style>
