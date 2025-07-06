<template>
  <div class="container">
    <div class="header">
      <h1>Симуляция пчелиной колонии</h1>
      <p>День: {{ day }} | Время дня: {{ timeOfDay }} | Время года: {{ season }}</p>
    </div>

    <div class="dashboard">
      <div class="panel">
        <BeeStats :queenCount="queenCount" :workerCount="workerCount" :droneCount="droneCount" :pupae="pupae"
          :larvae="larvae" :eggs="eggs" />

        <TaskDistribution :cleanerCount="cleanerCount" :nurseCount="nurseCount" :builderCount="builderCount"
          :receptionistsCount="receptionistsCount" :guardsCount="guardsCount" :foragersCount="foragersCount" />

        <Resources :honey="resourcePiles.honey.amount" :nectar="resourcePiles.nectar.amount"
          :pollen="resourcePiles.pollen.amount" :water="water" />

        <SimulationControls :isRunning="isRunning" @start="startSimulation" @pause="pauseSimulation"
          @reset="resetSimulation" @change-speed="changeSpeed" @add-flower="addFlower" @add-worker="addWorker" />
      </div>

      <div class="panel">
        <EventLog :logEntries="logEntries" />
      </div>
    </div>

    <div class="hive-container">
      <Hive :bees="bees" :queen="queen" :eggs="eggs" :larvae="larvae" :pupae="pupae" :resource-piles="resourcePiles"
        :get-role-name="getRoleName" />
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
    const activeReceptionists = ref([]); // Пчёлы, которые сейчас перерабатывают нектар
    const hivePosition = { x: 520, y: 600 }; // Позиция улья

    // Пчелиная колония
    const queenCount = computed(() => bees.value.filter(b => b.type === 'queen').length)
    const workerCount = computed(() => bees.value.filter(b => b.type === 'worker').length)
    const droneCount = computed(() => bees.value.filter(b => b.type === 'drone').length)
    const pupaCount = ref(0)
    const larvaCount = ref(0)
    const eggCount = ref(0)

    const queen = ref({
      id: 0,
      age: 0,
      position: { x: 10, y: 20 }, // Позиция в улье
      lastEggDay: -1 // День последней кладки
    });

    const eggs = ref([]);
    const larvae = ref([]);
    const pupae = ref([]);

    // Типы развития
    const DEVELOPMENT_STAGES = {
      EGG: { duration: 3, next: 'LARVA' },
      LARVA: { duration: 6, next: 'PUPA' },
      PUPA: { duration: 12, next: 'ADULT' }
    };

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

    const processingNectar = ref([]); // Нектар в процессе переработки
    const honeyProductionTime = 240; // Время переработки в тиках (1 день)

    // Игровые тики
    const currentTick = ref(0)
    const ticksPerDay = ref(240) // 240 тика = 1 день 
    const animationFrameId = ref(null)

    const resourcePiles = ref({
      nectar: {
        x: 45,
        y: 70,
        amount: 29,
      },
      pollen: {
        x: 55,
        y: 70,
        amount: 0,
      },
      honey: {
        x: 65,
        y: 70,
        amount: 0,
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

      checkQueenEggLaying();
      updateDevelopment();
      assignNurseTasks();
      updateFeeding();

      // Проверяем завершённые процессы переработки
      processingNectar.value = processingNectar.value.filter(item => {
        const elapsedTicks = (day.value - item.startDay) * ticksPerDay.value +
          (currentTick.value - item.startTick);

        if (elapsedTicks >= honeyProductionTime) {

          // Освобождаем пчелу
          const bee = bees.value.find(b => b.id === item.beeId);
          if (bee) {
            bee.state = 'flying_to_honey';
            bee.target.x = 650;
            bee.target.y = 600;
          }

          return false; // Удаляем завершённый процесс
        }
        return true; // Продолжаем процесс
      });

      // Отправляем сборщиков
      if (timeOfDay.value != 'ночь' && currentTick.value % 10 === 0) {
        sendForagers();
      }

      updateBeePositions();

      sendReceptionists();

      // Обновляем всех пчёл в улье без задания
      bees.value.forEach(bee => {
        if (bee.state === 'in_hive' && !bee.target) {
          assignRandomMovement(bee);
          updateRandomMovement(bee);
        }
      });

      updateBeeRoles()

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
      queen.value.age++;
      updateBeesAge()
      checkBeesAge()
      updateFlowersAge()
      checkFlowersAge()
      randomFlower()
      // Восстанавливаем ресурсы на цветах
      flowers.value.forEach(flower => {
        if (flower.nectar === 0 && flower.pollen === 0) {
          flower.nectar = Math.floor(Math.random() * 10) + 1;
          flower.pollen = Math.floor(Math.random() * 10) + 1;
        }
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
      const fieldWidth = 1000
      const fieldHeight = 700

      for (let i = 0; i < 7; i++) {
        newFlowers.push({
          age: 0,
          x: Math.random() * (fieldWidth) + 20,
          y: Math.random() * (fieldHeight) + 40,
          nectar: Math.floor(Math.random() * 10) + 1,
          pollen: Math.floor(Math.random() * 10) + 1,
          collectingBee: null // Добавляем это свойство
        })
      }

      flowers.value = newFlowers
    }

    const checkQueenEggLaying = () => {

      if (Math.random() < 0.005) {
        layEgg();
        queen.value.lastEggDay = day.value;
      }
    };

    const layEgg = () => {
      const newEgg = {
        id: Date.now(),
        createdDay: day.value,
        type: 'EGG',
        position: {
          x: queen.value.position.x + (Math.random() * 20 + 5),
          y: queen.value.position.y + (Math.random() * 20)
        },
        fed: 0 // Количество кормлений
      };

      eggs.value.push(newEgg);

      logEntries.value.unshift({
        day: day.value,
        message: 'Матка отложила новое яйцо'
      });
    };

    const updateDevelopment = () => {
      // Обновляем яйца
      eggs.value = eggs.value.filter(egg => {
        const age = day.value - egg.createdDay;
        if (age >= DEVELOPMENT_STAGES.EGG.duration) {
          // Превращаем в личинку
          larvae.value.push({
            id: egg.id,
            createdDay: day.value,
            type: 'LARVA',
            position: egg.position,
            fed: 0,
            foodType: 'ROYAL_JELLY' // Первые 3 дня - маточное молочко
          });
          return false;
        }
        return true;
      });

      // Обновляем личинок
      larvae.value = larvae.value.filter(larva => {
        const age = day.value - larva.createdDay;

        // Меняем тип питания после 3 дней
        if (age >= 3 && larva.foodType === 'ROYAL_JELLY') {
          larva.foodType = 'HONEY_POLLEN';
        }

        if (age >= DEVELOPMENT_STAGES.LARVA.duration) {
          // Превращаем в куколку
          pupae.value.push({
            id: larva.id,
            createdDay: day.value,
            type: 'PUPA',
            position: larva.position
          });
          return false;
        }
        return true;
      });

      // Обновляем куколок
      pupae.value = pupae.value.filter(pupa => {
        const age = day.value - pupa.createdDay;
        if (age >= DEVELOPMENT_STAGES.PUPA.duration) {
          addWorkerBee(pupa.position);
          return false;
        }
        return true;
      });
    };

    const addWorkerBee = (position) => {
      const newBee = {
        id: beeCounter.value,
        type: 'worker',
        age: 0, // возраст в днях
        role: 'receptionist', // начальная роль
        x: position.x,
        y: position.y,
        target: null,
        carrying: { nectar: 0, pollen: 0 },
        state: 'in_hive' // 'in_hive', 'flying_to_flower', 'collecting', 'flying_to_hive'
      };


      beeCounter.value++;
      bees.value.push(newBee);

      logEntries.value.unshift({
        day: day.value,
        message: 'Вывелась новая пчела из куколки'
      });
    };

    const assignNurseTasks = () => {
      const nurses = bees.value.filter(b => b.role === 'nurse' && b.state === 'in_hive');
      const hungryLarvae = larvae.value.filter(l => l.fed < 6); // Максимум 6 кормлений

      nurses.forEach((nurse, index) => {
        if (index < hungryLarvae.length && !nurse.target) {
          const larva = hungryLarvae[index];

          nurse.target = {
            x: larva.position.x,
            y: larva.position.y,
            larvaId: larva.id
          };
          nurse.state = 'feeding_larva';

          // Определяем тип пищи
          nurse.carrying = larva.foodType === 'ROYAL_JELLY'
            ? { nectar: 0, pollen: 0, jelly: 1 }
            : { nectar: 1, pollen: 1, jelly: 0 };
        }
      });
    };

    const updateFeeding = () => {
      bees.value.forEach(bee => {
        if (bee.state === 'feeding_larva' && bee.target) {
          const dx = bee.target.x - bee.x;
          const dy = bee.target.y - bee.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 5) {
            // Нашли личинку
            const larva = larvae.value.find(l => l.id === bee.target.larvaId);
            if (larva) {
              larva.fed++;

              // Проверяем, не нужно ли сменить тип пищи
              if (larva.fed >= 3 && larva.foodType === 'ROYAL_JELLY') {
                larva.foodType = 'HONEY_POLLEN';
              }
            }

            // Пчела возвращается
            bee.state = 'returning_to_hive';
            bee.target = { x: 50, y: 50 }; // Центр улья
          }
        }
      });
    };

    const initBees = () => {
      beeCounter.value = 0; // Сбрасываем счётчик
      for (let i = 0; i < 5; i++) {
        addWorker()
      }
    }

    // Добавление нового цветка
    const addFlower = () => {
      const fieldWidth = 1000
      const fieldHeight = 700

      flowers.value.push({
        age: 0,
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

    const randomFlower = () => {
      if (Math.random() < 2) {
        addFlower()
      }
    }

    const checkFlowersAge = () => {
      const FlowersToRemove = [];

      flowers.value.forEach((flower, index) => {
        if (flower.age >= 10) {
          // 30% вероятность смерти каждый день после 10 дней
          if (Math.random() < 0.3) {
            FlowersToRemove.push(index);
          }
        }
      });

      // Удаляем пчёл в обратном порядке
      FlowersToRemove.reverse().forEach(index => {
        flowers.value.splice(index, 1)[0];
      });
    };

    // Обновление возраста пчел
    const updateFlowersAge = () => {
      flowers.value.forEach(flower => {
        flower.age += 1;
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
      //bees = []
      resourcePiles.value.nectar.amount = 0;
      resourcePiles.value.pollen.amount = 0;
      resourcePiles.value.honey.amount = 0;
      logEntries.value = []
      initFlowers()
      activeForagers.value = [];
      bees.value = [];
      eggs.value = [];
      larvae.value = [];
      pupae.value = [];
      activeReceptionists.value = [];
      processingNectar.value = [];
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
        role: 'receptionist', // начальная роль
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
      bees.value.forEach(bee => {
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
        } else if (bee.state === 'flying_to_honey') {
          const dx = bee.target.x - bee.x;
          const dy = bee.target.y - bee.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 1) {
            // Процесс завершён - производим мёд
            const honeyProduced = Math.floor(bee.carrying.nectar / 2);
            resourcePiles.value.honey.amount += honeyProduced;

            bee.carrying.nectar = 0;
            bee.state = 'in_hive';
            bee.target = null;

            logEntries.value.unshift({
              day: day.value,
              message: `Приёмщица #${bee.id} произвела ${honeyProduced} мёда`
            });

          } else {
            // Продолжаем движение
            bee.x += dx * 0.05;
            bee.y += dy * 0.05;
          }
        } else if (bee.state === 'flying_to_nectar') {
          const dx = bee.target.x - bee.x;
          const dy = bee.target.y - bee.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 1) { // Достигли цели
            // Уменьшаем кучу нектара
            resourcePiles.value.nectar.amount -= bee.carrying.nectar;
            // resourcePiles.value.nectar.items.splice(0, amountToTake);
            activeReceptionists.value = activeReceptionists.value.filter(b => b.id !== bee.id); // Удаляем пчелу
            // Добавляем в обработку
            processingNectar.value.push({
              amount: bee.carrying.nectar,
              startDay: day.value,
              startTick: currentTick.value,
              beeId: bee.id
            });

            bee.state = 'processing';

            logEntries.value.unshift({
              day: day.value,
              message: `Приёмщица #${bee.id} взяла ${bee.carrying.nectar} нектара на переработку`
            });

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
        //     resourcePiles.value.nectar.items.push(...Array(bee.carrying.nectar).fill({}));
      }

      // Добавляем пыльцу в кучу
      if (bee.carrying.pollen > 0) {
        pollen.value += bee.carrying.pollen;
        resourcePiles.value.pollen.amount += bee.carrying.pollen;
        //     resourcePiles.value.pollen.items.push(...Array(bee.carrying.pollen).fill({}));
      }

      logEntries.value.unshift({
        day: day.value,
        message: `Пчела #${bee.id} доставила ${bee.carrying.nectar} нектара и ${bee.carrying.pollen} пыльцы в улей`
      });

      activeForagers.value = activeForagers.value.filter(b => b.id !== bee.id); // Удаляем пчелу

      // Сбрасываем переносимые ресурсы
      bee.carrying = { nectar: 0, pollen: 0 };
      bee.state = 'in_hive';
      bee.target = null;
    };

    // Обновление возраста пчел
    const updateBeesAge = () => {
      bees.value.forEach(bee => {
        bee.age += 1;
      })
    }

    // Определение роли пчелы по возрасту
    const getBeeRole = (age) => {
      // if (age < 3) return 'cleaner'
      //if (age < 6) return 'nurse'
      // if (age < 12) return 'builder'
      //  if (age < 18) return 'receptionist'
      if (age < 1) return 'receptionist'
      else return 'forager'
    }

    // Обновление ролей всех пчел
    const updateBeeRoles = () => {
      bees.value.forEach(bee => {
        if (bee.state === 'in_hive')
          bee.role = getBeeRole(bee.age)
      })
    }

    const sendReceptionists = () => {
      bees.value.forEach(bee => {
        if (bee.role === 'receptionist' && bee.state === 'in_hive') {
          assignReceptionistTask(bee)
        }
      })
    }

    const assignReceptionistTask = (bee) => {
      // Проверяем, есть ли нектар для переработки
      if (resourcePiles.value.nectar.amount - activeReceptionists.value.length * 10 > 0) {
        const amountToTake = Math.min(10, resourcePiles.value.nectar.amount - activeReceptionists.value.length * 10);
        bee.state = 'flying_to_nectar';
        activeReceptionists.value.push(bee);
        bee.carrying.nectar = amountToTake;
        bee.target = { x: 500, y: 600 }; // Позиция "рабочего места"
      }
    };

    const checkBeesAge = () => {
      const beesToRemove = [];

      bees.value.forEach((bee, index) => {
        if (bee.type === 'worker' && bee.age >= 25) {
          // 30% вероятность смерти каждый день после 25 дней
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
      resourcePiles,
      queen,
      eggs,
      larvae,
      pupae,
    }
  }
}
</script>
