import { Bee } from './Bee.js';
import { Queen } from './Queen.js';
import { Egg, Larva, Pupa } from './Development.js';
import { Flower } from './Flower.js';

export class Simulation {
  constructor() {
    // Состояние симуляции
    this.day = 0;
    this.timeOfDay = 'утро';
    this.season = 'весна';
    this.isRunning = false;
    this.simulationSpeed = 1;
    this.currentTick = 0;
    this.ticksPerDay = 240;
    this.animationFrameId = null;
    this.beeCounter = 0;

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
    this.honeyProductionTime = 240;
    this.hivePosition = { x: 520, y: 600 };

    // Ресурсы
    this.resourcePiles = {
      nectar: { x: 45, y: 70, amount: 29 },
      pollen: { x: 55, y: 70, amount: 0 },
      honey: { x: 65, y: 70, amount: 0 }
    };

    // Стадии развития
    this.DEVELOPMENT_STAGES = {
      EGG: { duration: 3, next: 'LARVA' },
      LARVA: { duration: 6, next: 'PUPA' },
      PUPA: { duration: 12, next: 'ADULT' }
    };
  }

applyInitialSettings(settings) {
  // Сначала сбрасываем симуляцию
  this.resetSimulation();

  // Устанавливаем ресурсы
  this.resourcePiles.nectar.amount = settings.nectar;
  this.resourcePiles.pollen.amount = settings.pollen;
  this.resourcePiles.honey.amount = settings.honey;

  // Создаем пчел по ролям
  const createBee = (role, age) => {
    return new Bee(
      this.beeCounter++,
      role,
      age,
      Math.random() * 1000,
      Math.random() * 600
    );
  };

  // Кормилицы (возраст 0 дней
  for (let i = 0; i < settings.nurses; i++) {
    this.bees.push(createBee('nurse', 0));
  }

  // Приёмщицы (возраст 10 дней)
  for (let i = 0; i < settings.receptionists; i++) {
    this.bees.push(createBee('receptionist', 10));
  }

  // Сборщицы (возраст 20 дней)
  for (let i = 0; i < settings.foragers; i++) {
    this.bees.push(createBee('forager', 20));
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
      if (bee.state === 'in_hive' && !bee.target) {
        this.assignRandomMovement(bee);
        this.updateRandomMovement(bee);
      }
    });

    this.updateBeeRoles();

    if (this.currentTick % 120 === 0) {
      this.updateTimeOfDay();
    }

    if (this.currentTick >= this.ticksPerDay) {
      this.endDay();
    }
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

  // Добавляем новые случайные цветы
  if (Math.random() < 0.3) {
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

  initFlowers() {
    const fieldWidth = 1000;
    const fieldHeight = 700;

    for (let i = 0; i < 7; i++) {
      this.flowers.push(new Flower(
        Math.random() * fieldWidth + 20,
        Math.random() * fieldHeight + 40
      ));
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
  const nurses = this.bees.filter(b => b.role === 'nurse' && b.state === 'in_hive');
  const hungryLarvae = this.larvae.filter(l => l.status === 'hungry');

  nurses.forEach((nurse, i) => {
    if (i < hungryLarvae.length) {
      nurse.assignToLarva(hungryLarvae[i]);
    }
  });
}
  updateFeeding(bee) {
    bee.state = 'feeding_larva';
    const larva = this.larvae.find(l => l.id === bee.target.id);
    if (larva) {
      larva.status = 'fed';
      this.resourcePiles.nectar.amount -= bee.carrying.nectar;
      this.resourcePiles.pollen.amount -= bee.carrying.pollen;

      if (larva.age === 6 && larva.foodType === 'ROYAL_JELLY') {
        larva.foodType = 'HONEY_POLLEN';
      }

      bee.state = 'in_hive';
      bee.target = null;
    }
  }

  initBees() {
    this.beeCounter = 0;
    for (let i = 0; i < 1; i++) {
      this.addWorker();
    }
  }

  addFlower() {
    const fieldWidth = 1000;
    const fieldHeight = 700;

    this.flowers.push(new Flower(
      Math.random() * fieldWidth + 20,
      Math.random() * fieldHeight + 40
    ));

    this.logEvent('На поляне вырос новый цветок');
  }

  randomFlower() {
    if (Math.random() < 0.3) {
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
    this.season = 'весна';
    this.resourcePiles.nectar.amount = 0;
    this.resourcePiles.pollen.amount = 0;
    this.resourcePiles.honey.amount = 0;
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
    const availableForagers = this.bees.filter(
      bee => bee.role === 'forager' && bee.state === 'in_hive'
    );

    const availableFlowers = this.flowers.filter(
      flower => (flower.nectar > 0 || flower.pollen > 0) && !flower.collectingBee
    );

    availableForagers.forEach((bee, index) => {
      if (index < availableFlowers.length) {
        bee.target = availableFlowers[index];
        bee.target.collectingBee = 1;
        bee.state = 'flying_to_flower';
        this.activeForagers.push(bee);
        this.logEvent(`Пчела #${bee.id} вылетела к цветку`);
      }
    });
  }

 updateBeePositions() {
  this.bees.forEach(bee => {
    switch (bee.state) {
      case 'flying_to_flower':
        if (bee.moveTo(bee.target.x + 1100, bee.target.y - 90)) {
          bee.state = 'collecting';
          bee.collectFrom(bee.target);
          bee.state = 'flying_to_hive';
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

  updateBeesAge() {
    this.queen.age++;
    this.bees.forEach(bee => bee.age += 1);
    this.eggs.forEach(egg => egg.age += 1);
    this.larvae.forEach(larva => larva.age += 1);
    this.pupae.forEach(pupa => pupa.age += 1);
  }

  getBeeRole(age) {
    if (age < 20) return 'nurse';
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
      if (bee.age >= 25 && Math.random() < 0.3) {
        beesToRemove.push(index);
      }
    });

    beesToRemove.reverse().forEach(index => {
      const deadBee = this.bees.splice(index, 1)[0];
      this.logEvent(`Пчела #${deadBee.id} умерла в возрасте ${deadBee.age} дней`);
    });
  }

  // Вычисляемые свойства
  get queenCount() {
    return this.bees.filter(b => b.type === 'queen').length;
  }

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