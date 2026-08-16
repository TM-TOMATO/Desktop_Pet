# 🎨 Desktop Pet 스프라이트 에셋 작업 체크리스트 (Sprite Checklist)

이 문서는 사용자가 직접 제작하실 다마고치 펫, 아이템, UI 에셋의 **필수 제작 목록, 파일명 규격, 추천 규격 및 제작 진행 상황**을 추적하는 체크리스트입니다. 새로운 기능이나 아이템이 추가될 때마다 개발자가 자율적으로 업데이트합니다.

---

## 📌 파일 배치 경로
모든 이미지 에셋은 아래 폴더에 지정된 파일명으로 넣어주시면 됩니다:
> 📂 `Desktop_Pet/assets/sprites/`

---

## 🐾 1. 펫 (Pet) 상태별 에셋 체크리스트

| 제작 상태 | 상태 (State) | 권장 파일명 (프레임시트) | 단일 대체 파일명 | 추천 규격 / 프레임 수 | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| [ ] | **대기 (Idle)** | `pet_idle_sheet.png` | `pet_idle.png` | 128x128 px, 4프레임 (가로 512px) | 가만히 서 있거나 조용히 숨쉬는 상태 |
| [ ] | **이동 (Walk)** | `pet_walk_sheet.png` | `pet_walk.png` | 128x128 px, 4프레임 (가로 512px) | 바탕화면을 좌/우로 걸어다니는 모습 |
| [ ] | **기쁨 (Happy)** | `pet_happy_sheet.png` | `pet_happy.png` | 128x128 px, 2~4프레임 | 쓰다듬어 주거나 기분 좋을 때 연출 |
| [ ] | **배고픔 (Hungry)**| `pet_hungry_sheet.png` | `pet_hungry.png` | 128x128 px, 2~4프레임 | 허기 수치가 20 이하일 때 표정/행동 |
| [ ] | **식사 (Eating)** | `pet_eating_sheet.png` | `pet_eating.png` | 128x128 px, 4프레임 | 음식을 냠냠 먹고 있는 모습 |
| [ ] | **수면 (Sleep)** | `pet_sleep_sheet.png` | `pet_sleep.png` | 128x128 px, 2프레임 | 잘 때 또는 눈을 감은 쿨쿨 모습 |
| [ ] | **드래그 (Drag)** | `pet_drag_sheet.png` | `pet_drag.png` | 128x128 px, 1~2프레임 | 마우스로 들고 공중에 띄웠을 때 |

---

## 🍎 2. 아이템 및 방치 보상 에셋 (Item Drops)

> 📂 저장 경로: `assets/sprites/` 또는 `assets/ui/`

| 제작 상태 | 아이템명 | 권장 파일명 | 추천 규격 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| [ ] | **사과/음식** | `food_apple.png` | 32x32 ~ 64x64 px (투명 PNG) | 펫에게 주는 기본 사과 음식 아이콘 |
| [ ] | **골드 코인** | `drop_coin.png` | 32x32 px (투명 PNG) | 방치 시 바닥에 떨어지는 골드 동전 |
| [ ] | **하트 보석** | `drop_heart.png` | 32x32 px (투명 PNG) | 방치 보상 및 호감도 드롭 하트 |
| [ ] | **트레이 아이콘** | `assets/ui/tray_icon.png` | 16x16 또는 32x32 px | Windows 시스템 트레이 메뉴 아이콘 |

---

## 🔮 3. 향후 추가 예정 에셋 (Phase 3~5 계획)

*새로운 기능 구현 시 이 섹션의 체크리스트가 최상단 메인 리스트로 승격 및 확장됩니다.*

- [ ] **펫 진화/스킨 2단계**: `pet_skin2_idle_sheet.png`, `pet_skin2_walk_sheet.png`
- [ ] **착용 악세서리**: `acc_cat_hat.png` (고양이 모자), `acc_glasses.png` (안경)
- [ ] **수집품 도감 아이콘**: `collect_gem_blue.png`, `collect_crown.png`
- [ ] **파티클 이펙트**: `particle_sparkle.png`, `particle_heart.png`

---

## 💡 에셋 제작 시 필수 가이드

1. **포맷**: 배경이 투명하게 처리된 **32-bit PNG** 포맷 사용.
2. **기준점 (Anchor)**: 캐릭터 발바닥(하단 중앙)이 바닥선 접촉 기준입니다.
3. **프레임시트 형식**:
   - 정사각형 프레임(예: 128x128)을 가로로 이어 붙인 연속 띠 형식 PNG.
   - 예시: 128x128 크기 4프레임시트 → 가로 512px, 세로 128px.
4. **대체 기능**:
   - 이미지를 넣지 않은 상태에서는 코드가 귀여운 분홍 젤리 슬라임 Fallback 캐릭터를 대신 렌더링하므로, 완벽히 준비되지 않더라도 언제든 테스트 가능합니다!
