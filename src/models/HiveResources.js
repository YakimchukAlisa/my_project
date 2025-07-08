import { reactive } from 'vue';

export class HiveResources {
  constructor() {
    this.storage = reactive({
      nectar: { amount: 29, position: { x: 45, y: 70 } },
      pollen: { amount: 0, position: { x: 55, y: 70 } },
      honey: { amount: 0, position: { x: 65, y: 70 } },
    });
  }

  addNectar(amount) {
    this.storage.nectar.amount += amount;
    return this.storage.nectar.amount;
  }

  addPollen(amount) {
    this.storage.pollen.amount += amount;
    return this.storage.pollen.amount;
  }

  produceHoneyFromNectar(nectarAmount) {
    const honeyProduced = Math.floor(nectarAmount / 2);
    this.storage.honey.amount += honeyProduced;
    this.storage.nectar.amount -= nectarAmount;
    return honeyProduced;
  }

  consumeResources(resources) {
    // resources - объект вида { nectar: 1, pollen: 1 }
    let success = true;
    
    Object.entries(resources).forEach(([type, amount]) => {
      if (this.storage[type].amount < amount) {
        success = false;
      }
    });

    if (success) {
      Object.entries(resources).forEach(([type, amount]) => {
        this.storage[type].amount -= amount;
      });
    }

    return success;
  }

  getAmount(resourceType) {
    return this.storage[resourceType]?.amount || 0;
  }

  getPosition(resourceType) {
    return this.storage[resourceType]?.position || { x: 0, y: 0 };
  }
}