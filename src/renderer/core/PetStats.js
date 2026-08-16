class PetStats {
  constructor(initialData = {}) {
    this.name = initialData.name || '모치(Mochi)';
    this.level = initialData.level || 1;
    this.exp = initialData.exp || 0;
    this.maxExp = this.calculateMaxExp(this.level);
    
    this.fullness = initialData.fullness !== undefined ? initialData.fullness : 80;
    this.happiness = initialData.happiness !== undefined ? initialData.happiness : 90;
    this.gold = initialData.gold || 100;

    this.tickTimer = 0;
    this.onStatChange = null;
    this.onLevelUp = null;
  }

  calculateMaxExp(level) {
    return level * 50;
  }

  update(delta) {
    this.tickTimer += delta;
    if (this.tickTimer >= 600) {
      this.tickTimer = 0;
      this.decayStats();
    }
  }

  decayStats() {
    this.fullness = Math.max(0, this.fullness - 1);
    this.happiness = Math.max(0, this.happiness - 0.5);

    if (this.onStatChange) {
      this.onStatChange(this.getSnapshot());
    }
  }

  feed(amount = 30) {
    this.fullness = Math.min(100, this.fullness + amount);
    this.happiness = Math.min(100, this.happiness + 5);
    this.addExp(15);

    if (this.onStatChange) this.onStatChange(this.getSnapshot());
  }

  play(amount = 25) {
    this.happiness = Math.min(100, this.happiness + amount);
    this.fullness = Math.max(0, this.fullness - 5);
    this.addExp(20);

    if (this.onStatChange) this.onStatChange(this.getSnapshot());
  }

  addExp(amount) {
    this.exp += amount;
    if (this.exp >= this.maxExp) {
      this.exp -= this.maxExp;
      this.level += 1;
      this.maxExp = this.calculateMaxExp(this.level);
      
      if (this.onLevelUp) {
        this.onLevelUp(this.level);
      }
    }
    if (this.onStatChange) this.onStatChange(this.getSnapshot());
  }

  addGold(amount) {
    this.gold += amount;
    if (this.onStatChange) this.onStatChange(this.getSnapshot());
  }

  getSnapshot() {
    return {
      name: this.name,
      level: this.level,
      exp: this.exp,
      maxExp: this.maxExp,
      fullness: Math.round(this.fullness),
      happiness: Math.round(this.happiness),
      gold: this.gold
    };
  }
}

if (typeof module !== 'undefined') {
  module.exports = { PetStats };
}
