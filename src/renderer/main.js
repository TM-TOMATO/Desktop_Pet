import * as PIXI from 'pixi.js';
import { StateMachine, PetState } from './core/StateMachine.js';
import { PetContainer } from './objects/PetContainer.js';

(async () => {
  // 1. PixiJS App 초기화 (투명 캔버스)
  const app = new PIXI.Application();
  await app.init({
    resizeTo: window,
    backgroundAlpha: 0,
    antialias: true
  });

  const containerEl = document.getElementById('canvas-container');
  containerEl.appendChild(app.canvas);

  // 2. 펫 객체 및 상태 머신 생성
  const pet = new PetContainer(app);
  app.stage.addChild(pet);

  const stateMachine = new StateMachine(pet);

  // 3. UI 요소 참조
  const dialogEl = document.getElementById('pet-dialog');
  const dialogTextEl = document.getElementById('dialog-text');
  const radialMenuEl = document.getElementById('radial-menu');
  const statusModalEl = document.getElementById('status-modal');

  // 말풍선 대사 출력
  function showDialog(text, durationMs = 3000) {
    dialogTextEl.innerText = text;
    dialogEl.style.left = `${pet.x - 50}px`;
    dialogEl.style.top = `${pet.y - 140}px`;
    dialogEl.classList.remove('hidden');

    setTimeout(() => {
      dialogEl.classList.add('hidden');
    }, durationMs);
  }

  // 4. 펫 인터랙션 이벤트 바인딩
  pet.onDragStart = () => {
    stateMachine.changeState(PetState.DRAGGED);
    radialMenuEl.classList.add('hidden');
    showDialog('우와! 날 어디로 데려가는 거야? 😮');
  };

  pet.onDragEnd = () => {
    stateMachine.changeState(PetState.IDLE);
    showDialog('후아~ 안착! 🐾');
  };

  pet.onRightClick = (x, y) => {
    radialMenuEl.style.left = `${x - 60}px`;
    radialMenuEl.style.top = `${y - 60}px`;
    radialMenuEl.classList.remove('hidden');
  };

  // 5. 래디얼 메뉴 버튼 클릭 이벤트
  document.getElementById('btn-feed').addEventListener('click', () => {
    stateMachine.changeState(PetState.EATING);
    showDialog('냠냠! 🍎 맛있는 사과 고마워!');
    radialMenuEl.classList.add('hidden');
  });

  document.getElementById('btn-play').addEventListener('click', () => {
    stateMachine.changeState(PetState.HAPPY);
    showDialog('신난다! 🎶 헤헤!');
    radialMenuEl.classList.add('hidden');
  });

  document.getElementById('btn-info').addEventListener('click', () => {
    statusModalEl.classList.remove('hidden');
    radialMenuEl.classList.add('hidden');
  });

  document.getElementById('btn-close').addEventListener('click', () => {
    radialMenuEl.classList.add('hidden');
  });

  document.getElementById('btn-modal-close').addEventListener('click', () => {
    statusModalEl.classList.add('hidden');
  });

  // 6. Ghost Mode (클릭 투과) Smart Event Listener
  // 마우스가 펫 또는 UI 요소 위에 있을 때만 마우스 이벤트를 활성화하고, 빈 투명 공간에서는 바탕화면 아래로 클릭을 전달.
  window.addEventListener('mousemove', (e) => {
    const isHoveringUI = e.target.closest('.pet-dialog, .radial-menu, .status-modal, button');
    
    // Pixi 펫 위치 호버 검사
    const dx = e.clientX - pet.x;
    const dy = e.clientY - (pet.y - 64);
    const isHoveringPet = (dx * dx + dy * dy) < 4000; // 약 60px 반지름

    if (isHoveringPet || isHoveringUI || pet.isDragging) {
      if (window.electronAPI) {
        window.electronAPI.setIgnoreMouseEvents(false);
      }
    } else {
      if (window.electronAPI) {
        window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
      }
    }
  });

  // 7. 메인 렌더링 및 로직 루프 (PIXI Ticker)
  app.ticker.add((ticker) => {
    const delta = ticker.deltaTime;

    // FSM 상태 업데이트
    stateMachine.update(delta);

    // 펫 애니메이션 및 위치 업데이트
    pet.update(delta, stateMachine.currentState);

    // 말풍선 위치 추적
    if (!dialogEl.classList.contains('hidden')) {
      dialogEl.style.left = `${pet.x - 50}px`;
      dialogEl.style.top = `${pet.y - 140}px`;
    }
  });

  showDialog('안녕! 반가워! 바탕화면에 상주 중이야 🌟');
})();
