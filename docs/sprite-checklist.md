# 🎨 Desktop Pet 스프라이트 & UI 에셋 종합 체크리스트 (Sprite Checklist)

이 문서는 다마고치 펫, **레트로 게임기 본체(Console Case)**, **작은 화면 미니 모드(Mini Mode)**, 방향키/버튼(일반 및 눌림 상태), 아이템 및 UI 에셋의 **필수 제작 목록, 권장 파일명, 추천 규격 및 제작 진행 상황**을 추적하는 종합 체크리스트입니다.

---

## 📌 파일 배치 경로
모든 이미지 에셋(PNG)은 아래 폴더에 지정된 파일명으로 넣어주시면 프로그램이 **자동 감지하여 즉시 반영**합니다:
> 📂 `Desktop_Pet/assets/sprites/`

---

## 🐾 1. 펫 (Pet) 상태별 스프라이트 체크리스트
*💡 이미지를 넣으면 프로그램이 **투명 픽셀을 자동 스캔하여 프레임별 정밀 히트박스를 자동 생성**합니다.*

| 제작 상태 | 상태 (State) | 권장 파일명 (프레임시트) | 단일 대체 파일명 | 추천 규격 / 프레임 수 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [x] | **대기 (Idle)** | `pet_idle_sheet.png` | `pet_idle.png` | 64x64 px, 4프레임 (가로 256px) | 가만히 서 있거나 조용히 숨쉬는 상태 (3fps) |
| [x] | **이동 (Walk)** | `pet_walk_sheet.png` | `pet_walk.png` | 64x64 px, 10프레임 (가로 640px) | 챔버 안을 점프하며 걸어다니는 모습 |
| [ ] | **기쁨 (Happy)** | `pet_happy_sheet.png` | `pet_happy.png` | 64x64 px, 2~4프레임 | 클릭/타자 시 또는 놀아줬을 때 기뻐하는 모습 |
| [ ] | **배고픔 (Hungry)**| `pet_hungry_sheet.png` | `pet_hungry.png` | 64x64 px, 2~4프레임 | 허기 수치가 20 이하일 때 축 처진 모습 |
| [ ] | **식사 (Eating)** | `pet_eating_sheet.png` | `pet_eating.png` | 64x64 px, 4프레임 | 음식을 냠냠 먹고 있는 모습 |
| [ ] | **수면 (Sleep)** | `pet_sleep_sheet.png` | `pet_sleep.png` | 64x64 px, 2프레임 | 눈을 감고 zzz 자는 모습 |
| [ ] | **드래그 (Drag)** | `pet_drag_sheet.png` | `pet_drag.png` | 64x64 px, 1~2프레임 | 마우스로 집어 공중에 띄웠을 때 버둥거리는 모습 |

---

## 🎮 2. 레트로 게임기 본체 & 조작 버튼 에셋 (Console & Buttons)
*💡 버튼은 일반 상태(Normal)와 눌렸을 때 상태(Pressed)를 둘 다 제작하시면 실감 나는 쫀득한 조작감이 구현됩니다.*

| 제작 상태 | 요소명 | 일반 상태 파일명 (Normal) | 눌림 상태 파일명 (Pressed) | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [ ] | **게임기 본체 케이스** | `console_case_bg.png` | - | 420x470 px (투명 PNG) | 레트로 게임보이/다마고치 본체 외형 |
| [ ] | **LCD 스크린 베젤/배경** | `screen_bg.png` | - | 360x220 px | 펫이 활동하는 레트로 도트 LCD 스크린 배경 |
| [ ] | **A 버튼 (확인/OK)** | `btn_action_a.png` | `btn_action_a_pressed.png` | 44x44 px (투명 PNG) | 메뉴 선택 / 확인용 A 버튼 |
| [ ] | **B 버튼 (취소/CANCEL)** | `btn_action_b.png` | `btn_action_b_pressed.png` | 44x44 px (투명 PNG) | 메뉴 뒤로가기 / 취소용 B 버튼 |
| [ ] | **전원 버튼 (POWER)** | `btn_power.png` | `btn_power_pressed.png` | 22x22 px (투명 PNG) | 게임기 전원 끄기 버튼 |
| [ ] | **십자키 위 (▲ Up)** | `btn_dpad_up.png` | `btn_dpad_up_pressed.png` | 30x32 px (투명 PNG) | D-Pad 상단 방향키 |
| [ ] | **십자키 아래 (▼ Down)** | `btn_dpad_down.png` | `btn_dpad_down_pressed.png` | 30x32 px (투명 PNG) | D-Pad 하단 방향키 |
| [ ] | **십자키 왼쪽 (◀ Left)** | `btn_dpad_left.png` | `btn_dpad_left_pressed.png` | 32x30 px (투명 PNG) | D-Pad 좌측 방향키 |
| [ ] | **십자키 오른쪽 (▶ Right)** | `btn_dpad_right.png` | `btn_dpad_right_pressed.png` | 32x30 px (투명 PNG) | D-Pad 우측 방향키 |
| [ ] | **통합 십자키 (D-Pad)** | `btn_dpad.png` | `btn_dpad_pressed.png` | 90x90 px (투명 PNG) | 십자키 전체 일체형 스프라이트 |

---

## 📦 3. 작은 화면 모드 (Mini Mode) 에셋
*💡 모니터 구석에 조그맣게 띄워두는 초소형 다마고치 모드 에셋입니다.*

| 제작 상태 | 요소명 | 일반 상태 파일명 (Normal) | 눌림 상태 파일명 (Pressed) | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [ ] | **미니 모드 본체 케이스** | `mini_casing_bg.png` | - | 140x160 px (투명 PNG) | 초소형 미니 다마고치 케이스 외형 |
| [ ] | **미니 모드 종료 버튼** | `mini_btn_power.png` | `mini_btn_power_pressed.png` | 26x26 px (투명 PNG) | 미니 모드 전원 끄기 버튼 |
| [ ] | **미니 모드 복원 버튼** | `mini_btn_expand.png` | `mini_btn_expand_pressed.png` | 26x26 px (투명 PNG) | 일반 게임기 크기로 복원하는 버튼 |

---

## 🛒 4. 상점 (Shop) & 먹이 아이템 에셋

| 제작 상태 | 아이템명 | 권장 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [ ] | **기본 사과 (Apple)** | `food_apple.png` | 32x32 px (투명 PNG) | 허기 +20 회복 (기본 음식) |
| [ ] | **고급 고기 (Meat)** | `food_meat.png` | 32x32 px (투명 PNG) | 허기 +50 회복 |
| [ ] | **신선한 생선 (Fish)** | `food_fish.png` | 32x32 px (투명 PNG) | 허기 +35 회복 |
| [ ] | **호감도 캔디 (Candy)** | `item_candy.png` | 32x32 px (투명 PNG) | 행복도 +40 즉시 회복 |
| [ ] | **골드 코인 이펙트** | `drop_coin.png` | 24x24 px (투명 PNG) | 클릭/타자 시 화면에 뜨는 코인 이펙트 |

---

## ⚙️ 5. UI & 시스템 에셋

| 제작 상태 | 아이콘/요소명 | 권장 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [ ] | **설정/상점 창 배경** | `ui_modal_bg.png` | 320x200 px (투명 PNG) | 레트로 OSD 메뉴 배경 창 |
| [ ] | **트레이 아이콘** | `assets/ui/tray_icon.png` | 16x16 또는 32x32 px | Windows 시스템 트레이 메뉴 아이콘 |
