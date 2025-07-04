<template>
  <div class="container">
    <div class="header">
      <h1>Симуляция пчелиной колонии</h1>
      <p>День: {{ day }} | Время дня: {{ timeOfDay }} | Время года: {{ season }}</p>
    </div>

    <div class="dashboard">
      <div class="panel">
        <BeeStats :queenCount="queenCount" :workerCount="workerCount" :droneCount="droneCount" :pupaCount="pupaCount"
          :larvaCount="larvaCount" :eggCount="eggCount" />

        <TaskDistribution :cleanerCount="cleanerCount" :nurseCount="nurseCount" :builderCount="builderCount"
          :receptionistsCount="receptionistsCount" :guardsCount="guardsCount" :foragersCount="foragersCount" />

        <Resources :honey="honey" :nectar="nectar" :pollen="pollen" :water="water" />

        <SimulationControls :isRunning="isRunning" @start="startSimulation" @pause="pauseSimulation"
          @reset="resetSimulation" @change-speed="changeSpeed" @add-flower="addFlower" @add-worker="addWorker" />
      </div>

      <div class="panel">
        <EventLog :logEntries="logEntries" />
      </div>
    </div>

    <div class="hive-container">
      <Hive :bees="bees" :resource-piles="resourcePiles" :get-role-name="getRoleName" />
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

    const beeCounter = ref(0); // Глобальный счётчик пчёл

    const activeForagers = ref([]); // Пчёлы, которые сейчас собирают ресурсы
    const hivePosition = { x: 520, y: 600 }; // Позиция улья

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
    const honey = ref(0)
    const nectar = ref(0)
    const pollen = ref(0)
    const water = ref(0)

    // Журнал событий
    const logEntries = ref([])

    // Игровые тики
    const currentTick = ref(0)
    const ticksPerDay = ref(2400) // 240 тика = 1 день 
    const animationFrameId = ref(null)

    const resourcePiles = ref({
      nectar: {
        x: 45,
        y: 70,
        amount: 0,
        items: []
      },
      pollen: {
        x: 55,
        y: 70,
        amount: 0,
        items: []
      }
    });

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

      // Отправляем сборщиков
      if (timeOfDay.value != 'ночь' && currentTick.value % 10 === 0) {
        sendForagers();
      }

      updateBeePositions();

      // Обновляем всех пчёл в улье без задания
      bees.value.forEach(bee => {
        if (bee.state === 'in_hive' && !bee.target) {
          assignRandomMovement(bee);
          updateRandomMovement(bee);
        }
      });

      // Обновляем время суток каждый 60 тиков (4 раза в день)
      if (currentTick.value % 600 === 0) {
        updateTimeOfDay()
      }

      // Проверяем завершение дня
      if (currentTick.value >= ticksPerDay.value) {
        endDay()
      }
    }

    // Метод возврата сборщиков
    const returnForagers = () => {
      activeForagers.value.forEach(bee => {
        if (bee.state !== 'in_hive') {
          bee.target = hivePosition;
          bee.state = 'flying_to_hive';
        }
      });
    };

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
      checkBeesAge()
      // Восстанавливаем ресурсы на цветах
      flowers.value.forEach(flower => {
        flower.nectar = Math.floor(Math.random() * 10) + 1;
        flower.pollen = Math.floor(Math.random() * 10) + 1;
      });
    }

    const assignRandomMovement = (bee) => {
      if (!bee.randomTarget) {
        bee.randomTarget = {
          x: Math.random() * 1000, // Случайная позиция в пределах улья
          y: Math.random() * 600,
          speed: 1 // Случайная скорость
        };
      }
    };

    const updateRandomMovement = (bee) => {
      if (!bee.randomTarget) return;

      const dx = bee.randomTarget.x - bee.x;
      const dy = bee.randomTarget.y - bee.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 2) { // Достигли цели
        bee.randomTarget = null; // Назначим новую цель в следующем тике
      } else {
        // Двигаемся к цели
        bee.x += (dx / distance) * bee.randomTarget.speed;
        bee.y += (dy / distance) * bee.randomTarget.speed;
      }
    };

    // Цветы на поляне
    const flowers = ref([])

    // Инициализация цветов
    const initFlowers = () => {
      const newFlowers = []
      const fieldWidth = 550
      const fieldHeight = 350

      for (let i = 0; i < 1; i++) {
        newFlowers.push({
          x: Math.random() * (fieldWidth) + 20,
          y: Math.random() * (fieldHeight) + 40,
          nectar: Math.floor(Math.random() * 10) + 1,
          pollen: Math.floor(Math.random() * 10) + 1,
          collectingBee: null // Добавляем это свойство
        })
      }

      flowers.value = newFlowers
    }

    const initBees = () => {
      beeCounter.value = 0; // Сбрасываем счётчик
      for (let i = 0; i < 1; i++) {
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

      const fieldWidth = 1000
      const fieldHeight = 600

      const newBee = {
        id: beeCounter.value,
        type: 'worker',
        age: 0, // возраст в днях
        role: 'forager', // начальная роль
        birthDay: day.value, // день рождения
        x: Math.random() * (fieldWidth),
        y: Math.random() * (fieldHeight),
        target: null,
        carrying: { nectar: 0, pollen: 0 },
        state: 'in_hive' // 'in_hive', 'flying_to_flower', 'collecting', 'flying_to_hive'
      }

      beeCounter.value++; // Увеличиваем счётчик

      bees.value.push(newBee)
      logEntries.value.unshift({
        day: day.value,
        message: 'Добавлена новая рабочая пчела'
      })
    }

    // Добавим метод для отправки сборщиков
    const sendForagers = () => {
      // Получаем всех сборщиков, которые в улье
      const availableForagers = bees.value.filter(
        bee => bee.role === 'forager' && bee.state === 'in_hive'
      );

      // Получаем цветы с ресурсами
      const availableFlowers = flowers.value.filter(
        flower => (flower.nectar > 0 || flower.pollen > 0) && !flower.collectingBee
      );

      // Отправляем сборщиков на цветы
      availableForagers.forEach((bee, index) => {
        if (index < availableFlowers.length) {
          bee.target = availableFlowers[index];
          bee.target.collectingBee = 1; // Помечаем цветок как занятый
          bee.state = 'flying_to_flower';
          activeForagers.value.push(bee);

          logEntries.value.unshift({
            day: day.value,
            message: `Пчела #${bee.id} вылетела к цветку`
          });
        }
      });
    };

    // Добавим метод для обновления позиций пчёл
    const updateBeePositions = () => {
      activeForagers.value.forEach(bee => {
        if (bee.state === 'flying_to_flower') {
          // Движение к цветку
          const dx = bee.target.x - bee.x + 1100;
          const dy = bee.target.y - bee.y - 90;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 5) { // Достигли цветка
            bee.state = 'collecting';
            //   bee.target.collectingBee = bee.id; // Помечаем цветок как занятый

            collectResources(bee);
            bee.state === 'flying_to_hive'

            // Через 1 секунду (условно) начинаем сбор
            // setTimeout(() => {
            //   collectResources(bee);
            //  }, 1000 / simulationSpeed.value);
          } else {
            // Продолжаем движение
            bee.x += dx * 0.05;
            bee.y += dy * 0.05;
          }
        } else if (bee.state === 'flying_to_hive') {
          // Движение к улью
          const dx = hivePosition.x - bee.x;
          const dy = hivePosition.y - bee.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 5) { // Достигли улья
            deliverResources(bee);
          } else {
            // Продолжаем движение
            bee.x += dx * 0.05;
            bee.y += dy * 0.05;
          }
        }
      });
    };

    // Метод сбора ресурсов
    const collectResources = (bee) => {
      const flower = bee.target;

      // Собираем все ресурсы с цветка
      bee.carrying.nectar = bee.target.nectar;
      bee.carrying.pollen = bee.target.pollen;

      // Опустошаем цветок
      bee.target.nectar = 0;
      bee.target.pollen = 0;
      bee.target.collectingBee = null; // Освобождаем цветок



      logEntries.value.unshift({
        day: day.value,
        message: `Пчела #${bee.id} собрала ${bee.carrying.nectar} нектара и ${bee.carrying.pollen} пыльцы`
      });

      bee.state = 'flying_to_hive';
    };

    // Метод доставки ресурсов
    const deliverResources = (bee) => {
      // Добавляем нектар в кучу
      if (bee.carrying.nectar > 0) {
        nectar.value += bee.carrying.nectar;
        resourcePiles.value.nectar.amount += bee.carrying.nectar;
        resourcePiles.value.nectar.items.push(...Array(bee.carrying.nectar).fill({}));
      }

      // Добавляем пыльцу в кучу
      if (bee.carrying.pollen > 0) {
        pollen.value += bee.carrying.pollen;
        resourcePiles.value.pollen.amount += bee.carrying.pollen;
        resourcePiles.value.pollen.items.push(...Array(bee.carrying.pollen).fill({}));
      }

      logEntries.value.unshift({
        day: day.value,
        message: `Пчела #${bee.id} доставила ${bee.carrying.nectar} нектара и ${bee.carrying.pollen} пыльцы в улей`
      });

      // Сбрасываем переносимые ресурсы
      bee.carrying = { nectar: 0, pollen: 0 };
      bee.state = 'in_hive';
      bee.target = null;
    };

    // Обновление возраста пчел
    const updateBeesAge = () => {
      bees.value.forEach(bee => {
        bee.age = day.value - bee.birthDay
      })
      updateBeeRoles()
    }

    // Определение роли пчелы по возрасту
    const getBeeRole = (age) => {
      // if (age < 3) return 'cleaner'
      //if (age < 6) return 'nurse'
      // if (age < 12) return 'builder'
      //  if (age < 18) return 'receptionist'
      return 'forager'
    }

    // Обновление ролей всех пчел
    const updateBeeRoles = () => {
      bees.value.forEach(bee => {
        bee.role = getBeeRole(bee.age)
      })
    }

    const checkBeesAge = () => {
      const beesToRemove = [];

      bees.value.forEach((bee, index) => {
        if (bee.type === 'worker' && bee.age >= 40 && bee.age <= 45) {
          // 30% вероятность смерти каждый день после 20 дней
          if (Math.random() < 0.3) {
            beesToRemove.push(index);
          }
        }
      });

      // Удаляем пчёл в обратном порядке
      beesToRemove.reverse().forEach(index => {
        const deadBee = bees.value.splice(index, 1)[0];
        logEntries.value.unshift({
          day: day.value,
          message: `Пчела #${deadBee.id} умерла в возрасте ${deadBee.age} дней`
        });
      });
    };

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
      getBeeRole,
      resourcePiles
    }
  }
}
</script>
