<template>
  <div>
    <h2 align="center">Распределение задач</h2>
    <div class="stats">
      <div class="stat-item">
        <div>Кормилицы</div>
        <div>{{ nurseCount }}</div>
      </div>
      <div class="stat-item">
        <div>Приёмщицы</div>
        <div>{{ receptionistsCount }}</div>
      </div>
      <div class="stat-item">
        <div>Сборщики</div>
        <div>{{ foragersCount }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    nurseCount: Number,
    receptionistsCount: Number,
    foragersCount: Number
  }
}
</script>