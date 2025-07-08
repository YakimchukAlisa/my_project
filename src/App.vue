<template>
  <div class="container">
    <div class="header">
      <h1>Симуляция пчелиной колонии</h1>
      <p>День: {{ simulation.day }} | Время дня: {{ simulation.timeOfDay }}</p>
    </div>

    <div class="dashboard">
      <div class="panel">
        <BeeStats :queenCount="simulation.queenCount" :workerCount="simulation.bees.length" :pupae="simulation.pupae"
          :larvae="simulation.larvae" :eggs="simulation.eggs" />

        <TaskDistribution :nurseCount="simulation.nurseCount" :receptionistsCount="simulation.receptionistsCount"
          :foragersCount="simulation.foragersCount" />

        <Resources :honey="simulation.resourcePiles.honey.amount" :nectar="simulation.resourcePiles.nectar.amount"
          :pollen="simulation.resourcePiles.pollen.amount" :flowers="simulation.flowers" />

        <SimulationControls :isRunning="simulation.isRunning" @start="simulation.startSimulation()"
          @pause="simulation.pauseSimulation()" @reset="simulation.resetSimulation()"
          @change-speed="simulation.changeSpeed" @add-flower="simulation.addFlower()"
          @add-worker="simulation.addWorker()" @apply-settings="applyInitialSettings"
          @changeSpeed10="simulation.changeSimulationSpeed(10)" @changeSpeed1="simulation.changeSimulationSpeed(1)"
          @changeSpeed2="simulation.changeSimulationSpeed(2)" />
      </div>

      <div class="panel">
        <EventLog :logEntries="simulation.logEntries" />
      </div>
    </div>

    <div class="hive-container">
      <Hive :bees="simulation.bees" :queen="simulation.queen" :eggs="simulation.eggs" :larvae="simulation.larvae"
        :pupae="simulation.pupae" :resource-piles="simulation.resourcePiles" :get-role-name="getRoleName" />
      <Field :flowers="simulation.flowers" />
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue';
import { Simulation } from './models/Simulation.js';
import BeeStats from './components/BeeStats.vue';
import TaskDistribution from './components/TaskDistribution.vue';
import Resources from './components/Resources.vue';
import SimulationControls from './components/SimulationControls.vue';
import EventLog from './components/EventLog.vue';
import Hive from './components/Hive.vue';
import Field from './components/Field.vue';

export default {
  components: {
    BeeStats,
    TaskDistribution,
    Resources,
    SimulationControls,
    EventLog,
    Hive,
    Field
  },
  data() {
    return {
      simulation: new Simulation()
    };
  },
  methods: {
    getRoleName(role) {
      const roles = {
        'nurse': 'Кормилица',
        'receptionist': 'Приёмщица',
        'forager': 'Сборщица',
      };
      return roles[role] || role;
    },
    applyInitialSettings(settings) {
      this.simulation.applyInitialSettings(settings);
    }
  },

};
</script>
