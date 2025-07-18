export class Egg {
  constructor(id, position) {
    this.id = id;           // Уникальный идентификатор яйца
    this.age = 0;           // Возраст яйца в днях (начинается с 0)
    this.duration = 3;      // Продолжительность стадии яйца (3 дня)
    this.position = position; // Позиция яйца в улье {x, y}
  }
}

export class Larva {
  constructor(id, position) {
    this.id = id;           // Уникальный идентификатор личинки
    this.age = 3;           // Возраст личинки в днях (начинается с 3)
    this.duration = 6;      // Продолжительность стадии личинки (6 дней)
    this.position = position; // Позиция личинки в улье {x, y}
    this.status = 'hungry'; // Статус питания ('hungry' или 'fed')
    this.pollen = 0;        // Количество пыльцы, полученной личинкой
    this.honey = 0;         // Количество мёда, полученного личинкой
    this.foodType = 'ROYAL_JELLY'; // Тип пищи (первоначально маточное молочко)
  }

  // Метод обновления типа пищи личинки
  updateFoodType() {
    // После 3 дней развития (возраст >= 6) меняем пищу на мёд+пыльцу
    if (this.age >= 6 && this.foodType === 'ROYAL_JELLY') {
      this.foodType = 'HONEY_POLLEN';
    }
  }
}

export class Pupa {
  constructor(id, position) {
    this.id = id;           // Уникальный идентификатор куколки
    this.age = 9;           // Возраст куколки в днях (начинается с 9)
    this.duration = 12;     // Продолжительность стадии куколки (12 дней)
    this.position = position; // Позиция куколки в улье {x, y}
  }
}


