<template>
  <div class="container">
    <div class="header">
      <h1>Симуляция пчелиной колонии</h1>
      <p>День: {{ day }} | Время дня: {{ timeOfDay }} | Время года: {{ season }}</p>
    </div>
    
    <div class="dashboard">
      <div class="panel">
        <BeeStats 
          :queenCount="queenCount"
          :workerCount="workerCount"
          :droneCount="droneCount"
          :pupaCount="pupaCount"
          :larvaCount="larvaCount"
          :eggCount="eggCount"
        />
        
        <TaskDistribution 
          :cleanerCount="cleanerCount"
          :nurseCount="nurseCount"
          :builderCount="builderCount"
          :receptionistsCount="receptionistsCount"
          :guardsCount="guardsCount"
          :foragersCount="foragersCount"
        />
        
        <Resources 
          :honey="honey"
          :nectar="nectar"
          :pollen="pollen"
          :water="water"
        />
        
        <SimulationControls 
          :isRunning="isRunning"
          @start="startSimulation"
          @pause="pauseSimulation"
          @reset="resetSimulation"
          @change-speed="changeSpeed"
          @add-flower="addFlower"
          @add-worker="addWorker"
        />
      </div>

      <div class="panel">
        <EventLog :logEntries="logEntries" />
      </div>
    </div>

    <div class="hive-container">
      <Hive />
      <Field :flowers="flowers" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import BeeStats from './components/BeeStats.vue'
import TaskDistribution from './components/TaskDistribution.vue'
import Resources from './components/Resources.vue'
import SimulationControls from './components/SimulationControls.vue'
import EventLog from './components/EventLog.vue'
import Hive from './components/Hive.vue'
import Field from './components/Field.vue'

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
  setup() {
    // Состояние симуляции
    const day = ref(0)
    const timeOfDay = ref('утро')
    const season = ref('весна')
    const isRunning = ref(false)
    const simulationSpeed = ref(1)
    
    // Пчелиная колония
    const queenCount = ref(1)
    const workerCount = ref(50)
    const droneCount = ref(10)
    const pupaCount = ref(20)
    const larvaCount = ref(30)
    const eggCount = ref(40)
    
    // Распределение задач
    const cleanerCount = ref(5)
    const nurseCount = ref(10)
    const builderCount = ref(5)
    const receptionistsCount = ref(5)
    const guardsCount = ref(5)
    const foragersCount = ref(20)
    
    // Ресурсы
    const honey = ref(100)
    const nectar = ref(50)
    const pollen = ref(50)
    const water = ref(30)
    
    // Журнал событий
    const logEntries = ref([])
    
     // Игровые тики
    const currentTick = ref(0)
    const ticksPerDay = ref(240) // 24 тика = 1 день (можно настроить)
    const animationFrameId = ref(null)
    
    // ... остальные состояния (пчелы, ресурсы и т.д.)

    // Основной цикл симуляции
    const simulationLoop = () => {
      if (!isRunning.value) return
      
      // Выполняем один тик симуляции
      simulationTick()
      
      // Планируем следующий кадр с учетом скорости
      const delay = Math.max(1000 / (10 * simulationSpeed.value), 16) // ~10 тиков/сек на 1x скорости
      animationFrameId.value = setTimeout(simulationLoop, delay)
    }
    
    // Один тик симуляции
    const simulationTick = () => {
      currentTick.value++
      
      // Обновляем время суток каждый 6 тиков (4 раза в день)
      if (currentTick.value % 60 === 0) {
        updateTimeOfDay()
      }
      
      // Проверяем завершение дня
      if (currentTick.value >= ticksPerDay.value) {
        endDay()
      }
    }
    
    // Обновление времени суток
    const updateTimeOfDay = () => {
      const times = ['утро', 'день', 'вечер', 'ночь']
      const currentIndex = times.indexOf(timeOfDay.value)
      timeOfDay.value = times[(currentIndex + 1) % times.length]
      
      logEntries.value.unshift({
        day: day.value,
        message: `Наступило ${timeOfDay.value}`
      })
    }
    
    // Завершение дня
    const endDay = () => {
      day.value++
      currentTick.value = 0
    }


    


    // Цветы на поляне
    const flowers = ref([])
    
    // Инициализация цветов
    const initFlowers = () => {
      const newFlowers = []
      const fieldWidth = 550
      const fieldHeight = 350
      
      for (let i = 0; i < 20; i++) {
        newFlowers.push({
          x: Math.random() * (fieldWidth) + 20,
          y: Math.random() * (fieldHeight) + 40,
          nectar: Math.floor(Math.random() * 10) + 1,
          pollen: Math.floor(Math.random() * 10) + 1
        })
      }
      
      flowers.value = newFlowers
    }
    
    // Добавление нового цветка
    const addFlower = () => {
      const fieldWidth = 500
      const fieldHeight = 350
      
      flowers.value.push({
        x: Math.random() * (fieldWidth) + 20,
        y: Math.random() * (fieldHeight) + 40,
        nectar: Math.floor(Math.random() * 10) + 1,
        pollen: Math.floor(Math.random() * 10) + 1
      })
      
      logEntries.value.unshift({
        day: day.value,
        message: 'На поляне вырос новый цветок!'
      })
    }
    
    // Управление симуляцией
    const startSimulation = () => {
  if (isRunning.value) return; // Если уже запущена, ничего не делаем
  
  isRunning.value = true;
  logEntries.value.unshift({
    day: day.value,
    message: 'Симуляция начата'
  });
  
  // Запускаем игровой цикл
  simulationLoop();
};

    
    const pauseSimulation = () => {
      isRunning.value = false
      logEntries.value.unshift({
        day: day.value,
        message: 'Симуляция на паузе'
      })
    }
    
    const resetSimulation = () => {
      isRunning.value = false
      day.value = 0
      timeOfDay.value = 'утро'
      season.value = 'весна'
      logEntries.value = []
      initFlowers()
      logEntries.value.unshift({
        day: day.value,
        message: 'Симуляция сброшена'
      })
    }
    
    const changeSpeed = (speed) => {
      simulationSpeed.value = speed
      logEntries.value.unshift({
        day: day.value,
        message: 'Скорость симуляции изменена на ' + speed + 'x'
      })
    }
    
    const addWorker = () => {
      workerCount.value++
      logEntries.value.unshift({
        day: day.value,
        message: 'Добавлена новая рабочая пчела'
      })
    }
    
    // Инициализируем цветы при загрузке
    initFlowers()
    
    return {
      day,
      timeOfDay,
      season,
      isRunning,
     currentTick,
      ticksPerDay,
      queenCount,
      workerCount,
      droneCount,
      pupaCount,
      larvaCount,
      eggCount,
      cleanerCount,
      nurseCount,
      builderCount,
      receptionistsCount,
      guardsCount,
      foragersCount,
      honey,
      nectar,
      pollen,
      water,
      logEntries,
      flowers,
      startSimulation,
      pauseSimulation,
      resetSimulation,
      changeSpeed,
      addFlower,
      addWorker
    }
  }
}
</script>