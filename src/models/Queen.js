import { Egg} from './Development.js';

export class Queen {
  constructor(id) {
    this.id = id;
    this.age = 0;
    this.position = { x: 70, y: 100 };
    this.lastEggDay = -1;
  }

  layEgg() {
    return new Egg(
      Date.now(),
      {
        x: this.position.x + (Math.random() * 200 + 50),
        y: this.position.y + (Math.random() * 200 + 50)
      }
    );
  }
}