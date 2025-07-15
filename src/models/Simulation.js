import { Bee } from './Bee.js';
import { Queen } from './Queen.js';
import { Egg, Larva, Pupa } from './Development.js';
import { Flower } from './Flower.js';

export class Simulation {
  constructor() {
    // Состояние симуляции
    this.day = 0;
    this.timeOfDay = 'утро';
    this.isRunning = false;
    this.simulationSpeed = 1;
    this.currentTick = 0;
    this.ticksPerDay = 720;
    this.animationFrameId = null;
    this.beeCounter = 0;
    this.flowerCounter = 0;

    // Колония пчел
    this.bees = [];
    this.queen = new Queen(0);
    this.eggs = [];
    this.larvae = [];
    this.pupae = [];
    this.flowers = [];
    this.logEntries = [];
    this.activeForagers = [];
    this.activeReceptionists = [];
    this.processingNectar = [];
    this.honeyProductionTime = 720;
    this.hivePosition = { x: 520, y: 600 };

    // Ресурсы
    this.resourcePiles = {
      nectar: { x: 45, y: 70, amount: 0 },
      pollen: { x: 55, y: 70, amount: 0 },
      honey: { x: 65, y: 70, amount: 0 }
    };

    // Стадии развития
    this.DEVELOPMENT_STAGES = {
      EGG: { duration: 3 },
      LARVA: { duration: 6 },
      PUPA: { duration: 12 }
    };
  }

  // Создаем пчел по ролям
  createBee(role, age) {
    const newBee = new Bee(
      this.beeCounter++,
      role,
      age,
      Math.random() * 1000,
      Math.random() * 600
    );
    // Замените this.bees.push(newBee) на:
    this.bees = [...this.bees, newBee];
    this.logEvent(`Добавлена новая пчела (${role})`);
  }
  applyInitialSettings(settings) {
    // Сначала сбрасываем симуляцию
    this.resetSimulation();

    // Устанавливаем ресурсы
    this.resourcePiles.nectar.amount = settings.nectar;
    this.resourcePiles.pollen.amount = settings.pollen;
    this.resourcePiles.honey.amount = settings.honey;


    // Кормилицы (возраст 0 дней)
    for (let i = 0; i < settings.nurses; i++) {
      this.createBee('nurse', 0);
    }

    // Приёмщицы (возраст 10 дней)
    for (let i = 0; i < settings.receptionists; i++) {
      this.createBee('receptionist', 10);
    }

    // Сборщицы (возраст 20 дней)
    for (let i = 0; i < settings.foragers; i++) {
      this.createBee('forager', 20);
    }

    // Создаем цветы
    for (let i = 0; i < settings.flowers; i++) {
      this.addFlower();
    }

    // Создаем яйца
    for (let i = 0; i < settings.eggs; i++) {
      const newEgg = this.queen.layEgg();
      this.eggs.push(newEgg);
      this.logEvent('Матка отложила новое яйцо');
    }

    // Создаем личинки
    for (let i = 0; i < settings.larvae; i++) {
      this.larvae.push(new Larva(
        Date.now() + i,
        {
          x: this.queen.position.x + (Math.random() * 200 + 50),
          y: this.queen.position.y + (Math.random() * 200 + 50)
        }
      ));
    }

    // Создаем куколки
    for (let i = 0; i < settings.pupae; i++) {
      this.pupae.push(new Pupa(
        Date.now() + i + 1000,
        {
          x: this.queen.position.x + (Math.random() * 200 + 50),
          y: this.queen.position.y + (Math.random() * 200 + 50)
        }
      ));
    }

    this.logEvent('Применены начальные настройки');
  }

  // Основной цикл симуляции
  simulationLoop() {
    if (!this.isRunning) return;
    this.simulationTick();

    const delay = Math.max(1000 / (10 * this.simulationSpeed), 16);
    this.animationFrameId = setTimeout(() => this.simulationLoop(), delay);
  }

  // Один тик симуляции
  simulationTick() {
    this.currentTick++;
    this.checkQueenEggLaying();
    this.checkBeesAge();
    this.feedBees();
    this.assignNurseTasks();
    // Обработка нектара
    this.processingNectar = this.processingNectar.filter(item => {
      const elapsedTicks = (this.day - item.startDay) * this.ticksPerDay +
        (this.currentTick - item.startTick);

      if (elapsedTicks >= this.honeyProductionTime) {
        const bee = this.bees.find(b => b.id === item.beeId);
        if (bee) {
          bee.state = 'flying_to_honey';
          bee.target = { x: 650, y: 600 };
        }
        return false;
      }
      return true;
    });

    if (this.timeOfDay != 'ночь' && this.currentTick % 10 === 0) {
      this.sendForagers();
    }

    this.updateBeePositions();
    this.sendReceptionists();

    this.bees.forEach(bee => {
      if ((bee.state === 'in_hive' || bee.state === 'processing')) {
        this.assignRandomMovement(bee);
        this.updateRandomMovement(bee);
      }
    });

    this.updateBeeRoles();

    if (this.currentTick % (720 / 4) === 0) {
      this.updateTimeOfDay();
    }

    if (this.currentTick >= this.ticksPerDay) {
      this.endDay();
    }
  }

  // В класс Simulation добавьте этот метод
  changeSimulationSpeed(factor) {
    // Ограничиваем диапазон скоростей от 0.5x до 10x
    this.simulationSpeed = factor;

    // Если симуляция запущена, перезапускаем цикл с новой скоростью
    if (this.isRunning) {
      if (this.animationFrameId) {
        clearTimeout(this.animationFrameId);
      }
      this.simulationLoop();
    }

    this.logEvent(`Скорость симуляции изменена на ${this.simulationSpeed}x`);
  }

  // Все остальные методы сохраняются с теми же названиями
  updateTimeOfDay() {
    const times = ['утро', 'день', 'вечер', 'ночь'];
    const currentIndex = times.indexOf(this.timeOfDay);
    this.timeOfDay = times[(currentIndex + 1) % times.length];
    this.logEvent(`Время суток: ${this.timeOfDay}`);
  }

  endDay() {
    this.day++;
    this.currentTick = 0;
    this.feedBees();
    // Обновляем голод пчел
    this.bees.forEach(bee => {
      if (bee.honeyEaten < 3 || bee.pollenEaten < 3) {
        bee.hunger++;
        if (bee.hunger >= 2) {
          this.logEvent(`Пчела #${bee.id} умерла от голода`);
          return; // Помечаем для удаления
        }
      } else {
        bee.hunger = 0; // Сбрасываем, если пчела поела
      }
      bee.honeyEaten = 0;
      bee.pollenEaten = 0;
      return true; // Оставляем пчелу
    });

    // Удаляем умерших от голода пчел
    this.bees = this.bees.filter(bee => bee.hunger < 2);

    // Обновляем возраст всех существ
    this.queen.age++;
    this.bees.forEach(bee => bee.age++);
    this.eggs.forEach(egg => egg.age++);
    this.larvae.forEach(larva => {
      larva.age++;
      larva.updateFoodType();
    });
    this.pupae.forEach(pupa => pupa.age++);
    this.flowers.forEach(flower => flower.ageOneDay());
    this.removeDeadLarvae();
    this.checkFlowers();
    this.updateDevelopment();
    // Очищаем список посещенных цветов у всех пчел
    this.bees.forEach(bee => {
      bee.visitedFlowersToday = [];
    });
  }

  assignRandomMovement(bee) {
    if (!bee.randomTarget) {
      bee.randomTarget = {
        x: Math.random() * 1000,
        y: Math.random() * 600,
        speed: 1
      };
    }
  }

  checkFlowers() {
    // Удаляем старые цветы
    this.flowers = this.flowers.filter(flower => {
      if (flower.age >= 10 && Math.random() < 0.3) {
        return false;
      }
      return true;
    });

    this.flowers.forEach(flower => {
      if (flower.pollen === 0 && flower.nectar === 0)
        flower.resetResources;
    });

    // Добавляем новые случайные цветы
    if (Math.random() < 0.6) {
      this.addFlower();
    }
  }
  updateRandomMovement(bee) {
    if (!bee.randomTarget) return;

    const dx = bee.randomTarget.x - bee.x;
    const dy = bee.randomTarget.y - bee.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 2) {
      bee.randomTarget = null;
    } else {
      bee.x += (dx / distance) * bee.randomTarget.speed;
      bee.y += (dy / distance) * bee.randomTarget.speed;
    }
  }

  checkQueenEggLaying() {
    if (Math.random() < 0.003) {
      const newEgg = this.queen.layEgg();
      this.eggs.push(newEgg);
      this.logEvent('Матка отложила новое яйцо');
    }
  }

  updateDevelopment() {
    // Обновляем яйца
    this.eggs = this.eggs.filter(egg => {
      if (egg.age > this.DEVELOPMENT_STAGES.EGG.duration) {
        this.larvae.push(new Larva(
          egg.id,
          egg.position
        ));
        return false;
      }
      return true;
    });

    // Обновляем личинок
    this.larvae = this.larvae.filter(larva => {
      if (larva.age > 6 && larva.foodType === 'ROYAL_JELLY') {
        larva.foodType = 'HONEY_POLLEN';
      }

      if (larva.age > this.DEVELOPMENT_STAGES.EGG.duration + this.DEVELOPMENT_STAGES.LARVA.duration) {
        this.pupae.push(new Pupa(
          larva.id,
          larva.position
        ));
        return false;
      }
      return true;
    });

    // Обновляем куколок
    this.pupae = this.pupae.filter(pupa => {
      if (pupa.age > this.DEVELOPMENT_STAGES.EGG.duration +
        this.DEVELOPMENT_STAGES.LARVA.duration +
        this.DEVELOPMENT_STAGES.PUPA.duration) {
        this.addWorkerBee(pupa.position);
        return false;
      }
      return true;
    });
  }

  addWorkerBee(position) {
    const newBee = new Bee(
      this.beeCounter++,
      'nurse',
      0,
      position.x,
      position.y
    );

    this.bees.push(newBee);
    this.logEvent('Вывелась новая пчела из куколки');
  }

  assignNurseTasks() {
    this.feedBees();
    const nurses = this.bees.filter(b => b.role === 'nurse' && b.state === 'in_hive');
    const hungryLarvae = this.larvae.filter(l => l.status === 'hungry');

    nurses.forEach((nurse, i) => {
      if (i < hungryLarvae.length) {
        nurse.assignToLarva(hungryLarvae[i]);
      }
    });
  }

  updateFeeding(bee) {
    // Если только начали кормить - запоминаем текущее время
    if (bee.state !== 'feeding_larva') {
      bee.state = 'feeding_larva';
      bee.feedingStartTime = this.currentTick; // Запоминаем время начала кормления
      bee.feedingDuration = 100; // Длительность кормления в тиках (можно настроить)
      return;
    }

    const larva = this.larvae.find(l => l.id === bee.target.id);
    if (!larva) {
      bee.state = 'in_hive';
      bee.target = null;
      return;
    }

    // Проверяем, прошло ли достаточно времени
    if (this.currentTick - bee.feedingStartTime < bee.feedingDuration) {
      return; // Ждём пока не пройдёт время кормления
    }

    // Процесс кормления
    if (this.resourcePiles.honey.amount > 0 && larva.honey === 0) {
      this.resourcePiles.honey.amount -= bee.carrying.honey;
      larva.honey = 1;
    }
    if (this.resourcePiles.pollen.amount > 0 && larva.pollen === 0) {
      this.resourcePiles.pollen.amount -= bee.carrying.pollen;
      larva.pollen = 1;
    }

    if (larva.honey && larva.pollen) {
      larva.status = 'fed';
    }

    bee.carrying.honey = 0;
    bee.carrying.pollen = 0;
    bee.carrying.jelly = 0;

    if (larva.age === 6 && larva.foodType === 'ROYAL_JELLY') {
      larva.foodType = 'HONEY_POLLEN';
    }

    // Завершаем кормление
    bee.state = 'in_hive';
    bee.target = null;
    delete bee.feedingStartTime;
    delete bee.feedingDuration;
  }

  addFlower() {
    const fieldWidth = 1000;
    const fieldHeight = 840;

    this.flowers.push(new Flower(
      Math.random() * fieldWidth + 20,
      Math.random() * fieldHeight + 40,
      this.flowerCounter
    ));
    this.flowerCounter++;
    this.logEvent('На поляне вырос новый цветок');
  }

  randomFlower() {
    if (Math.random() < 0.6) {
      this.addFlower();
    }
  }

  checkFlowersAge() {
    const FlowersToRemove = [];

    this.flowers.forEach((flower, index) => {
      if (flower.age >= 10 && Math.random() < 0.3) {
        FlowersToRemove.push(index);
      }
    });

    FlowersToRemove.reverse().forEach(index => {
      this.flowers.splice(index, 1)[0];
    });
  }

  updateFlowersAge() {
    this.flowers.forEach(flower => {
      flower.age += 1;
    });
  }

  startSimulation() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.logEvent('Симуляция начата');
    this.simulationLoop();
  }

  pauseSimulation() {
    this.isRunning = false;
    this.logEvent('Симуляция на паузе');
  }

  resetSimulation() {
    this.isRunning = false;
    this.day = 0;
    this.timeOfDay = 'утро';
    this.resourcePiles.nectar.amount = 0;
    this.resourcePiles.pollen.amount = 0;
    this.resourcePiles.honey.amount = 0;
    this.beeCounter = 0;
    this.flowerCounter = 0;
    this.logEntries = [];
    this.activeForagers = [];
    this.bees = [];
    this.eggs = [];
    this.larvae = [];
    this.pupae = [];
    this.flowers = [];
    this.activeReceptionists = [];
    this.processingNectar = [];
    this.logEvent('Симуляция сброшена');
  }

  changeSpeed(speed) {
    this.simulationSpeed = speed;
    this.logEvent(`Скорость симуляции изменена на ${speed}x`);
  }

  addWorker() {
    const newBee = new Bee(
      this.beeCounter++,
      'nurse',
      0,
      Math.random() * 1000,
      Math.random() * 600
    );

    this.bees.push(newBee);
    this.logEvent('Добавлена новая рабочая пчела');
  }

  sendForagers() {
    this.feedBees();
    const availableForagers = this.bees.filter(
      bee => bee.role === 'forager' && bee.state === 'in_hive'
    );

    availableForagers.forEach(bee => {
      // Сначала проверяем известные цветы, которые еще не посещали сегодня
      const unvisitedKnownFlowers = bee.knownFlowers.filter(flower =>
        !bee.visitedFlowersToday.includes(flower) &&
        (flower.nectar > 0 || flower.pollen > 0) && flower.collectingBee === 0
      );

      if (unvisitedKnownFlowers.length > 0) {
        // Выбираем случайный из непосещенных известных цветов
        const randomIndex = Math.floor(Math.random() * unvisitedKnownFlowers.length);
        bee.target = unvisitedKnownFlowers[randomIndex];
        bee.target.collectingBee = 1;
        bee.state = 'flying_to_flower';
        this.activeForagers.push(bee);
        this.logEvent(`Пчела #${bee.id} летит к известному цветку`);
        return;
      }

      // Если известных непосещенных цветов нет - начинаем поиск
      bee.state = 'searching_flowers';
      bee.searchTarget = {
        x: 1200,
        y: bee.y
      };
      this.logEvent(`Пчела #${bee.id} вылетела на поиск цветов`);
    });
  }

  updateBeePositions() {
    this.bees.forEach(bee => {
      switch (bee.state) {
        case 'searching_flowers':
          if (this.timeOfDay === 'ночь') {
            bee.state = "flying_to_hive"
          }
          else {
            // Ищем непосещенные цветы в радиусе обзора
            const nearbyFlowers = this.flowers.filter(flower => {
              const dx = flower.x + 1090 - bee.x;
              const dy = flower.y - 90 - bee.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              return distance <= bee.searchRadius &&
                !bee.visitedFlowersToday.includes(flower) && flower.collectingBee === 0
            });

            if (nearbyFlowers.length > 0) {
              // Нашли непосещенный цветок - проверяем его
              const flower = nearbyFlowers[0];
              bee.target = flower;
              bee.target.collectingBee = 1;
              bee.state = 'checking_flower';
            } else if (bee.moveTo(bee.searchTarget.x, bee.searchTarget.y)) {
              // Не нашли - летим дальше
              const newX = 1200 + (Math.random() * 1000);
              const newY = (Math.random() * 840 - 40);
              bee.searchTarget = {
                x: newX,
                y: newY
              };
            }
          }
          break;

        case 'checking_flower':
          if (bee.moveTo(bee.target.x + 1090, bee.target.y - 90)) {
            bee.visitedFlowersToday.push(bee.target); // Добавляем в посещенные сегодня
            if (bee.target.nectar > 0 || bee.target.pollen > 0) {
              // В цветке есть ресурсы - запоминаем его и собираем
              if (!bee.knownFlowers.includes(bee.target)) {
                bee.knownFlowers.push(bee.target);
              }
              bee.state = 'collecting';
              bee.collectFrom(bee.target);
              bee.state = 'flying_to_hive';
              bee.target.collectingBee = 0;

            } else {
              bee.state = 'searching_flowers';
              bee.target.collectingBee = 0;
              const newX = 1200 + (Math.random() * 1000);
              const newY = (Math.random() * 840 - 40);
              bee.searchTarget = {
                x: newX,
                y: newY
              };
            }
          }
          break;

        case 'flying_to_flower':
          if (bee.moveTo(bee.target.x + 1090, bee.target.y - 90)) {
            const flowerStillExists = this.flowers.some(f => f.id === bee.target.id);
            if ((bee.target.nectar > 0 || bee.target.pollen > 0) && flowerStillExists) {
              // Цветок все еще содержит ресурсы - собираем
              bee.visitedFlowersToday.push(bee.target); // Добавляем в посещенные сегодня
              bee.state = 'collecting';
              bee.collectFrom(bee.target);
              bee.state = 'flying_to_hive';
              bee.target.collectingBee = 0;
            } else {
              bee.target.collectingBee = 0;
              // Цветка нет - удаляем из памяти и начинаем поиск
              if (!flowerStillExists) {
                bee.knownFlowers = bee.knownFlowers.filter(f => f.id !== bee.target.id);
                bee.state = 'in_hive';
              }
              if (bee.knownFlowers.length === bee.visitedFlowersToday.length) {
                bee.state = 'searching_flowers';
                const newX = 1200 + (Math.random() * 1000);
                const newY = (Math.random() * 840 - 40);
                bee.searchTarget = {
                  x: newX,
                  y: newY
                };
              }
            }
          }
          break;

        case 'flying_to_hive':
          if (bee.moveTo(this.hivePosition.x, this.hivePosition.y)) {
            bee.deliverTo(this.resourcePiles);
            bee.state = 'in_hive';
            this.activeForagers = this.activeForagers.filter(b => b.id !== bee.id);
          }
          break;

        case 'flying_to_honey':
          if (bee.moveTo(bee.target.x, bee.target.y)) {
            const honeyProduced = Math.floor(bee.carrying.nectar / 2);
            this.resourcePiles.honey.amount += honeyProduced;
            bee.carrying.nectar = 0;
            bee.state = 'in_hive';
            bee.target = null;
            this.logEvent(`Приёмщица #${bee.id} произвела ${honeyProduced} мёда`);
          }
          break;

        case 'flying_to_nectar':
          if (bee.moveTo(bee.target.x, bee.target.y)) {
            this.resourcePiles.nectar.amount -= bee.carrying.nectar;
            this.activeReceptionists = this.activeReceptionists.filter(b => b.id !== bee.id);
            this.processingNectar.push({
              amount: bee.carrying.nectar,
              startDay: this.day,
              startTick: this.currentTick,
              beeId: bee.id
            });
            bee.state = 'processing';
            this.logEvent(`Приёмщица #${bee.id} взяла ${bee.carrying.nectar} нектара на переработку`);
          }
          break;

        case 'flying_to_larva':
          if (bee.moveTo(bee.target.position.x - 5, bee.target.position.y - 90)) {
            this.updateFeeding(bee);
          }
          break;

        case 'feeding_larva':
          // Пчела остаётся на месте и кормит личинку
          this.updateFeeding(bee);
          break;
      }
    });
  }

  feedBees() {
    this.bees.forEach(bee => {

      // Если пчела в улье и еще не поела сегодня
      if (bee.state === 'in_hive' && (bee.honeyEaten < 3 || bee.pollenEaten < 3)) {
        // Пытаемся поесть меда
        if (bee.honeyEaten < 3 && this.resourcePiles.honey.amount > 0) {
          const neededHoney = Math.min(3 - bee.honeyEaten, this.resourcePiles.honey.amount);
          this.resourcePiles.honey.amount -= neededHoney;
          bee.honeyEaten += neededHoney;
        }

        // Пытаемся поесть пыльцы
        if (bee.pollenEaten < 3 && this.resourcePiles.pollen.amount > 0) {
          const neededPollen = Math.min(3 - bee.pollenEaten, this.resourcePiles.pollen.amount);
          this.resourcePiles.pollen.amount -= neededPollen;
          bee.pollenEaten += neededPollen;
        }
      }
    });
  }

  // Вспомогательный метод для логирования
  logEvent(message) {
    this.logEntries.unshift({
      day: this.day,
      message
    });
  }

  removeDeadLarvae() {
    const deadLarvaeIndices = this.larvae
      .map((larva, index) => ({ larva, index }))
      .filter(({ larva }) => larva.status === 'hungry')
      .map(({ index }) => index);

    deadLarvaeIndices.reverse().forEach(index => {
      this.larvae.splice(index, 1);
      this.logEvent('Личинка погибла от голода');
    });

    // Сбрасываем статус оставшихся личинок
    this.larvae.forEach(larva => {
      if (larva.status !== 'hungry') {
        larva.status = 'hungry';
      }
    });
  }

  collectResources(bee) {
    bee.carrying.nectar = bee.target.nectar;
    bee.carrying.pollen = bee.target.pollen;
    bee.target.nectar = 0;
    bee.target.pollen = 0;
    bee.target.collectingBee = null;

    this.logEvent(`Пчела #${bee.id} собрала ${bee.carrying.nectar} нектара и ${bee.carrying.pollen} пыльцы`);
    bee.state = 'flying_to_hive';
  }

  deliverResources(bee) {
    if (bee.carrying.nectar > 0) {
      this.resourcePiles.nectar.amount += bee.carrying.nectar;
    }
    if (bee.carrying.pollen > 0) {
      this.resourcePiles.pollen.amount += bee.carrying.pollen;
    }

    this.logEvent(`Пчела #${bee.id} доставила ${bee.carrying.nectar} нектара и ${bee.carrying.pollen} пыльцы в улей`);

    this.activeForagers = this.activeForagers.filter(b => b.id !== bee.id);
    bee.carrying = { nectar: 0, pollen: 0 };
    bee.state = 'in_hive';
    bee.target = null;
  }

  getBeeRole(age) {
    if (age < 10) return 'nurse';
    else if (age < 20) return 'receptionist'
    else return 'forager';
  }

  updateBeeRoles() {
    this.bees.forEach(bee => {
      if (bee.state === 'in_hive') {
        bee.role = this.getBeeRole(bee.age);
      }
    });
  }

  sendReceptionists() {
    this.bees.forEach(bee => {
      if (bee.role === 'receptionist' && bee.state === 'in_hive') {
        this.assignReceptionistTask(bee);
      }
    });
  }

  assignReceptionistTask(bee) {
    this.feedBees();
    if (this.resourcePiles.nectar.amount - this.activeReceptionists.length * 10 > 0) {
      const amountToTake = Math.min(10, this.resourcePiles.nectar.amount - this.activeReceptionists.length * 10);
      bee.state = 'flying_to_nectar';
      this.activeReceptionists.push(bee);
      bee.carrying.nectar = amountToTake;
      bee.target = { x: 500, y: 600 };
    }
  }

  checkBeesAge() {
    const beesToRemove = [];

    this.bees.forEach((bee, index) => {
      if (bee.age >= 30 && Math.random() < 0.3 && bee.state === 'in_hive') {
        beesToRemove.push(index);
      }
    });

    beesToRemove.reverse().forEach(index => {
      const deadBee = this.bees.splice(index, 1)[0];
      this.logEvent(`Пчела #${deadBee.id} умерла в возрасте ${deadBee.age} дней`);
    });
  }

  // Вычисляемые свойства
  get nurseCount() {
    return this.bees.filter(b => b.role === 'nurse').length;
  }

  get receptionistsCount() {
    return this.bees.filter(b => b.role === 'receptionist').length;
  }

  get foragersCount() {
    return this.bees.filter(b => b.role === 'forager').length;
  }
}