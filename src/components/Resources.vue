<template>
  <div>
    <h2 align="center">Ресурсы</h2>
    <div class="stats">
      <div class="stat-item">
        <div>Мёд</div>
        <div>{{ honey }}</div>
      </div>
      <div class="stat-item">
        <div>Нектар</div>
        <div>{{ nectar }}</div>
      </div>
      <div class="stat-item">
        <div>Пыльца</div>
        <div>{{ pollen }}</div>
      </div>
      <div class="stat-item">
        <div>Цветы</div>
        <div>{{ flowers.length }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    honey: Number,
    nectar: Number,
    pollen: Number,
    flowers: Array
  }
}
</script>