<template>
  <div class="hive">
    <h2 align="center">Улей</h2>
    <div class="bees-container">
      <div v-for="bee in bees" :key="'bee-' + bee.id" class="bee" :class="['bee-' + bee.role, bee.state]"
        :style="getBeeStyle(bee)" :title="getBeeTooltip(bee)"></div>
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
    getBeeStyle(bee) {
      return {
        left: `${bee.x}px`,
        top: `${bee.y}px`,
        transform: `translate(-50%, -50%) scale(${bee.state === 'collecting' ? 1.2 : 1})`,
        transition: 'all 0.3s ease'
      }
    },
    getBeeTooltip(bee) {
      let status = '';
      switch (bee.state) {
        case 'in_hive': status = 'В улье'; break;
        case 'flying_to_flower': status = 'Летит к цветку'; break;
        case 'collecting': status = 'Собирает ресурсы'; break;
        case 'flying_to_hive': status = 'Возвращается в улей'; break;
      }

      return `Пчела #${bee.id}
Возраст: ${bee.age} дней
Роль: ${this.getRoleName(bee.role)}
Состояние: ${status}
${bee.carrying.nectar ? `Нектар: ${bee.carrying.nectar}` : ''}
${bee.carrying.pollen ? `Пыльца: ${bee.carrying.pollen}` : ''}`;
    },
    getRoleName(role) {
      const roles = {
        cleaner: 'Уборщица',
        nurse: 'Кормилица',
        builder: 'Строитель',
        receptionist: 'Приёмщица',
        forager: 'Сборщица'
      }
      return roles[role] || role;
    }
  }
}
</script>
