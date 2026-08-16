const PetState = {
  IDLE: 'IDLE',
  WALK: 'WALK',
  HAPPY: 'HAPPY',
  HUNGRY: 'HUNGRY',
  EATING: 'EATING',
  SLEEP: 'SLEEP',
  DRAGGED: 'DRAGGED'
};

class StateMachine {
  constructor(petContainer) {
    this.pet = petContainer;
    this.currentState = PetState.IDLE;
    this.stateTimer = 0;
  }

  changeState(newState) {
    if (this.currentState === newState) return;

    console.log(`[FSM] State change: ${this.currentState} -> ${newState}`);
    this.currentState = newState;
    this.stateTimer = 0;

    if (this.pet && typeof this.pet.onStateChange === 'function') {
      this.pet.onStateChange(newState);
    }
  }

  update(delta) {
    this.stateTimer += delta;

    if (this.currentState === PetState.DRAGGED) return;

    if (this.stateTimer > 300) {
      if (this.currentState === PetState.IDLE) {
        if (Math.random() < 0.6) {
          this.changeState(PetState.WALK);
        } else {
          this.stateTimer = 0;
        }
      } else if (this.currentState === PetState.WALK) {
        this.changeState(PetState.IDLE);
      } else if (this.currentState === PetState.HAPPY || this.currentState === PetState.EATING) {
        this.changeState(PetState.IDLE);
      }
    }
  }
}

if (typeof module !== 'undefined') {
  module.exports = { StateMachine, PetState };
}
