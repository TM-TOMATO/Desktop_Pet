# 🎨 Desktop Pet 스프라이트 & UI 에셋 종합 체크리스트 (Sprite Checklist)

이 문서는 다마고치 펫, **레트로 게임기 본체(Console Case)**, **통합 8방향 십자키(8-Way D-Pad)**, **작은 화면 미니 모드(Mini Mode)**, 액션 버튼, 아이템 및 UI 에셋의 **필수 제작 목록, 권장 파일명, 추천 규격 및 제작 진행 상황**을 추적하는 종합 체크리스트입니다.

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

## 🕹️ 2. 통합 8방향 십자키 (8-Way Integrated D-Pad)
*💡 기본 중립 상태 1장과, 각 8개 방향으로 기울어져 눌렸을 때의 스프라이트 8장입니다. (256x256 레이어 권장)*

| 제작 상태 | 방향 / 상태 | 권장 파일명 | 단일 대체 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [x] | **중립 (기본/Neutral)** | `btn_dpad.png` | - | 256x256 px (투명 PNG) | 아무것도 누르지 않았을 때의 십자키 전체 외형 |
| [x] | **▲ 상 (Up)** | `btn_dpad_pressed_up.png` | `btn_dpad_up_pressed.png` | 256x256 px (투명 PNG) | 위쪽으로 기울어져 눌린 모습 |
| [x] | **▼ 하 (Down)** | `btn_dpad_pressed_down.png` | `btn_dpad_down_pressed.png` | 256x256 px (투명 PNG) | 아래쪽으로 기울어져 눌린 모습 |
| [x] | **◀ 좌 (Left)** | `btn_dpad_pressed_left.png` | `btn_dpad_left_pressed.png` | 256x256 px (투명 PNG) | 왼쪽으로 기울어져 눌린 모습 |
| [x] | **▶ 우 (Right)** | `btn_dpad_pressed_right.png` | `btn_dpad_right_pressed.png` | 256x256 px (투명 PNG) | 오른쪽으로 기울어져 눌린 모습 |
| [ ] | **▲◀ 좌상 (Up-Left)** | `btn_dpad_pressed_up_left.png` | `btn_dpad_pressed_ul.png` | 256x256 px (투명 PNG) | 대각선 좌상단으로 기울어져 눌린 모습 |
| [ ] | **▲▶ 우상 (Up-Right)** | `btn_dpad_pressed_up_right.png` | `btn_dpad_pressed_ur.png` | 256x256 px (투명 PNG) | 대각선 우상단으로 기울어져 눌린 모습 |
| [ ] | **▼◀ 좌하 (Down-Left)** | `btn_dpad_pressed_down_left.png` | `btn_dpad_pressed_dl.png` | 256x256 px (투명 PNG) | 대각선 좌하단으로 기울어져 눌린 모습 |
| [ ] | **▼▶ 우하 (Down-Right)**| `btn_dpad_pressed_down_right.png`| `btn_dpad_pressed_dr.png` | 256x256 px (투명 PNG) | 대각선 우하단으로 기울어져 눌린 모습 |

---

## 🎮 3. 레트로 게임기 본체 & 액션 버튼 (Console & Action Buttons)

| 제작 상태 | 요소명 | 일반 상태 파일명 (Normal) | 눌림 상태 파일명 (Pressed) | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [x] | **게임기 본체 케이스** | `console_case_bg.png` | - | 256x256 px (투명 PNG) | 레트로 다마고치 본체 외형 |
| [x] | **LCD 스크린 베젤/배경** | `screen_bg.png` | - | 256x256 px | 펫이 활동하는 레트로 도트 LCD 스크린 배경 |
| [ ] | **A 버튼 (확인/OK)** | `btn_action_a.png` | `btn_action_a_pressed.png` | 256x256 px (투명 PNG) | 메뉴 선택 / 확인용 A 버튼 |
| [ ] | **B 버튼 (취소/CANCEL)** | `btn_action_b.png` | `btn_action_b_pressed.png` | 256x256 px (투명 PNG) | 메뉴 뒤로가기 / 취소용 B 버튼 |
| [x] | **전원 버튼 (POWER)** | `btn_power.png` | `btn_power_pressed.png` | 256x256 px (투명 PNG) | 게임기 전원 끄기 버튼 |

---

## 📦 4. 작은 화면 모드 (Mini Mode) 에셋

| 제작 상태 | 요소명 | 일반 상태 파일명 (Normal) | 눌림 상태 파일명 (Pressed) | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [ ] | **미니 모드 본체 케이스** | `mini_casing_bg.png` | - | 140x160 px (투명 PNG) | 초소형 미니 다마고치 케이스 외형 |
| [ ] | **미니 모드 종료 버튼** | `mini_btn_power.png` | `mini_btn_power_pressed.png` | 26x26 px (투명 PNG) | 미니 모드 전원 끄기 버튼 |
| [ ] | **미니 모드 복원 버튼** | `mini_btn_expand.png` | `mini_btn_expand_pressed.png` | 26x26 px (투명 PNG) | 일반 게임기 크기로 복원하는 버튼 |

---

## 🛒 5. 상점 (Shop) & 먹이 아이템 에셋

| 제작 상태 | 아이템명 | 권장 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [ ] | **기본 사과 (Apple)** | `food_apple.png` | 32x32 px (투명 PNG) | 허기 +20 회복 (기본 음식) |
| [ ] | **고급 고기 (Meat)** | `food_meat.png` | 32x32 px (투명 PNG) | 허기 +50 회복 |
| [ ] | **신선한 생선 (Fish)** | `food_fish.png` | 32x32 px (투명 PNG) | 허기 +35 회복 |
| [ ] | **호감도 캔디 (Candy)** | `item_candy.png` | 32x32 px (투명 PNG) | 행복도 +40 즉시 회복 |
| [ ] | **골드 코인 이펙트** | `drop_coin.png` | 24x24 px (투명 PNG) | 클릭/타자 시 화면에 뜨는 코인 이펙트 |

---

## ⚙️ 6. UI 메뉴 라벨 & 커서 스프라이트 (Menu Labels & Cursor)
*💡 텍스트 대신 직접 그린 도트 글씨/아이콘 라벨을 넣으면 프로그램이 자동 교체합니다.*

| 제작 상태 | 요소명 | 권장 파일명 (Normal) | 활성/선택 파일명 (Active) | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [ ] | **메뉴 선택 커서** | `ui_cursor.png` | - | 12x12 px (투명 PNG) | 현재 가리키는 손가락/화살표(▶) 아이콘 |
| [ ] | **FEED (음식) 라벨** | `menu_label_feed.png` | `menu_label_feed_active.png` | 80x14 px (투명 PNG) | 메인 메뉴 'FEED (음식)' 도트 라벨 |
| [ ] | **PLAY (놀기) 라벨** | `menu_label_play.png` | `menu_label_play_active.png` | 80x14 px (투명 PNG) | 메인 메뉴 'PLAY (놀기)' 도트 라벨 |
| [ ] | **SHOP (상점) 라벨** | `menu_label_shop.png` | `menu_label_shop_active.png` | 80x14 px (투명 PNG) | 메인 메뉴 'SHOP (상점)' 도트 라벨 |
| [ ] | **STATUS (상태) 라벨**| `menu_label_status.png` | `menu_label_status_active.png`| 80x14 px (투명 PNG) | 메인 메뉴 'STATUS (상태)' 도트 라벨 |
| [ ] | **CONFIG (설정) 라벨**| `menu_label_config.png` | `menu_label_config_active.png`| 80x14 px (투명 PNG) | 메인 메뉴 'CONFIG (설정)' 도트 라벨 |
| [ ] | **메뉴 헤더 타이틀** | `ui_title_main.png` | - | 90x16 px (투명 PNG) | 메인 메뉴 상단 '= MAIN MENU =' 타이틀 |

---

## 📟 7. 상단 디지털 LCD 카운터 HUD & 숫자 폰트 (HUD & Numbers)

| 제작 상태 | 요소명 | 권장 파일명 | 대체 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [ ] | **상단 HUD 배경 바** | `hud_strip_bg.png` | `ui_top_strip.png` | 256x256 또는 100x16 px | 클릭/골드 표시 영역 전용 배경 프레임 |
| [ ] | **디지털 숫자 시트** | `font_digits.png` | `digits_0_9.png` | 가로 10칸 시트 (예: 80x12 px) | `0 1 2 3 4 5 6 7 8 9` 순서의 비트맵 숫자 폰트 |
| [ ] | **개별 숫자 스프라이트**| `digit_0.png` ~ `digit_9.png`| - | 8x12 px 각 10장 | 개별 PNG 파일로 저장할 경우 |

---

## 🔤 8. 커스텀 픽셀 폰트 (Custom Font)

| 제작 상태 | 요소명 | 권장 파일명 | 지원 확장자 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [ ] | **커스텀 픽셀 폰트 파일** | `custom_font.ttf` | `.ttf`, `.woff2`, `.otf` | `assets/sprites/` 또는 `assets/fonts/`에 넣으면 UI 전체 폰트로 자동 적용 |
| [ ] | **트레이 아이콘** | `assets/ui/tray_icon.png` | 16x16 / 32x32 px | Windows 시스템 트레이 메뉴 아이콘 |
