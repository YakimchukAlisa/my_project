<template>
  <div class="field">
    <h2 align="center">Окрестности улья</h2>
    <div class="lake"></div>
    
    <!-- Цветочки на поляне -->
    <div 
      v-for="(flower, index) in flowers" 
      :key="'flower-'+index"
      class="flower"
      :style="{
        left: flower.x + 'px',
        top: flower.y + 'px',
      }"
      :title="'Нектар: ' + flower.nectar + ', Пыльца: ' + flower.pollen"
    >
    </div>
  </div>
</template>

<script>
export default {
  props: {
    flowers: Array
  }
}
</script>