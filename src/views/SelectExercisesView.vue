<template>

<div class="select-exercise-main-container">    

<div class="select-title-container">
    <h1 class="select-container__main-title">level-up</h1>
    <h2 class="select-container__subtitle">Select Your Exercise</h2>
    
</div>

<div class="container-buttons-exercises">

    <button class="button-exercise__anki" @click="() => {$router.push('/anki-exercise')}">Anki Cards</button>
    <button class="button-exercise" @click="() => {$router.push('/grammar')}">Grammar</button>
    <button class="button-exercise" @click="() => {$router.push('/translate-common')}">Translate Common English Words</button>
    <button class="button-exercise" @click="() => {$router.push('/translate-dev')}">Translate Dev English Words</button>
    
</div>


</div>

</template>         

<script setup>


</script>

<style scoped>


.select-exercise-main-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    gap: 40px;
    background-color: #000000;
}

.container-buttons-exercises {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 60px;
    margin:auto 20px;
    
}

button {

    font-family: 'BBH Hegarty', cursive;
    font-size: 1.4rem;
    font-weight:lighter;
    padding: 15px 30px;
    border: none;
    border-radius: 10px;
    background: linear-gradient(90deg, #dce9ee, #a19abe);
    color: rgb(0, 0, 0);
    cursor: pointer;
    transition: background 0.3s ease;
    width:200px;
}

.select-container__main-title ,.select-container__subtitle {
  font-family: "Edu NSW ACT Cursive", cursive;
  margin-bottom: 2rem;
  background: linear-gradient(80deg, #438eca, #f378ed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.select-container__main-title {
    font-size: 5.5rem;
}

.select-container__subtitle {
    margin-bottom: 0;
    font-size: 1.5rem;
    margin-top: -20px;
}

.select-title-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    
    font-size: clamp(1.5rem, 5vw, 3rem);
    line-height: 1.2;
    margin-top: 2rem;
}

.button-exercise__anki {
    background: linear-gradient(90deg, #8e40ad, #ff6666);   
}


</style>