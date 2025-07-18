export class Bee {
  constructor(id, role, age, x, y) {
    this.id = id;               // Уникальный идентификатор пчелы
    this.role = role;           // Роль пчелы (например, сборщица, нянька и т.д.)
    this.age = age;             // Возраст пчелы в днях
    this.old = 30;              // Максимальный возраст пчелы (30 дней)
    this.x = x;                 // Координата X текущего положения
    this.y = y;                 // Координата Y текущего положения
    this.baseSpeed = 15;        // Базовая скорость перемещения
    this.target = null;         // Текущая цель пчелы (может быть цветок, личинка и т.д.)
    this.carrying = {           // Ресурсы, которые несет пчела
      nectar: 0,
      pollen: 0,
      honey: 0
    };
    this.state = 'in_hive';     // Текущее состояние пчелы (в улье, летит к цветку и т.д.)
    this.randomTarget = null;   // Случайная цель для свободного перемещения
    this.knownFlowers = [];     // Массив известных пчеле цветов (кэш местоположений)
    this.searchRadius = 200;    // Радиус, в котором пчела ищет цветы
    this.visitedFlowersToday = []; // Цветы, посещенные сегодня (чтобы избежать повторных посещений)
    this.hunger = 0;            // Дни без еды (0-2)
    this.honeyEaten = 0;        // Количество съеденного мёда сегодня
    this.pollenEaten = 0;       // Количество съеденной пыльцы сегодня
  }

  // Метод для перемещения пчелы к указанным координатам
  moveTo(targetX, targetY) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy); // Расстояние до цели

    // Если пчела уже у цели 
    if (distance < 1) {
      return true;
    }

    // Нормализация направления (получаем единичный вектор направления)
    const directionX = dx / distance;
    const directionY = dy / distance;

    // Динамическое замедление при приближении
    const slowDownRadius = 150;  // Радиус начала замедления
    let speed = this.baseSpeed;  // Начинаем с базовой скорости

    // Плавное уменьшение скорости при приближении
    if (distance < slowDownRadius) {
      speed = this.baseSpeed * (distance / slowDownRadius);
      speed = Math.max(0.5, speed); // Минимальная скорость 0.5
    }

    // Перемещение пчелы
    this.x += directionX * speed;
    this.y += directionY * speed;

    return false;  // Возвращает false, если не достигла цели
  }

  // Назначение случайной цели для свободного перемещения
  assignRandomMovement() {
    if (!this.randomTarget) {
      this.randomTarget = {
        x: Math.random() * 1000,  // Случайная координата X (0-1000)
        y: Math.random() * 600,   // Случайная координата Y (0-600)
        speed: 1                  // Скорость перемещения к случайной цели
      };
    }
  }

  // Обновление позиции при случайном перемещении
  updateRandomMovement() {
    if (!this.randomTarget) return;  // Если нет цели, выходим

    const dx = this.randomTarget.x - this.x;
    const dy = this.randomTarget.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 2) {
      this.randomTarget = null;  // Если достигли цели, сбрасываем
    } else {
      // Перемещаемся к цели с заданной скоростью
      this.x += (dx / distance) * this.randomTarget.speed;
      this.y += (dy / distance) * this.randomTarget.speed;
    }
  }

  // Назначение пчелы для ухода за личинкой
  assignToLarva(larva) {
    this.target = {
      id: larva.id,
      position: larva.position
    };
    this.state = 'flying_to_larva';  // Меняем состояние
    larva.status = 'assigned';       // Помечаем личинку как назначенную

    // В зависимости от типа пищи личинки берем соответствующие ресурсы
    this.carrying = larva.foodType === 'ROYAL_JELLY'
      ? { honey: 0, pollen: 0, jelly: 1 }  // Для королевского молочка
      : { honey: 1, pollen: 1, jelly: 0 }; // Для обычной пищи
  }

  // Переработка нектара в мед
  processNectar(hiveResources) {
    const honeyProduced = Math.floor(this.carrying.nectar / 2); // 2 нектара = 1 мед
    hiveResources.honey.amount += honeyProduced;  // Добавляем мед в ресурсы улья
    this.carrying.nectar = 0;  // Обнуляем переносимый нектар
    return honeyProduced;      // Возвращаем количество произведенного меда
  }

  // Сбор ресурсов с цветка
  collectFrom(simulation, flower) {
    this.carrying = {
      nectar: flower.nectar,
      pollen: flower.pollen
    };

    // Очищаем цветок
    flower.nectar = 0;
    flower.pollen = 0;
    flower.collectingBee = null;

    simulation.logEvent(`Пчела #${this.id} собрала ${this.carrying.nectar} нектара и ${this.carrying.pollen} пыльцы`);
    this.state = 'flying_to_hive';  // Меняем состояние на "летит в улей"
  }

  // Доставка ресурсов в улей
  deliverTo(simulation, resourcePiles) {
    if (this.carrying.nectar > 0) {
      resourcePiles.nectar.amount += this.carrying.nectar;
    }
    if (this.carrying.pollen > 0) {
      resourcePiles.pollen.amount += this.carrying.pollen;
    }
    simulation.logEvent(`Пчела #${this.id} доставила ${this.carrying.nectar} нектара и ${this.carrying.pollen} пыльцы в улей`);
    this.carrying = { nectar: 0, pollen: 0 };  // Обнуляем переносимые ресурсы
    this.state = 'in_hive';                   // Возвращаемся в состояние "в улье" 
  }
}


