export class Flower {
  constructor(x, y, id) {
    this.id = id;         // Уникальный идентификатор цветка
    this.age = 0;         // Возраст цветка в днях
    this.old = 5;         // Возраст, начиная с которого цветок может погибнуть
    this.x = x;           // Координата X положения цветка
    this.y = y;           // Координата Y положения цветка
    this.dieChance = 0.3; // Вероятность отмирания цветка (30%)

    // Количество ресурсов (генерируется случайно при создании):
    this.nectar = Math.floor(Math.random() * 80) + 2;  // Нектар (2-81 единиц)
    this.pollen = Math.floor(Math.random() * 40) + 2;  // Пыльца (2-41 единиц)

    this.collectingBee = 0; // Собирает ли пчела с него ресурсы
  }

  // Метод старения цветка на один день
  ageOneDay() {
    this.age++; // Увеличиваем возраст цветка

    // Если ресурсы исчерпаны - регенерируем их
    if (this.nectar === 0 && this.pollen === 0) {
      this.nectar = Math.floor(Math.random() * 80) + 2;
      this.pollen = Math.floor(Math.random() * 40) + 2;
    }
  }
}


