export const PetState = {
  IDLE: 'IDLE',
  WALK: 'WALK',
  HAPPY: 'HAPPY',
  HUNGRY: 'HUNGRY',
  EATING: 'EATING',
  SLEEP: 'SLEEP',
  DRAGGED: 'DRAGGED'
};

export class StateMachine {
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

    // DRAGGED 상태일 때는 자동 상태 변경 방지
    if (this.currentState === PetState.DRAGGED) return;

    // 5초 ~ 10초 마다 자율적 행동 전환 (IDLE <-> WALK)
    if (this.stateTimer > 300) { // 약 5초 기준
      if (this.currentState === PetState.IDLE) {
        // 50% 확률로 걸어다니기 시작
        if (Math.random() < 0.6) {
          this.changeState(PetState.WALK);
        } else {
          this.stateTimer = 0; // 계속 IDLE 유지
        }
      } else if (this.currentState === PetState.WALK) {
        this.changeState(PetState.IDLE);
      } else if (this.currentState === PetState.HAPPY || this.currentState === PetState.EATING) {
        this.changeState(PetState.IDLE);
      }
    }
  }
}
