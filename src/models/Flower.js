export class Flower {
  constructor(x, y) {
    this.age = 0;
    this.x = x;
    this.y = y;
    this.resetResources();
    this.collectingBee = null;
  }

  resetResources() {
    this.nectar = Math.floor(Math.random() * 5) + 1;
    this.pollen = Math.floor(Math.random() * 5) + 1;
  }

  ageOneDay() {
    this.age++;
    if (this.nectar === 0 && this.pollen === 0) {
      this.resetResources();
    }
  }
}