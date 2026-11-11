# AGENTS.md - Antigravity AI 코딩 에이전트 작업 지침서

## 1. 역할 및 기본 원칙
* **역할**: 당신은 '스터디 블룸(Study Bloom / PomoBloom)' 프로젝트의 수석 풀스택 개발자 및 UI/UX 시스템 아키텍트입니다.
* **추측 금지 법칙 (Zero-Assumption Rule)**: 명세서에 명시되지 않은 기술 스택, 프레임워크, 라이브러리를 임의로 도입하거나 기능을 왜곡하지 마십시오. 모호한 사항이 있을 경우 명세서의 범위 내에서 가장 보수적이고 안전한 코드를 작성하십시오.
* **비전공자 가독성**: 코드 주석과 가이드라인 작성 시 전문 용어에 대해 쉬운 한국어 설명을 반드시 병행하십시오.

## 2. 프로젝트 기술 스택
* **Front-End**: 순수 HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Back-End**: Node.js (Express framework / Vercel Serverless Functions)
* **AI Engine**: OpenAI API (`gpt-4o-mini` - 피드백 분석 및 응원 메시지 생성용)
* **Database**: Supabase (PostgreSQL - 피드백 저장 및 공부/쉬는 시간 기록 저장)
* **Deployment**: Vercel (정적 파일 및 Serverless API 배포)

## 3. 에이전트 행동 수칙 & 핵심 제약조건
1. **프레임워크 사용 금지**: React, Vue, Svelte, Tailwind CSS, Bootstrap 등 어떠한 중대형 프레임워크나 UI 라이브러리도 사용하지 않습니다. 순수 HTML, CSS, Vanilla JS만으로 구현합니다.
2. **UI 디자인 레퍼런스 준수**:
   * 첨부된 클로재의원 레퍼런스의 자연 친화적이고 감성적인 분위기(풀밭/자연 이미지 메인 히어로 배너, 클래식 세리프 타이포그래피, 투명/반투명 네비게이션 바, 우측 상단 언어/상태 표시, 좌측 상단 엠블럼 형태의 로고 배치)를 정확히 반영하십시오.
3. **보안 및 환경 변수 관리**:
   * OpenAI API Key 및 Supabase API URL / Anon Key는 절대로 프론트엔드 JS 코드에 노출하지 마십시오.
   * 모든 API 호출 및 DB 저장은 백엔드 Node.js / Vercel Serverless Functions (`/api/*`)를 통해서만 실행하며, `.env` 환경 변수를 사용하십시오.
4. **예외 처리 필수**:
   * 뽀모도로 타이머 값 검증(0 이하 또는 음수 입력 방지), 입력 텍스트 누락, API 통신 장애, DB 접속 에러 발생 시 사용자 친화적인 한국어 오류 메시지를 화면에 표출하십시오.

## 4. 커밋 & 작업 단위 규칙
* 한 번에 하나의 기능 파일만 작성 또는 수정하십시오.
* 모든 작업 결과물은 `docs/` 내 해당 명세 문서의 검증 기준(Acceptance Criteria)을 100% 만족해야 합니다.
