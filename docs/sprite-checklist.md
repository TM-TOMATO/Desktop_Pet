# 🎨 Desktop Pet 스프라이트 & UI 에셋 종합 체크리스트 (Sprite Checklist)

이 문서는 다마고치 펫, **레트로 게임기 본체(Console Case)**, **메인 메뉴 및 5대 세부 메뉴(먹이/놀이/상점/스텟/설정)**, **액션 버튼**, **HUD 및 아이템**의 **전체 제작 목록, 권장 파일명, 규격 및 현재 제작 완료 상태**를 실시간으로 추적하는 가이드입니다.

---

## 📌 파일 배치 경로 (폴더별 구조화)
모든 이미지 에셋(PNG)은 아래와 같이 **카테고리별 하위 폴더**에 지정된 파일명으로 넣어주시면 프로그램이 **자동 감지하여 즉시 반영**합니다:
- 📂 `Desktop_Pet/assets/sprites/pet/` — 펫 모션 시트 (`pet_idle_sheet.png`, `pet_walk_sheet.png` 등)
- 📂 `Desktop_Pet/assets/sprites/console/` — 게임기 본체/스크린/카운터/버튼 (`console_case_bg.png`, `screen_bg.png`, `counter_bg.png`, `btn_*.png`)
- 📂 `Desktop_Pet/assets/sprites/menu_main/` — 메인 메뉴 및 팝업창 (`ui_modal_bg.png`, `ui_title_main.png`, `menu_label_*.png`)
- 📂 `Desktop_Pet/assets/sprites/menu_feed/` — 먹이 선택창 및 아이템 (`item_*.png`, `ui_title_feed.png`)
- 📂 `Desktop_Pet/assets/sprites/menu_play/` — 놀이 화면 및 이펙트 (`pet_happy_sheet.png`, `effect_*.png`)
- 📂 `Desktop_Pet/assets/sprites/menu_shop/` — 상점 품목 및 골드 패널 (`shop_item_*.png`, `ui_title_shop.png`)
- 📂 `Desktop_Pet/assets/sprites/menu_status/` — 상태창 및 스텟 아이콘 (`status_*.png`, `ui_title_status.png`)
- 📂 `Desktop_Pet/assets/sprites/menu_config/` — 설정창 (각 수치별 크기 라벨, 항상 위 고정 4종, 개발자 진입 라벨)
- 📂 `Desktop_Pet/assets/sprites/menu_dev/` — 개발자 도구 (히트박스/새로고침 라벨, 타이틀)
- 📂 `Desktop_Pet/assets/fonts/` — 폰트 전용 (`pixel_font.ttf`)

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
*💡 메뉴 라벨 스프라이트 자체에 선택(Active) 도트가 포함되어 있어 별도의 커서 아이콘은 필요 없습니다.*

| 제작 상태 | 요소명 | 기본 파일명 (Normal) | 활성/선택 파일명 (Active) | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [x] | **공통 모달/메뉴 팝업창** | `ui_modal_bg.png` | - | 256x256 px | 메뉴 및 팝업창 공통 배경 프레임 |
| [x] | **메인 메뉴 헤더 타이틀** | `ui_title_main.png` | - | 256x256 px | 메인 메뉴 상단 '= MAIN MENU =' 타이틀 |
| [x] | **FEED (음식) 라벨** | `menu_label_feed.png` | `menu_label_feed_active.png` | 256x256 px | 메인 메뉴 1번 'FEED' 라벨 레이어 |
| [x] | **PLAY (놀기) 라벨** | `menu_label_play.png` | `menu_label_play_active.png` | 256x256 px | 메인 메뉴 2번 'PLAY' 라벨 레이어 |
| [x] | **SHOP (상점) 라벨** | `menu_label_shop.png` | `menu_label_shop_active.png` | 256x256 px | 메인 메뉴 3번 'SHOP' 라벨 레이어 |
| [x] | **STATUS (상태) 라벨**| `menu_label_status.png` | `menu_label_status_active.png`| 256x256 px | 메인 메뉴 4번 'STATUS' 라벨 레이어 |
| [x] | **CONFIG (설정) 라벨**| `menu_label_config.png` | `menu_label_config_active.png`| 256x256 px | 메인 메뉴 5번 'CONFIG' 라벨 레이어 |

---

## 🍎 4. 먹이 (Feed) 화면 & 음식 아이템 구성
*💡 낙하 음식 애니메이션은 인벤토리 아이콘(`item_*.png`)을 그대로 재사용합니다.*

| 제작 상태 | 요소명 | 권장 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [x] | **먹이창 배경** | `ui_modal_bg.png` (공통 재활용) | 256x256 px | 먹이 선택창 팝업 배경 프레임 (공통 모달 배경 재사용) |
| [ ] | **먹이창 헤더 타이틀** | `ui_title_feed.png` | 256x256 px | 상단 '=== SELECT FOOD ===' 도트 타이틀 |
| [ ] | **🍎 사과 아이콘 & 낙하**| `item_apple.png` | 16x16 / 24x24 px | 사과 인벤토리 아이콘 및 펫 먹이 낙하 시 재사용 |
| [ ] | **🍗 고기 아이콘 & 낙하**| `item_meat.png` | 16x16 / 24x24 px | 고기 인벤토리 아이콘 및 펫 먹이 낙하 시 재사용 |
| [ ] | **🐟 생선 아이콘 & 낙하**| `item_fish.png` | 16x16 / 24x24 px | 생선 인벤토리 아이콘 및 펫 먹이 낙하 시 재사용 |
| [ ] | **🍬 캔디 아이콘 & 낙하**| `item_candy.png` | 16x16 / 24x24 px | 캔디 인벤토리 아이콘 및 펫 먹이 낙하 시 재사용 |

---

## 🎈 5. 놀이 (Play) 화면 구성

| 제작 상태 | 요소명 | 권장 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [ ] | **기쁨 점프 애니메이션**| `pet_happy_sheet.png` | 64x64 px (4프레임) | 놀아줬을 때 펫이 방방 뛰며 기뻐하는 모션 |
| [ ] | **하트 뿜뿜 이펙트** | `effect_heart.png` | 16x16 / 24x24 px | 놀아준 직후 펫 머리 위에 퐁퐁 솟아오르는 하트 |
| [ ] | **반짝이 이펙트** | `effect_sparkle.png` | 16x16 / 24x24 px | 호감도/행복도 상승 시 빛나는 도트 파티클 |

---

## 🛒 6. 상점 (Shop) 화면 구성
*💡 상점 아이템 행도 메인 메뉴 라벨처럼 선택(Active) / 비선택(Normal) 2개 레이어로 구성됩니다.*

| 제작 상태 | 요소명 | 비선택 파일명 (Normal) | 선택 파일명 (Active) | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [x] | **상점창 배경** | `ui_modal_bg.png` (공통 재활용) | - | 256x256 px | 사이버 샵 팝업 배경 프레임 (공통 모달 배경 재사용) |
| [ ] | **상점창 헤더 타이틀** | `ui_title_shop.png` | - | 256x256 px | 상단 '=== CYBER SHOP ===' 도트 타이틀 |
| [ ] | **상점 1번 (사과 10G)**| `shop_item_apple.png` | `shop_item_apple_active.png` | 256x256 px | 🍎 사과 품목 행 레이어 (이름, 아이콘, 10G 포함) |
| [ ] | **상점 2번 (고기 25G)**| `shop_item_meat.png` | `shop_item_meat_active.png` | 256x256 px | 🍗 고기 품목 행 레이어 (이름, 아이콘, 25G 포함) |
| [ ] | **상점 3번 (생선 20G)**| `shop_item_fish.png` | `shop_item_fish_active.png` | 256x256 px | 🐟 생선 품목 행 레이어 (이름, 아이콘, 20G 포함) |
| [ ] | **상점 4번 (캔디 40G)**| `shop_item_candy.png` | `shop_item_candy_active.png` | 256x256 px | 🍬 캔디 품목 행 레이어 (이름, 아이콘, 40G 포함) |
| [ ] | **보유 골드 표시 프레임**| `shop_gold_panel.png` | - | 256x256 px | 상점 상단 'GOLD: 00000G' 영역 전용 도트 프레임 |

---

## 📊 7. 스텟 / 상태 (Status) 상세 화면 구성
*💡 상세 스텟 정보(레벨, 클릭수, 골드, 허기, 행복도)를 각각 직관적인 도트 그래픽으로 커스텀할 수 있습니다.*

| 제작 상태 | 요소명 | 권장 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [x] | **상태창 배경** | `ui_modal_bg.png` (공통 재활용) | 256x256 px | 펫 상태창 팝업 배경 프레임 (공통 모달 배경 재사용) |
| [ ] | **상태창 헤더 타이틀** | `ui_title_status.png` | 256x256 px | 상단 '=== PET STATUS ===' 도트 타이틀 |
| [ ] | **스텟 전체 텍스트 레이어**| `status_labels_layer.png` | 256x256 px | '레벨', '클릭', '골드', '허기', '행복' 고정 도트 글씨 |
| [ ] | **Lv 레벨 도트 아이콘** | `status_icon_level.png` | 12x12 px | 레벨 수치 옆에 붙는 도트 뱃지/아이콘 |
| [ ] | **클릭수 도트 아이콘** | `status_icon_clicks.png` | 12x12 px | 누적 클릭수 옆에 붙는 마우스/손가락 도트 아이콘 |
| [ ] | **보유 골드 도트 아이콘**| `status_icon_gold.png` | 12x12 px | 골드 잔액 옆에 붙는 금화 코인 아이콘 |
| [ ] | **허기(밥) 도트 아이콘** | `status_icon_hunger.png` | 12x12 px | 허기 게이지 옆에 붙는 밥그릇/고기 아이콘 |
| [ ] | **행복(하트) 도트 아이콘**| `status_icon_happy.png` | 12x12 px | 행복 게이지 옆에 붙는 하트/스마일 아이콘 |
| [ ] | **게이지 바 빈 바탕틀** | `status_bar_bg.png` | 60x8 px (또는 256x256) | 허기/행복도 게이지의 빈 바탕 프레임 |
| [ ] | **허기 게이지 채움 도트**| `status_bar_fill_hunger.png` | 60x8 px | 허기 수치에 따라 채워지는 비트맵 도트 바 |
| [ ] | **행복 게이지 채움 도트**| `status_bar_fill_happy.png` | 60x8 px | 행복 수치에 따라 채워지는 비트맵 도트 바 |

---

## ⚙️ 8. 설정 (Config) 화면 구성 (`assets/sprites/menu_config/`)
*💡 크기 조절은 100%~300% (10% 단위) 각 수치마다 Normal/Active 2장씩 제작하며, 항상 위에 고정도 4상태로 분할 제작합니다.*

| 제작 상태 | 요소명 | 비선택 파일명 (Normal) | 선택 파일명 (Active) | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [x] | **설정창 배경** | `ui_modal_bg.png` (공통 재활용) | - | 256x256 px | 설정창 팝업 배경 프레임 (`menu_main` 공통 배경 재사용) |
| [ ] | **설정창 헤더 타이틀** | `ui_title_config.png` | - | 256x256 px | 상단 '=== CONFIG ===' 도트 타이틀 |
| [ ] | **크기 100% 라벨** | `config_scale_100.png` | `config_scale_100_active.png` | 256x256 px | 100% 크기 라벨 (게이지/수치 도트 포함) |
| [ ] | **크기 110% 라벨** | `config_scale_110.png` | `config_scale_110_active.png` | 256x256 px | 110% 크기 라벨 |
| [ ] | **크기 120% 라벨** | `config_scale_120.png` | `config_scale_120_active.png` | 256x256 px | 120% 크기 라벨 |
| [ ] | **크기 130% 라벨** | `config_scale_130.png` | `config_scale_130_active.png` | 256x256 px | 130% 크기 라벨 |
| [ ] | **크기 140% 라벨** | `config_scale_140.png` | `config_scale_140_active.png` | 256x256 px | 140% 크기 라벨 |
| [ ] | **크기 150% 라벨** | `config_scale_150.png` | `config_scale_150_active.png` | 256x256 px | 150% 크기 라벨 |
| [ ] | **크기 160% 라벨** | `config_scale_160.png` | `config_scale_160_active.png` | 256x256 px | 160% 크기 라벨 |
| [ ] | **크기 170% 라벨** | `config_scale_170.png` | `config_scale_170_active.png` | 256x256 px | 170% 크기 라벨 |
| [ ] | **크기 180% 라벨** | `config_scale_180.png` | `config_scale_180_active.png` | 256x256 px | 180% 크기 라벨 |
| [ ] | **크기 190% 라벨** | `config_scale_190.png` | `config_scale_190_active.png` | 256x256 px | 190% 크기 라벨 |
| [ ] | **크기 200% 라벨** | `config_scale_200.png` | `config_scale_200_active.png` | 256x256 px | 200% 크기 라벨 |
| [ ] | **크기 210% 라벨** | `config_scale_210.png` | `config_scale_210_active.png` | 256x256 px | 210% 크기 라벨 |
| [ ] | **크기 220% 라벨** | `config_scale_220.png` | `config_scale_220_active.png` | 256x256 px | 220% 크기 라벨 |
| [ ] | **크기 230% 라벨** | `config_scale_230.png` | `config_scale_230_active.png` | 256x256 px | 230% 크기 라벨 |
| [ ] | **크기 240% 라벨** | `config_scale_240.png` | `config_scale_240_active.png` | 256x256 px | 240% 크기 라벨 |
| [ ] | **크기 250% 라벨** | `config_scale_250.png` | `config_scale_250_active.png` | 256x256 px | 250% 크기 라벨 |
| [ ] | **크기 260% 라벨** | `config_scale_260.png` | `config_scale_260_active.png` | 256x256 px | 260% 크기 라벨 |
| [ ] | **크기 270% 라벨** | `config_scale_270.png` | `config_scale_270_active.png` | 256x256 px | 270% 크기 라벨 |
| [ ] | **크기 280% 라벨** | `config_scale_280.png` | `config_scale_280_active.png` | 256x256 px | 280% 크기 라벨 |
| [ ] | **크기 290% 라벨** | `config_scale_290.png` | `config_scale_290_active.png` | 256x256 px | 290% 크기 라벨 |
| [ ] | **크기 300% 라벨** | `config_scale_300.png` | `config_scale_300_active.png` | 256x256 px | 300% 크기 라벨 |
| [ ] | **항상 위 OFF (비선택)**| `config_top_off.png` | - | 256x256 px | 항상 위에 고정: 꺼짐 상태 (비선택) |
| [ ] | **항상 위 OFF (선택)**  | - | `config_top_off_active.png` | 256x256 px | 항상 위에 고정: 꺼짐 상태 (선택 중) |
| [ ] | **항상 위 ON (비선택)** | `config_top_on.png` | - | 256x256 px | 항상 위에 고정: 켜짐 상태 (비선택) |
| [ ] | **항상 위 ON (선택)**   | - | `config_top_on_active.png` | 256x256 px | 항상 위에 고정: 켜짐 상태 (선택 중) |
| [ ] | **개발자 모드 진입 라벨**| `config_label_dev.png` | `config_label_dev_active.png` | 256x256 px | '🛠️ 개발자 도구 >' 서브메뉴 진입 행 |

---

## 🛠️ 9. 개발자 도구 (Dev Tools) 화면 구성
*💡 설정 메뉴 내 '🛠️ 개발자 모드' 선택 시 진입하는 개발자 전용 서브메뉴 화면입니다.*

| 제작 상태 | 요소명 | 비선택 파일명 (Normal) | 선택 파일명 (Active) | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [x] | **개발자 도구 배경** | `ui_modal_bg.png` (공통 재활용) | - | 256x256 px | 개발자창 팝업 배경 프레임 (공통 모달 배경 재사용) |
| [ ] | **개발자 도구 헤더 타이틀**| `ui_title_dev.png` | - | 256x256 px | 상단 '=== DEV TOOLS ===' 도트 타이틀 |
| [ ] | **1번 히트박스 표시 라벨** | `dev_label_hitbox.png` | `dev_label_hitbox_active.png` | 256x256 px | '히트박스 표시' 설정 행 (선택 후 [◀/▶]로 ON/OFF) |
| [ ] | **2번 에셋 새로고침 라벨** | `dev_label_reload.png` | `dev_label_reload_active.png` | 256x256 px | '에셋 새로고침' 실행 행 (선택 후 [A]로 실행) |

---

## 🔤 10. 폰트 & 시스템 에셋

| 제작 상태 | 요소명 | 권장 파일명 | 지원 확장자 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [x] | **커스텀 픽셀 폰트 파일** | `pixel_font.ttf` | `.ttf` (Galmuri9) | 9px 정수 그리드로 선명하게 렌더링 |
| [ ] | **트레이 아이콘** | `assets/ui/tray_icon.png` | 16x16 / 32x32 px | Windows 시스템 트레이 메뉴 아이콘 |
