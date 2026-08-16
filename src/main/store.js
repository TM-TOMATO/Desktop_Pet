const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class PetDataStore {
  constructor() {
    this.userDataPath = app.getPath('userData');
    this.saveFilePath = path.join(this.userDataPath, 'pet_save_data.json');
    console.log('[Store] Save file location:', this.saveFilePath);
  }

  loadData() {
    try {
      if (fs.existsSync(this.saveFilePath)) {
        const raw = fs.readFileSync(this.saveFilePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[Store] Failed to load data:', err.message);
    }
    
    // Default initial data
    return {
      version: '1.0.0',
      petInfo: {
        name: '모치(Mochi)',
        level: 1,
        exp: 0,
        fullness: 80,
        happiness: 90,
        gold: 100
      },
      lastOnlineTimestamp: Date.now()
    };
  }

  saveData(data) {
    try {
      const saveData = {
        ...data,
        lastOnlineTimestamp: Date.now()
      };
      fs.writeFileSync(this.saveFilePath, JSON.stringify(saveData, null, 2), 'utf-8');
      console.log('[Store] Game data saved successfully.');
      return true;
    } catch (err) {
      console.error('[Store] Failed to save data:', err.message);
      return false;
    }
  }
}

module.exports = new PetDataStore();
