# 🎨 Desktop Pet 스프라이트 에셋 작업 체크리스트 (Sprite Checklist)

이 문서는 사용자가 직접 제작하실 다마고치 펫, 아이템, UI, **기계 단말기(Machine Case) 에셋**의 **필수 제작 목록, 파일명 규격, 추천 규격 및 제작 진행 상황**을 추적하는 체크리스트입니다. 새로운 기능이나 아이템이 추가될 때마다 개발자가 자율적으로 업데이트합니다.

---

## 📌 파일 배치 경로
모든 이미지 에셋은 아래 폴더에 지정된 파일명으로 넣어주시면 됩니다:
> 📂 `Desktop_Pet/assets/sprites/`

---

## 🐾 1. 펫 (Pet) 상태별 에셋 체크리스트

| 제작 상태 | 상태 (State) | 권장 파일명 (프레임시트) | 단일 대체 파일명 | 추천 규격 / 프레임 수 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [x] | **대기 (Idle)** | `pet_idle_sheet.png` | `pet_idle.png` | 64x64 px, 4프레임 (가로 256px) | 가만히 서 있거나 조용히 숨쉬는 상태 (3fps) |
| [x] | **이동 (Walk)** | `pet_walk_sheet.png` | `pet_walk.png` | 64x64 px, 10프레임 (가로 640px) | 기계 챔버 안을 점프하며 걸어다니는 모습 |
| [ ] | **기쁨 (Happy)** | `pet_happy_sheet.png` | `pet_happy.png` | 64x64 px, 2~4프레임 | 쓰다듬어 주거나 기분 좋을 때 연출 |
| [ ] | **배고픔 (Hungry)**| `pet_hungry_sheet.png` | `pet_hungry.png` | 64x64 px, 2~4프레임 | 허기 수치가 20 이하일 때 표정/행동 |
| [ ] | **식사 (Eating)** | `pet_eating_sheet.png` | `pet_eating.png` | 64x64 px, 4프레임 | 음식을 냠냠 먹고 있는 모습 |
| [ ] | **수면 (Sleep)** | `pet_sleep_sheet.png` | `pet_sleep.png` | 64x64 px, 2프레임 | 잘 때 또는 눈을 감은 쿨쿨 모습 |
| [ ] | **드래그 (Drag)** | `pet_drag_sheet.png` | `pet_drag.png` | 64x64 px, 1~2프레임 | 마우스로 집어 공중에 띄웠을 때 |

---

## 🕹️ 2. 기계 본체 & 챔버(Machine & Chamber) 에셋 체크리스트 (NEW)

| 제작 상태 | 요소명 | 권장 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [ ] | **기계 본체 케이스** | `machine_case_bg.png` | 420x360 px (투명 PNG) | 펫을 감싸는 레트로/사이버 기계 외형 틀 |
| [ ] | **챔버 내부 배경** | `chamber_bg.png` | 380x240 px | 펫이 움직이는 내부 유리관/모니터 배경 |
| [ ] | **상단 조작 패널 바** | `ui_header_bar.png` | 420x36 px | 기계 상단 손잡이/전원 LED 바 |

---

## ⚙️ 3. UI & 설정창 에셋 체크리스트

| 제작 상태 | 아이콘/요소명 | 권장 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [ ] | **설정 버튼 아이콘** | `ui_icon_settings.png` | 32x32 px (투명 PNG) | 하단 조작 패널의 설정(⚙️) 버튼 커스텀 아이콘 |
| [ ] | **설정 창 창틀/배경** | `ui_settings_bg.png` | 320x260 px | 캐릭터 크기/히트박스 설정 모달의 배경 틀 |
| [ ] | **크기 조절 슬라이더 놉** | `ui_slider_knob.png` | 20x20 px | 크기(Scale: 50%~250%) 조절 슬라이더 핸들 |

---

## 🍎 4. 아이템 및 방치 보상 에셋 (Item Drops)

| 제작 상태 | 아이템명 | 권장 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [ ] | **사과/음식** | `food_apple.png` | 32x32 ~ 64x64 px (투명 PNG) | 펫에게 주는 기본 사과 음식 아이콘 |
| [ ] | **골드 코인** | `drop_coin.png` | 32x32 px (투명 PNG) | 방치 시 바닥에 떨어지는 골드 동전 |
| [ ] | **하트 보석** | `drop_heart.png` | 32x32 px (투명 PNG) | 방치 보상 및 호감도 드롭 하트 |
| [ ] | **트레이 아이콘** | `assets/ui/tray_icon.png` | 16x16 또는 32x32 px | Windows 시스템 트레이 메뉴 아이콘 |

---

## 🔮 5. 향후 추가 예정 에셋 (Phase 3~5 계획)

- [ ] **펫 진화/스킨 2단계**: `pet_skin2_idle_sheet.png`, `pet_skin2_walk_sheet.png`
- [ ] **착용 악세서리**: `acc_cat_hat.png` (고양이 모자), `acc_glasses.png` (안경)
- [ ] **수집품 도감 아이콘**: `collect_gem_blue.png`, `collect_crown.png`
- [ ] **파티클 이펙트**: `particle_sparkle.png`, `particle_heart.png`
