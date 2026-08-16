# 🎨 Desktop Pet 스프라이트 & 애니메이션 프레임시트 에셋 가이드

사용자님이 제작하신 이미지를 `assets/sprites/` 폴더 내에 아래 지정된 파일명으로 넣어주시면, 게임 실행 시 자동으로 해당 에셋을 로드하여 펫 애니메이션으로 사용합니다!

*(이미지가 아직 폴더에 없는 경우, 개발용 귀여운 젤리/슬라임 형태의 Placeholder 그래픽이 대신 렌더링됩니다.)*

---

## 1. 프레임시트 (Spritesheet) & 단일 이미지 파일명 규격

시스템은 **[프레임시트 PNG]**, **[JSON Atlas]**, **[단일 PNG]** 3가지 형태를 모두 지원하며, 아래 우선순위대로 자동 감지합니다.

| 상태 (State) | 프레임시트 PNG (추천) | 단일 PNG | 설명 |
| :--- | :--- | :--- | :--- |
| **대기 (Idle)** | `pet_idle_sheet.png` | `pet_idle.png` | 가만히 서 있거나 조용히 숨쉬는 애니메이션 |
| **이동 (Walk)** | `pet_walk_sheet.png` | `pet_walk.png` | 좌/우로 걸어다니는 애니메이션 |
| **기쁨/좋음 (Happy)**| `pet_happy_sheet.png` | `pet_happy.png` | 클릭/쓰다듬기 반응 또는 기분 좋을 때 |
| **배고픔 (Hungry)** | `pet_hungry_sheet.png` | `pet_hungry.png` | 허기 수치가 낮을 때 표정 |
| **식사 (Eating)** | `pet_eating_sheet.png` | `pet_eating.png` | 음식을 먹고 있을 때 상태 |
| **수면 (Sleep)** | `pet_sleep_sheet.png` | `pet_sleep.png` | 자고 있거나 눈을 감은 상태 |
| **드래그 (Drag)** | `pet_drag_sheet.png` | `pet_drag.png` | 마우스로 클릭하여 공중에 들렸을 때 |

---

## 2. 프레임시트 (Spritesheet) 제작 규격

### 🎬 가로 연속 프레임 PNG (`pet_<state>_sheet.png`)
- **형식**: 가로로 프레임이 이어져 있는 연속 띠(Strip) PNG 이미지.
- **예시**: 128x128 크기의 프레임이 4개 연결된 경우 -> **가로 512px, 세로 128px** PNG.
- **기본 프레임 분할 규칙**:
  - 기본적으로 **가로 방향으로 동일한 폭**으로 자동 분할됩니다 (예: 4프레임 시트 -> 1/4씩 분할).
  - 프레임 재생 속도: 초당 약 6~12 프레임 (`animationSpeed = 0.15`).

### 📦 PixiJS JSON Atlas 포맷 (`pet_<state>.json` + `pet_<state>.png`)
- Aseprite, TexturePacker 등으로 익스포트한 표준 PixiJS JSON Atlas 파일이 있을 경우 `pet_idle.json` 형태로 올려두시면 프레임명 및 바운딩박스를 정밀하게 로드합니다.
