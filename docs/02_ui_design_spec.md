# docs/02_ui_design_spec.md - UI/UX 디자인 구현 지침 (레퍼런스 기반)

## 1. 개요
제공된 레퍼런스 이미지(클로재의원 스타일)의 자연 친화적이고 감성적인 어반 감성을 반영하여, 스터디 블룸 서비스의 HTML/CSS 레이아웃과 디자인 시스템을 구축합니다.

## 2. 디자인 시스템
* **Color Palette**:
  * Primary Background: `#F7F8F6` (부드러운 아이보리/자연 톤)
  * Hero Overlay Text: `#FFFFFF` / Soft Dark `#2C3531`
  * Point Color: `#4A7C59` (세이지 그린 - 자연/새싹 감성)
  * Accent Flower Color: `#E8A5A5` (소프트 로즈 핑크 - 꽃피우기 단계 포인트)
* **Typography**:
  * Header/Title: Serif 계열 (Playfair Display, Cormorant Garamond 또는 한국어 감성 명조 폰트)
  * Body: Sans-serif 계열 (Pretendard, Inter)
* **Key Components (레퍼런스 요소 적용)**:
  * **Top Header**: 좌측 상단 엠블럼 로고 박스 (검은색 배경에 흰색 아이콘/텍스트 "STUDY BLOOM"), 중앙 투명 텍스트 네비게이션 메뉴 (About, Timer, Growth, Feedback), 우측 상단 "KR / EN" 모듈.
  * **Hero Banner**: 자연 들판 배경 이미지 위에 감성적인 대형 서체 타이틀 ("Close Now, Focus for Bloom") 및 서브 카피 배치.
  * **Plant Stage Card (3단계 성장)**:
    - 목표 시간 대비 현재 달성률 표시 (% 프로그레스 바)
    - 단계별 그래픽 카드:
      * 1단계 (0~33%): 씨앗 (Seed) 🌱
      * 2단계 (34~66%): 새싹 (Sprout) 🌿
      * 3단계 (67~100%): 꽃 (Bloom) 🌸

## 3. 완료 기준 & 검증 기준 (Acceptance Criteria)
* [ ] 상단 엠블럼 로고 및 메인 히어로 이미지 영역이 레퍼런스 이미지와 동일한 톤앤매너로 구현되었는가?
* [ ] 3단계 성장(씨앗/새싹/꽃) 이미지가 달성률에 따라 시각적으로 명확히 다르게 표시되는가?
* [ ] Desktop(1920px) 및 Mobile(375px) 화면에서 레이아웃이 깨짐 없이 반응형으로 작동하는가?
