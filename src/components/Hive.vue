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

    <!-- Матка -->
    <div class="bee bee-queen" :style="{ left: queen.position.x + 'px', top: queen.position.y + 'px' }" title="Матка">
    </div>

    <!-- Яйца -->
    <div v-for="egg in eggs" :key="'egg-' + egg.id" class="egg"
      :style="{ left: egg.position.x + 'px', top: egg.position.y + 'px' }" :title="`Яйцо\nВозраст: ${egg.age}`"></div>

    <!-- Личинки -->
    <div v-for="larva in larvae" :key="'larva-' + larva.id" class="larva"
      :class="larva.foodType === 'ROYAL_JELLY' ? 'larva-royal' : 'larva-normal'"
      :style="{ left: larva.position.x + 'px', top: larva.position.y + 'px' }" :title="getLarvaTooltip(larva)">
    </div>

    <!-- Куколки -->
    <div v-for="pupa in pupae" :key="'pupa-' + pupa.id" class="pupa"
      :style="{ left: pupa.position.x + 'px', top: pupa.position.y + 'px' }" :title="`Куколка\nВозраст: ${pupa.age}`">
    </div>

    <!-- Пчёлы -->
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
    eggs: Array,
    pupae: Array,
    larvae: Array,
    queen: Array,
    resourcePiles: Object,
    getBeeRole: Function,
    isRunning: Boolean
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
        transform: 'translate(-50%, -50%)',
        transition: 'all 0.3s ease',
        animation: !this.isRunning ? 'none' : 'pulse 2s infinite ease-in-out'

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
        case 'feeding_larva': status = 'Кормит личинку'; break;
        case 'flying_to_larva': status = 'Летит к личинке'; break;
        case 'searching_flowers': status = 'Ищет цветы'; break;
        case 'checking_flower': status = 'Проверяет цветок'; break;
      }
      return `Пчела #${bee.id}
Возраст: ${bee.age} дней
Роль: ${this.getRoleName(bee.role)}
Состояние: ${status}
${bee.carrying.nectar ? `Нектар: ${bee.carrying.nectar}` : ''}
${bee.carrying.pollen ? `Пыльца: ${bee.carrying.pollen}` : ''}
${bee.carrying.honey ? `Мёд: ${bee.carrying.honey}` : ''}
${bee.carrying.jelly ? `Маточное молочко: ${bee.carrying.jelly}` : ''}`;
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
    },
    getLarvaTooltip(larva) {
      let status = '';
      switch (larva.status) {
        case 'hungry': status = 'Голодная'; break;
        case 'assigned': status = 'Голодная'; break;
        case 'fed': status = 'Сытая'; break;
      }
      return `Возраст: ${larva.age} дней
Состояние: ${status}`;
    }
  }
}
</script>
