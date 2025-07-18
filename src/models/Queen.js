import { Egg } from './Development.js';

export class Queen {
  constructor(id) {
    this.id = id;                 // Уникальный идентификатор матки
    this.age = 0;                 // Возраст матки в днях
    this.position = { x: 70, y: 100 };  // Позиция матки в улье (координаты)
    this.eggLayingChance = 0.003; // Вероятность откладки яйца при каждом обновлении (0.3%)
  }

  // Метод попытки отложить яйцо
  tryLayEgg(simulation) {
    if (Math.random() < this.eggLayingChance) {
      // Создаём новое яйцо
      const newEgg = this.layEgg();
      // Добавляем яйцо в симуляцию
      simulation.eggs.push(newEgg);
      simulation.logEvent('Матка отложила новое яйцо');
      return newEgg;  // Возвращаем созданное яйцо
    }
    return null;  // Если яйцо не отложено, возвращаем null
  }

  // Метод создания нового яйца
  layEgg() {
    // Создаём новое яйцо с:
    return new Egg(
      Date.now(),  // Уникальный ID на основе текущего времени
      {
        // Позиция рядом с маткой
        x: this.position.x + (Math.random() * 200 + 50),
        y: this.position.y + (Math.random() * 200 + 50)
      }
    );
  }
}


