<template>
  <div class="field">
    <h2 align="center">Окрестности улья</h2>

    <!-- Цветочки на поляне -->
    <div v-for="(flower, index) in flowers" :key="'flower-' + index" class="flower" :style="{
      left: flower.x + 'px',
      top: flower.y + 'px',
    }" :title="'Нектар: ' + flower.nectar + ', Пыльца: ' + flower.pollen">
    </div>

    <!-- Пчёлы в поле -->
    <div v-for="bee in fieldBees" :key="'field-bee-' + bee.id" class="bee"
      :class="['bee-' + bee.role, bee.state === 'collecting' ? 'bee-collecting' : '']" :style="getBeeStyle(bee)"
      :title="getBeeTooltip(bee)">

      <span class="bee-id">{{ bee.id }}</span>
    </div>
  </div>

</template>

<script>
export default {
  props: {
    flowers: Array,
    bees: Array // Добавлен пропс для пчёл
  },
  computed: {
    fieldBees() {
      // Фильтруем пчёл, которые не в улье
      return this.bees?.filter(bee => bee.state !== 'in_hive') || [];
    }
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
