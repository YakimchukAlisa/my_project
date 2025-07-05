<template>
  <div class="hive">
    <h2 align="center">Улей</h2>

    <!-- Куча нектара -->
    <div class="resource-pile nectar-pile" :style="{ left: nectarPile.x + '%', top: nectarPile.y + '%' }">

      <div class="pile-counter">{{ nectarPile.amount }}</div>
    </div>

    <!-- Куча пыльцы -->
    <div class="resource-pile pollen-pile" :style="{ left: pollenPile.x + '%', top: pollenPile.y + '%' }">

      <div class="pile-counter">{{ pollenPile.amount }}</div>
    </div>

    <!-- Куча мёда -->
    <div class="resource-pile honey-pile" :style="{ left: honeyPile.x + '%', top: honeyPile.y + '%' }">

      <div class="pile-counter">{{ honeyPile.amount }}</div>
    </div>

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
    resourcePiles: Object,
    getBeeRole: Function
  },

  computed: {
    beesInHive() {
      return this.bees.filter(bee => bee.state === 'in_hive');
    },
    nectarPile() {
      return this.resourcePiles.nectar;
    },
    pollenPile() {
      return this.resourcePiles.pollen;
    },
    honeyPile() {
      return this.resourcePiles.honey;
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
        case 'processing': status = 'Перерабатывает нектар'; break;
        case 'flying_to_honey': status = 'Относит мёд'; break;
        case 'flying_to_nectar': status = 'Летит к нектару'; break;
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

<style scoped>
.resource-pile {
  position: absolute;
  width: 60px;
  height: 60px;
  transform: translate(-50%, -50%);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  z-index: 5;
}

.nectar-pile {
  background-color: rgba(233, 30, 99, 0.2);
  border: 2px dashed #e91e63;
}

.pollen-pile {
  background-color: rgba(76, 175, 80, 0.2);
  border: 2px dashed #4caf50;
}

.honey-pile {
  background-color: rgba(96, 113, 201, 0.677);
  border: 2px dashed rgba(38, 50, 110, 0.677);
}

.pile-counter {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: bold;
}
</style>