export class Bee {
  constructor(id, role, age, x, y) {
    this.id = id;
    this.role = role;
    this.age = age;
    this.x = x;
    this.y = y;
    this.target = null;
    this.carrying = { nectar: 0, pollen: 0, honey: 0 };
    this.state = 'in_hive';
    this.randomTarget = null;
    this.knownFlowers = []; // Массив известных цветов
    this.searchRadius = 200; // Радиус обзора пчелы
    this.visitedFlowersToday = []; // Цветы, посещенные сегодня
    this.hunger = 0; // Дни без еды (0-2)
    this.honeyEaten = 0; // Мёд съеденный сегодня
    this.pollenEaten = 0; // Пыльца съеденная сегодня
  }


  moveTo(targetX, targetY, baseSpeed = 10) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Если пчела уже у цели (порог можно настроить)
    if (distance < 1) {
      return true;
    }

    // Нормализация направления
    const directionX = dx / distance;
    const directionY = dy / distance;

    // Динамическое замедление при приближении
    const slowDownRadius = 150;
    let speed = baseSpeed;

    if (distance < slowDownRadius) {
      // Плавное уменьшение скорости (можно изменить формулу)
      speed = baseSpeed * (distance / slowDownRadius);
      speed = Math.max(0.5, speed); // Минимальная скорость
    }

    // Перемещение
    this.x += directionX * speed;
    this.y += directionY * speed;

    return false;
  }

  assignToLarva(larva) {
    this.target = {
      id: larva.id,
      position: larva.position
    };
    this.state = 'flying_to_larva';
    larva.status = 'assigned';
    this.carrying = larva.foodType === 'ROYAL_JELLY'
      ? { honey: 0, pollen: 0, jelly: 1 }
      : { honey: 1, pollen: 1, jelly: 0 };
  }

  processNectar(hiveResources) {
    const honeyProduced = Math.floor(this.carrying.nectar / 2);
    hiveResources.honey.amount += honeyProduced;
    this.carrying.nectar = 0;
    return honeyProduced;
  }

  collectFrom(flower) {
    this.carrying = {
      nectar: flower.nectar,
      pollen: flower.pollen
    };
    flower.nectar = 0;
    flower.pollen = 0;
    flower.collectingBee = null;
  }

  deliverTo(resourcePiles) {
    if (this.carrying.nectar > 0) {
      resourcePiles.nectar.amount += this.carrying.nectar;
    }
    if (this.carrying.pollen > 0) {
      resourcePiles.pollen.amount += this.carrying.pollen;
    }
    this.carrying = { nectar: 0, pollen: 0 };
  }
}