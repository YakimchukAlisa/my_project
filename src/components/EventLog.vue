<template>
  <div>
    <h2 align="center">Журнал событий</h2>
    <div class="log">
      <div v-for="(entry, index) in logEntries" :key="index" class="log-entry">
        День {{ entry.day }}: {{ entry.message }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    logEntries: Array
  }
}
</script>