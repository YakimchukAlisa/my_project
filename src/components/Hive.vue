<template>
  <div class="hive">
    <h2 align="center">Улей</h2>
    <div class="bees-container">
      <div 
        v-for="(bee, index) in bees" 
        :key="'bee-' + index"
        class="bee"
        :class="'bee-' + bee.role"
          :style="{
        left: bee.x + 'px',
        top: bee.y + 'px',
      }"
        :title="`Пчела #${bee.id}\nВозраст: ${bee.age} дней\nРоль: ${getRoleName(bee.role)}`"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    bees: Array,
    getBeeRole: Function
  },
  methods: {
    getRoleName(role) {
      const roles = {
        cleaner: 'Уборщица',
        nurse: 'Кормилица',
        builder: 'Строитель',
        receptionist: 'Приёмщица',
        forager: 'Сборщица'
      }
      return roles[role]
    }
  }
}
</script>
