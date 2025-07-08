export class Egg {
  constructor(id, position) {
    this.id = id;
    this.age = 0;
    this.type = 'EGG';
    this.position = position;
  }

  develop() {
    this.age += 1;
  }
}

export class Larva {
  constructor(id, position) {
    this.id = id;
    this.age = 4;
    this.type = 'LARVA';
    this.position = position;
    this.status = 'hungry';
    this.foodType = 'ROYAL_JELLY';
  }

  feed() {
    if (this.age >= 3 && this.foodType === 'ROYAL_JELLY') {
      this.foodType = 'HONEY_POLLEN';
    }
    this.status = 'fed';
  }
 updateFoodType() {
    if (this.age >= 3 && this.foodType === 'ROYAL_JELLY') {
      this.foodType = 'HONEY_POLLEN';
    }
}
}

export class Pupa {
  constructor(id, position) {
    this.id = id;
    this.age = 9;
    this.type = 'PUPA';
    this.position = position;
  }

  develop() {
    this.age += 1;
  }
}