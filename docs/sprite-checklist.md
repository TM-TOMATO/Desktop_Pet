# 🎨 Desktop Pet 스프라이트 & UI 에셋 작업 체크리스트 (Sprite Checklist)

이 문서는 다마고치 펫, **레트로 게임기 본체(Console Case)**, 방향키/버튼, 아이템 및 UI 에셋의 **필수 제작 목록, 권장 파일명, 추천 규격 및 제작 진행 상황**을 추적하는 종합 체크리스트입니다.

---

## 📌 파일 배치 경로
모든 이미지 에셋(PNG)은 아래 폴더에 지정된 파일명으로 넣어주시면 자동으로 감지되어 적용됩니다:
> 📂 `Desktop_Pet/assets/sprites/`

---

## 🐾 1. 펫 (Pet) 상태별 에셋 체크리스트
*💡 이미지를 넣으면 프로그램이 **투명 픽셀을 자동 스캔하여 프레임별 정밀 히트박스를 자동 생성**합니다.*

| 제작 상태 | 상태 (State) | 권장 파일명 (프레임시트) | 단일 대체 파일명 | 추천 규격 / 프레임 수 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [x] | **대기 (Idle)** | `pet_idle_sheet.png` | `pet_idle.png` | 64x64 px, 4프레임 (가로 256px) | 가만히 서 있거나 조용히 숨쉬는 상태 (3fps) |
| [x] | **이동 (Walk)** | `pet_walk_sheet.png` | `pet_walk.png` | 64x64 px, 10프레임 (가로 640px) | 챔버 안을 점프하며 걸어다니는 모습 |
| [ ] | **기쁨 (Happy)** | `pet_happy_sheet.png` | `pet_happy.png` | 64x64 px, 2~4프레임 | 쓰다듬어 주거나 기분 좋을 때 연출 |
| [ ] | **배고픔 (Hungry)**| `pet_hungry_sheet.png` | `pet_hungry.png` | 64x64 px, 2~4프레임 | 허기 수치가 20 이하일 때 표정/행동 |
| [ ] | **식사 (Eating)** | `pet_eating_sheet.png` | `pet_eating.png` | 64x64 px, 4프레임 | 음식을 냠냠 먹고 있는 모습 |
| [ ] | **수면 (Sleep)** | `pet_sleep_sheet.png` | `pet_sleep.png` | 64x64 px, 2프레임 | 잘 때 또는 눈을 감은 쿨쿨 모습 |
| [ ] | **드래그 (Drag)** | `pet_drag_sheet.png` | `pet_drag.png` | 64x64 px, 1~2프레임 | 마우스로 집어 공중에 띄웠을 때 |

---

## 🎮 2. 레트로 게임기 본체 & 조작 패드 에셋 (Console & Gamepad)

| 제작 상태 | 요소명 | 권장 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [ ] | **게임기 본체 케이스** | `console_case_bg.png` | 420x460 px (투명 PNG) | 레트로 게임기/다마고치 플라스틱 본체 외형 |
| [ ] | **LCD 스크린 베젤/배경** | `screen_bg.png` | 360x220 px | 펫이 활동하는 레트로 도트 LCD 스크린 배경 |
| [ ] | **D-Pad (십자 방향키)** | `btn_dpad.png` | 80x80 px (투명 PNG) | 방향 조작 십자키 전체 스프라이트 |
| [ ] | **A 버튼 (확인/OK)** | `btn_action_a.png` | 36x36 px (투명 PNG) | 메뉴 선택 / 확인용 A 버튼 |
| [ ] | **B 버튼 (취소/CANCEL)** | `btn_action_b.png` | 36x36 px (투명 PNG) | 메뉴 뒤로가기 / 취소용 B 버튼 |
| [ ] | **전원 버튼 (POWER)** | `btn_power.png` | 28x28 px (투명 PNG) | 게임기 전원 끄기 버튼 |

---

## 🛒 3. 상점 (Shop) & 아이템 에셋

| 제작 상태 | 아이템명 | 권장 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [ ] | **기본 사과 (Apple)** | `food_apple.png` | 32x32 px (투명 PNG) | 허기 +20 회복 (기본 음식) |
| [ ] | **고급 고기 (Meat)** | `food_meat.png` | 32x32 px (투명 PNG) | 허기 +50, 행복도 +15 회복 |
| [ ] | **신선한 생선 (Fish)** | `food_fish.png` | 32x32 px (투명 PNG) | 허기 +35, EXP +20 획득 |
| [ ] | **호감도 캔디 (Candy)** | `item_candy.png` | 32x32 px (투명 PNG) | 행복도 +40 즉시 회복 |
| [ ] | **골드 코인** | `drop_coin.png` | 32x32 px (투명 PNG) | 클릭 시 생성되는 골드 코인 이펙트 |

---

## ⚙️ 4. UI & 시스템 에셋

| 제작 상태 | 아이콘/요소명 | 권장 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [ ] | **설정/상점 창 배경** | `ui_modal_bg.png` | 320x200 px | 레트로 OSD 메뉴 배경 창 |
| [ ] | **크기 조절 슬라이더 놉** | `ui_slider_knob.png` | 20x20 px | 크기(Scale: 50%~250%) 조절 슬라이더 핸들 |
| [ ] | **트레이 아이콘** | `assets/ui/tray_icon.png` | 16x16 또는 32x32 px | Windows 시스템 트레이 메뉴 아이콘 |
