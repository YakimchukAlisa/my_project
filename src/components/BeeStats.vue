<template>
  <div>
    <h2 align="center">Состав колонии</h2>
    <div class="stats">
      <div class="stat-item">
        <div>Матка</div>
        <div>{{ queenCount }}</div>
      </div>
      <div class="stat-item">
        <div>Рабочие</div>
        <div>{{ workerCount }}</div>
      </div>
      <div class="stat-item">
        <div>Трутни</div>
        <div>{{ droneCount }}</div>
      </div>
      <div class="stat-item">
        <div>Куколки</div>
        <div>{{ pupae.length }}</div>
      </div>
      <div class="stat-item">
        <div>Личинки</div>
        <div>{{ larvae.length }}</div>
      </div>
      <div class="stat-item">
        <div>Яйца</div>
        <div>{{ eggs.length }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    queenCount: Number,
    workerCount: Number,
    droneCount: Number,
    pupae: Array,
    larvae: Array,
    eggs: Array
  }
}
</script>