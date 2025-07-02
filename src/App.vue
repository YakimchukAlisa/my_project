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
      <Hive
      :bees="bees" 
      :getBeeRole="getBeeRole" />
      <Field :flowers="flowers" />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
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

      // Список всех пчел
    const bees = ref([])
    
    // Пчелиная колония
        const queenCount = computed(() => bees.value.filter(b => b.type === 'queen').length)
    const workerCount = computed(() => bees.value.filter(b => b.type === 'worker').length)
    const droneCount = computed(() => bees.value.filter(b => b.type === 'drone').length)
    const pupaCount = ref(0)
    const larvaCount = ref(0)
    const eggCount = ref(0)
    
      // Распределение задач (вычисляемые значения)
    const cleanerCount = computed(() => bees.value.filter(b => b.role === 'cleaner').length)
    const nurseCount = computed(() => bees.value.filter(b => b.role === 'nurse').length)
    const builderCount = computed(() => bees.value.filter(b => b.role === 'builder').length)
    const receptionistsCount = computed(() => bees.value.filter(b => b.role === 'receptionist').length)
    const guardsCount = computed(() => bees.value.filter(b => b.role === 'guard').length)
    const foragersCount = computed(() => bees.value.filter(b => b.role === 'forager').length)
    
    // Ресурсы
    const honey = ref(100)
    const nectar = ref(50)
    const pollen = ref(50)
    const water = ref(30)
    
    // Журнал событий
    const logEntries = ref([])
    
     // Игровые тики
    const currentTick = ref(0)
    const ticksPerDay = ref(240) // 240 тика = 1 день 
    const animationFrameId = ref(null)

    // Основной цикл симуляции
    const simulationLoop = () => {
      if (!isRunning.value) return
      
      // Выполняем один тик симуляции
      simulationTick()
      
      // Планируем следующий кадр с учетом скорости
      const delay = Math.max(1000 / (10 * simulationSpeed.value), 16) 
      animationFrameId.value = setTimeout(simulationLoop, delay)
    }
    
    // Один тик симуляции
    const simulationTick = () => {
      currentTick.value++
      
      // Обновляем время суток каждый 60 тиков (4 раза в день)
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
      updateBeesAge()
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
    
    const initBees = () => {
  for (let i = 0; i < 10; i++) {
    addWorker()
  }
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
      
       bees.value = [];
      initBees()
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
    
       // Добавление новой рабочей пчелы
    const addWorker = () => {
        const fieldWidth = 500
      const fieldHeight = 350

      const newBee = {
        id: Date.now(),
        type: 'worker',
        age: 0, // возраст в днях
        role: 'cleaner', // начальная роль
        birthDay: day.value, // день рождения
        x: Math.random() * (fieldWidth) + 20,
        y: Math.random() * (fieldHeight) + 40,
      }

      bees.value.push (newBee)
       logEntries.value.unshift({
        day: day.value,
        message: 'Добавлена новая рабочая пчела'
    })
  }

        // Обновление возраста пчел
    const updateBeesAge = () => {
      bees.value.forEach(bee => {
        bee.age = day.value - bee.birthDay
      })
      updateBeeRoles()
    }

       // Определение роли пчелы по возрасту
    const getBeeRole = (age) => {
      if (age < 3) return 'cleaner'
      if (age < 6) return 'nurse'
      if (age < 12) return 'builder'
      if (age < 18) return 'receptionist'
      return 'forager'
    }

    // Обновление ролей всех пчел
    const updateBeeRoles = () => {
      bees.value.forEach(bee => {
        bee.role = getBeeRole(bee.age)
      })
    }

    
    // Инициализируем цветы при загрузке
    initFlowers()
    initBees()
    
    return {
      day,
      timeOfDay,
      season,
      isRunning,
     currentTick,
      ticksPerDay,
      bees,
      updateBeesAge,
         updateBeeRoles,
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
      addWorker,
      getBeeRole
    }
  }
}
</script>