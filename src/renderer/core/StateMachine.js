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

    // WALK -> IDLE 전환 시, 공중에 떠 있는 중이면 착지할 때까지 대기
    if (this.currentState === PetState.WALK && newState === PetState.IDLE) {
      if (this.pet && !this.pet.isGroundedFrame) {
        console.log('[FSM] Delaying IDLE transition until landed on ground...');
        this.pendingState = PetState.IDLE;
        return;
      }
    }

    this.pendingState = null;
    console.log(`[FSM] State change: ${this.currentState} -> ${newState}`);
    this.currentState = newState;
    this.stateTimer = 0;

    if (this.pet && typeof this.pet.onStateChange === 'function') {
      this.pet.onStateChange(newState);
    }
  }

  update(delta) {
    this.stateTimer += delta;

    // 보정된 IDLE 대기 상태가 있고, 바닥에 착지한 순간 전환
    if (this.pendingState && this.pet && this.pet.isGroundedFrame) {
      const next = this.pendingState;
      this.pendingState = null;
      this.changeState(next);
      return;
    }

    if (this.currentState === PetState.DRAGGED) return;

    if (this.stateTimer > 180) {
      if (this.currentState === PetState.IDLE) {
        if (Math.random() < 0.65) {
          this.changeState(PetState.WALK);
        } else {
          this.stateTimer = 60;
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
