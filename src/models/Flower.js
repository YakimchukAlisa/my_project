export class Flower {
  constructor(x, y, id) {
    this.id = id;
    this.age = 0;
    this.old = 3;
    this.x = x;
    this.y = y;
    this.resetResources();
    this.collectingBee = 0;
  }

  resetResources() {
    this.nectar = Math.floor(Math.random() * 80) + 2;
    this.pollen = Math.floor(Math.random() * 40) + 2;
  }

  ageOneDay() {
    this.age++;
    if (this.nectar === 0 && this.pollen === 0) {
      this.resetResources();
    }
  }
}