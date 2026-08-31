# 🎨 Desktop Pet 스프라이트 & UI 에셋 종합 체크리스트 (Sprite Checklist)

이 문서는 다마고치 펫, **레트로 게임기 본체(Console Case)**, **메인 메뉴 및 5대 세부 메뉴(먹이/놀이/상점/스텟/설정)**, **액션 버튼**, **HUD 및 아이템**의 **전체 제작 목록, 권장 파일명, 규격 및 현재 제작 완료 상태**를 실시간으로 추적하는 가이드입니다.

---

## 📌 파일 배치 경로
모든 이미지 에셋(PNG)과 폰트(TTF)는 아래 폴더에 지정된 파일명으로 넣어주시면 프로그램이 **자동 감지하여 즉시 반영**합니다:
> 📂 `Desktop_Pet/assets/sprites/`  
> 📂 `Desktop_Pet/assets/fonts/` (폰트 전용)

---

## 🐾 1. 펫 (Pet) 상태별 스프라이트

| 제작 상태 | 상태 (State) | 권장 파일명 (프레임시트) | 단일 대체 파일명 | 추천 규격 / 프레임 수 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [x] | **대기 (Idle)** | `pet_idle_sheet.png` | `pet_idle.png` | 64x64 px, 12프레임 (가로 768px) | 평상시 숨쉬거나 가만히 있는 모습 |
| [x] | **이동 (Walk)** | `pet_walk_sheet.png` | `pet_walk.png` | 64x64 px, 10프레임 (가로 640px) | 챔버 안을 점프하며 걸어다니는 모습 |
| [ ] | **기쁨 (Happy)** | `pet_happy_sheet.png` | `pet_happy.png` | 64x64 px, 2~4프레임 | 클릭/타자 시 또는 놀아줬을 때 기뻐하는 모습 |
| [ ] | **배고픔 (Hungry)**| `pet_hungry_sheet.png` | `pet_hungry.png` | 64x64 px, 2~4프레임 | 허기 수치가 20 이하일 때 축 처진 모습 |
| [ ] | **식사 (Eating)** | `pet_eating_sheet.png` | `pet_eating.png` | 64x64 px, 4프레임 | 음식을 냠냠 먹고 있는 모습 |
| [ ] | **수면 (Sleep)** | `pet_sleep_sheet.png` | `pet_sleep.png` | 64x64 px, 2프레임 | 눈을 감고 zzz 자는 모습 |
| [ ] | **드래그 (Drag)** | `pet_drag_sheet.png` | `pet_drag.png` | 64x64 px, 1~2프레임 | 마우스로 집어 공중에 띄웠을 때 버둥거리는 모습 |

---

## 🎮 2. 게임기 본체 & 조작 버튼 (Console & Controls)

| 제작 상태 | 요소명 | 일반 상태 파일명 (Normal) | 눌림 상태 파일명 (Pressed) | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [x] | **게임기 본체 케이스** | `console_case_bg.png` | - | 256x256 px | 레트로 게임기 본체 외형 (화면 부분 투명 컷아웃) |
| [x] | **LCD 스크린 배경** | `screen_bg.png` | - | 256x256 px | 펫이 활동하는 레트로 도트 LCD 화면 배경 |
| [x] | **십자키 기본 (Neutral)** | `btn_dpad.png` | - | 256x256 px | 중립 상태 십자키 외형 |
| [x] | **십자키 ▲ 상 (Up)** | `btn_dpad_pressed_up.png` | - | 256x256 px | 위쪽으로 눌린 십자키 |
| [x] | **십자키 ▼ 하 (Down)** | `btn_dpad_pressed_down.png` | - | 256x256 px | 아래쪽으로 눌린 십자키 |
| [x] | **십자키 ◀ 좌 (Left)** | `btn_dpad_pressed_left.png` | - | 256x256 px | 왼쪽으로 눌린 십자키 |
| [x] | **십자키 ▶ 우 (Right)**| `btn_dpad_pressed_right.png`| - | 256x256 px | 오른쪽으로 눌린 십자키 |
| [x] | **A 버튼 (확인/OK)** | `btn_action_a.png` | `btn_action_a_pressed.png` | 256x256 px | 메뉴 선택 / 확인용 A 버튼 |
| [x] | **B 버튼 (취소/Back)** | `btn_action_b.png` | `btn_action_b_pressed.png` | 256x256 px | 메뉴 뒤로가기 / 취소용 B 버튼 |
| [x] | **전원 버튼 (Power)** | `btn_power.png` | `btn_power_pressed.png` | 256x256 px | 짧게 누르면 종료, 10초 누르면 개발자 모드 |

---

## 📋 3. 메인 메뉴 (Main Menu) 화면 구성

| 제작 상태 | 요소명 | 기본 파일명 (Normal) | 활성/선택 파일명 (Active) | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [x] | **공통 모달/메뉴 팝업창** | `ui_modal_bg.png` | - | 256x256 px | 메뉴 및 팝업창 공통 배경 프레임 |
| [x] | **메인 메뉴 헤더 타이틀** | `ui_title_main.png` | - | 256x256 px | 메인 메뉴 상단 '= MAIN MENU =' 타이틀 |
| [x] | **FEED (음식) 라벨** | `menu_label_feed.png` | `menu_label_feed_active.png` | 256x256 px | 메인 메뉴 1번 'FEED' 라벨 레이어 |
| [x] | **PLAY (놀기) 라벨** | `menu_label_play.png` | `menu_label_play_active.png` | 256x256 px | 메인 메뉴 2번 'PLAY' 라벨 레이어 |
| [x] | **SHOP (상점) 라벨** | `menu_label_shop.png` | `menu_label_shop_active.png` | 256x256 px | 메인 메뉴 3번 'SHOP' 라벨 레이어 |
| [x] | **STATUS (상태) 라벨**| `menu_label_status.png` | `menu_label_status_active.png`| 256x256 px | 메인 메뉴 4번 'STATUS' 라벨 레이어 |
| [x] | **CONFIG (설정) 라벨**| `menu_label_config.png` | `menu_label_config_active.png`| 256x256 px | 메인 메뉴 5번 'CONFIG' 라벨 레이어 |
| [ ] | **메뉴 선택 커서** | `ui_cursor.png` | - | 12x12 px | 현재 가리키는 손가락/화살표(▶) 아이콘 |

---

## 🍎 4. 먹이 (Feed) 화면 & 음식 아이템 구성

| 제작 상태 | 요소명 | 권장 파일명 | 대체 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [ ] | **먹이창 전용 배경** | `ui_modal_feed_bg.png` | `ui_modal_bg.png` | 256x256 px | 먹이 선택창 전용 팝업 배경 프레임 |
| [ ] | **먹이창 헤더 타이틀** | `ui_title_feed.png` | - | 256x256 px | 상단 '=== SELECT FOOD ===' 도트 타이틀 |
| [ ] | **🍎 사과 아이콘 (인벤)**| `item_apple.png` | `food_apple.png` | 16x16 / 24x24 px | 인벤토리/메뉴 목록용 사과 도트 |
| [ ] | **🍗 고기 아이콘 (인벤)**| `item_meat.png` | `food_meat.png` | 16x16 / 24x24 px | 인벤토리/메뉴 목록용 고기 도트 |
| [ ] | **🐟 생선 아이콘 (인벤)**| `item_fish.png` | `food_fish.png` | 16x16 / 24x24 px | 인벤토리/메뉴 목록용 생선 도트 |
| [ ] | **🍬 캔디 아이콘 (인벤)**| `item_candy.png` | `food_candy.png` | 16x16 / 24x24 px | 인벤토리/메뉴 목록용 캔디 도트 |
| [ ] | **낙하 음식 스프라이트**| `drop_food_sheet.png`| `drop_food.png` | 24x24 px | 펫에게 먹일 때 위에서 떨어지는 음식 |

---

## 🎈 5. 놀이 (Play) 화면 구성

| 제작 상태 | 요소명 | 권장 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [ ] | **기쁨 점프 애니메이션**| `pet_happy_sheet.png` | 64x64 px (4프레임) | 놀아줬을 때 펫이 방방 뛰며 기뻐하는 모션 |
| [ ] | **하트 뿜뿜 이펙트** | `effect_heart.png` | 16x16 / 24x24 px | 놀아준 직후 펫 머리 위에 퐁퐁 솟아오르는 하트 |
| [ ] | **반짝이 이펙트** | `effect_sparkle.png` | 16x16 / 24x24 px | 호감도/행복도 상승 시 빛나는 도트 파티클 |

---

## 🛒 6. 상점 (Shop) 화면 구성

| 제작 상태 | 요소명 | 권장 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [ ] | **상점창 전용 배경** | `ui_modal_shop_bg.png` | 256x256 px | 사이버 샵 전용 팝업 배경 프레임 |
| [ ] | **상점창 헤더 타이틀** | `ui_title_shop.png` | 256x256 px | 상단 '=== CYBER SHOP ===' 도트 타이틀 |
| [ ] | **골드 코인 아이콘** | `icon_gold.png` | 10x10 / 16x16 px | 상점 골드 잔액 및 가격 옆에 표시되는 코인 |
| [ ] | **상점 1번 (사과 10G)**| `shop_item_apple.png` | 256x256 또는 80x14 px | 사과 구매 행 도트 스프라이트 |
| [ ] | **상점 2번 (고기 25G)**| `shop_item_meat.png` | 256x256 또는 80x14 px | 고기 구매 행 도트 스프라이트 |
| [ ] | **상점 3번 (생선 20G)**| `shop_item_fish.png` | 256x256 또는 80x14 px | 생선 구매 행 도트 스프라이트 |
| [ ] | **상점 4번 (캔디 40G)**| `shop_item_candy.png` | 256x256 또는 80x14 px | 캔디 구매 행 도트 스프라이트 |

---

## 📊 7. 스텟 / 상태 (Status) 화면 구성

| 제작 상태 | 요소명 | 권장 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [ ] | **상태창 전용 배경** | `ui_modal_status_bg.png`| 256x256 px | 펫 상태창 전용 팝업 배경 프레임 |
| [ ] | **상태창 헤더 타이틀** | `ui_title_status.png` | 256x256 px | 상단 '=== PET STATUS ===' 도트 타이틀 |
| [ ] | **게이지 바 빈 배경** | `ui_bar_bg.png` | 60x8 px (투명 PNG) | 허기/행복도 게이지의 빈 바탕 프레임 |
| [ ] | **허기 게이지 채움 도트**| `ui_bar_fill_hunger.png`| 60x8 px (투명 PNG) | 허기 수치에 따라 채워지는 도트 바 |
| [ ] | **행복 게이지 채움 도트**| `ui_bar_fill_happy.png` | 60x8 px (투명 PNG) | 행복 수치에 따라 채워지는 도트 바 |
| [ ] | **레벨/클릭/골드 라벨** | `ui_status_labels.png` | 256x256 px | '레벨:', '클릭:', '골드:' 텍스트 도트 레이어 |

---

## ⚙️ 8. 설정 (Config) 화면 구성

| 제작 상태 | 요소명 | 권장 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [ ] | **설정창 전용 배경** | `ui_modal_config_bg.png`| 256x256 px | 설정창 전용 팝업 배경 프레임 |
| [ ] | **설정창 헤더 타이틀** | `ui_title_config.png` | 256x256 px | 상단 '=== CONFIG ===' 도트 타이틀 |
| [ ] | **토글 스위치 ON** | `ui_toggle_on.png` | 20x10 px (투명 PNG) | '항상 위에 고정' 등 ON 상태 스위치 |
| [ ] | **토글 스위치 OFF** | `ui_toggle_off.png` | 20x10 px (투명 PNG) | '항상 위에 고정' 등 OFF 상태 스위치 |
| [ ] | **크기 조절 슬라이더** | `ui_slider_track.png` | 50x6 px (투명 PNG) | 100%~300% 크기 조절 슬라이더 트랙 |
| [ ] | **슬라이더 조절 손잡이**| `ui_slider_thumb.png` | 6x10 px (투명 PNG) | 슬라이더 위치를 나타내는 도트 노브 |

---

## 🔤 9. 폰트 & 시스템 에셋

| 제작 상태 | 요소명 | 권장 파일명 | 지원 확장자 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [x] | **커스텀 픽셀 폰트 파일** | `pixel_font.ttf` | `.ttf` (Galmuri9) | 9px 정수 그리드로 선명하게 렌더링 |
| [ ] | **트레이 아이콘** | `assets/ui/tray_icon.png` | 16x16 / 32x32 px | Windows 시스템 트레이 메뉴 아이콘 |
