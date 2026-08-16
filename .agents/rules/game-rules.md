# Game Code & Development Rules: Desktop Pet (Electron + PixiJS)

이 문서는 개발자가 자율적으로 바탕화면 방치/수집형 다마고치(Desktop Pet) 게임을 구축할 때 준수해야 할 코드 컨벤션, 에셋 관리 규칙, 상태 관리 가이드라인을 정의합니다.

---

## 1. 기술 스택 & 프로젝트 기본 구조

### 1.1 Core Stack
- **Desktop Runtime**: Electron (Transparent, Frameless, Always-On-Top BrowserWindow)
- **Rendering Engine**: PixiJS v8 (Canvas/WebGL 기반 2D 애니메이션 및 스프라이트 처리)
- **UI & Controls**: HTML5 / CSS3 / Vanilla JS (또는 Lightweight Component System) + PixiJS Overlay UI
- **Data Persistence**: Electron Store (`electron-store` 또는 Node.js `fs` 기반 JSON 저장소)

### 1.2 Directory Standard Structure
```
Desktop_Pet/
├── .agents/
│   └── rules/
│       └── game-rules.md         # 개발 개발 규칙 및 가이드라인
├── docs/
│   └── game-design.md        # 기획서 및 단계별 (Phase 1~5) 세부 개발 계획
├── src/
│   ├── main/                 # Electron Main Process
│   │   ├── main.js           # 앱 생명주기 및 투명 윈도우 생성
│   │   ├── ipc/              # IPC 통신 핸들러 (창 이동, 클릭 투과, 시스템 트레이)
│   │   └── store.js          # 게임 세이브 데이터 관리 (영속화)
│   ├── renderer/             # PixiJS & Canvas Renderer Process
│   │   ├── index.html        # 렌더러 진입점
│   │   ├── main.js           # PixiJS Application 초기화
│   │   ├── core/             # 게임 핵심 로직
│   │   │   ├── Game.js       # 게임 메인 루프 & 틱 매니저
│   │   │   ├── StateMachine.js # 다마고치 상태 머신 (Idle, Walk, Eat, Sleep, Dragged 등)
│   │   │   └── IdleManager.js  # 방치형 재화/경험치 및 시간 경과 계산기
│   │   ├── objects/          # PixiJS 디스플레이 객체 (Pet, DropItems, UI)
│   │   │   ├── PetContainer.js
│   │   │   ├── ItemSprite.js
│   │   │   └── EffectParticle.js
│   │   ├── managers/         # 에셋/사운드/UI 관리자
│   │   │   ├── AssetLoader.js
│   │   │   ├── SoundManager.js
│   │   │   └── UIManager.js
│   │   └── style.css         # UI 및 투명 윈도우 CSS
│   └── assets/               # 이미지, 스프라이트, 오디오 에셋
│       ├── sprites/
│       ├── ui/
│       └── audio/
├── package.json
└── README.md
```

---

## 2. 게임 코드 컨벤션 (Code Conventions)

### 2.1 Electron Main & Renderer 분리 원칙
1. **역할 분리**:
   - `Main Process`: 투명 윈도우 생성, 항상 위에 표시(`alwaysOnTop`), 마우스 클릭 투과(`setIgnoreMouseEvents`), 파일 I/O, 시스템 트레이 메뉴 관리.
   - `Renderer Process`: PixiJS 렌더링, 캐릭터 애니메이션, 상태 계산, 마우스/드래그 인터랙션, UI 렌더링.
2. **IPC 통신 규약**:
   - Main <-> Renderer 통신 시 보안 및 전송 최적화를 위해 `preload.js`와 `contextBridge`를 사용한다.
   - 이벤트명 형식: `pet:<action>` (예: `pet:toggle-click-through`, `pet:save-data`, `pet:open-inventory`)

### 2.2 PixiJS 렌더링 및 모듈화 규칙
1. **Container 기반 구조**:
   - 씬(Scene) 및 복합 객체는 반드시 `PIXI.Container`를 상속받거나 내부에 구조화하여 래핑한다.
   - 메인 스테이지 계층 구조:
     - `stage` -> `backgroundLayer` -> `gameLayer` (Pet, Items) -> `effectLayer` (Particles) -> `uiLayer` (HUD, Tooltips)
2. **Game Loop (`PIXI.Ticker`)**:
   - 로직 업데이트와 렌더링 프레임을 구분한다. `delta` 타임을 활용하여 가변 프레임률에서도 일정한 애니메이션 속도를 유지한다.
   - 메인 `ticker`에 등록되는 콜백은 전역 `Game.js`에서 통제한다.

### 2.3 다마고치 상태 머신 (FSM: Finite State Machine)
- 다마고치의 상태(State)는 독자적인 Class 혹은 Enum 상태값으로 명확히 구분한다.
  - 예: `IDLE`, `WALK`, `HAPPY`, `HUNGRY`, `SLEEPING`, `DRAGGED`, `EATING`
- 상태 변경 시 `changeState(newState)` 메서드를 통해서만 진입/이탈(Enter/Exit) 이벤트를 실행한다.

---

## 3. 에셋 관리 및 애니메이션 규칙 (Asset Management)

### 3.1 이미지 및 스프라이트
1. **포맷 및 투명도**:
   - 캐릭터 및 아이템 에셋은 Alpha 채널이 포함된 32-bit PNG 또는 WebP 포맷을 사용한다.
   - 바탕화면 렌더링 시 아티팩트 방지를 위해 PNG 이미지 테두리의 앤티앨리어싱 상태를 점검한다.
2. **스프라이트시트 (Spritesheet)**:
   - 다이내믹 프레임 애니메이션은 PixiJS `Spritesheet` (JSON Atlas + PNG Image) 형태를 표준으로 사용한다.
   - 프레임 이름 규칙: `pet_<state>_<index>.png` (예: `pet_walk_01.png`)
3. **Anchor & Pivot (기준점)**:
   - 바탕화면 접지선(바닥)과 드래그 연산을 쉽게 하기 위해 펫의 기본 Pivot/Anchor는 하단 중앙 `(0.5, 1.0)` 또는 중앙 `(0.5, 0.5)`로 통일한다.

### 3.2 사운드 (Audio)
1. **효과음(SFX)**: MP3 또는 OGG 포맷, `SoundManager`를 통해 동시 재생 관리.
2. **바탕화면 방해 방지**: 사운드는 기본적으로 옵션에서 Mute/볼륨 조절이 가능해야 하며, 방치 중 불필요한 고주파음 반복을 금지한다.

---

## 4. 상태 관리 및 방치형(Idle) 가이드라인

### 4.1 상태 데이터 구조 (Save State Schema)
게임 저장은 JSON 형태로 관리하며, 기본 스키마는 다음과 같다:
```json
{
  "version": "1.0.0",
  "petInfo": {
    "name": "Mochi",
    "level": 1,
    "exp": 0,
    "fullness": 80,
    "happiness": 90,
    "stamina": 100
  },
  "economy": {
    "coins": 150,
    "gems": 5
  },
  "inventory": [
    { "itemId": "food_apple", "count": 10 },
    { "itemId": "toy_ball", "count": 1 }
  ],
  "collections": ["pet_skin_01", "item_hat_cat"],
  "lastOnlineTimestamp": 1771234567890
}
```

### 4.2 오프라인 / 오프스크린 방치형 보상 계산법
1. **앱 재시작 / 경과 시간 계산**:
   - `offlineSeconds = (CurrentTime - lastOnlineTimestamp) / 1000`
   - 과도한 이탈 방지를 위해 오프라인 시간 최대 상한선(예: 8시간 = 28,800초)을 둔다.
2. **방치형 계산 로직**:
   - 오프라인 시간 동안의 허기(Fullness) 감소량, 경험치(EXP) 및 기본 재화(Coin) 획득량을 단번에 연산하여 로그인/앱 켜짐 시 "방치 보상 팝업" 형태로 제공한다.

---

## 5. 안티그래비티(AI Agent) 자율 개발 행동 수칙

1. **단계별 검증(Incremental Validation)**:
   - 한 번에 대량의 코드를 작성하지 않고, 모듈별(Electron 투명창 -> Pixi 캔버스 -> 펫 객체 -> FSM -> IPC 연동)로 순차 구축 후 정상 작동 여부를 확인한다.
2. **코드 린트 및 안전성**:
   - Null 참조 에러 및 Electron IPC 메인/렌더러 간 데드락 방지 조치를 반드시 취한다.
3. **에러 발생 시 대처**:
   - 콘솔/터미널 로그의 정확한 스택 트레이스를 분석한 후 원인 파악 시에만 코드 수정 작업을 진행한다.
