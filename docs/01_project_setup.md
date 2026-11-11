# docs/01_project_setup.md - 프로젝트 생성 및 환경 설정 지침

## 1. 개요
본 문서는 스터디 블룸(PomoBloom) 프로젝트의 디렉토리 구조 초기화, Node.js 패키지 환경 구축, 그리고 환경 변수 관리 방식을 정의합니다.

## 2. 디렉토리 구조
```text
pomobloom-service/
├── public/
│   ├── index.html          # 메인 HTML
│   ├── style.css           # 레퍼런스 스타일 CSS
│   ├── app.js              # 프론트엔드 DOM/타이머/Fetch 로직
│   └── assets/             # 이미지 자원 (seed.png, sprout.png, flower.png, bg-nature.jpg 등)
├── api/
│   ├── analyze-feedback.js # OpenAI 기반 응원/분석 Serverless Function
│   ├── feedbacks.js        # Supabase 피드백 조회 및 저장 API
│   └── timer-log.js        # 공부시간 기록 API
├── .env.example
├── .gitignore
├── package.json
└── vercel.json
```

## 3. 구현 단계별 지침
1. **Node.js 환경 초기화**:
   * `npm init -y` 명령으로 `package.json` 생성.
   * 필수 패키지 설치: `express`, `@supabase/supabase-js`, `openai`, `dotenv`, `cors`.
2. **환경 변수 파일 생성 (`.env.example` 및 `.env`)**:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   PORT=3000
   ```
3. **보안 지침 (`.gitignore`)**:
   * `node_modules/`, `.env`, `.DS_Store` 등을 반드시 등록하여 GitHub 연동 시 비밀키가 유출되지 않도록 함.

## 4. 완료 기준 & 검증 기준 (Acceptance Criteria)
* [ ] `npm install` 실행 시 의존성 패키지가 에러 없이 완벽히 설치되어야 함.
* [ ] `.env`에 설정된 Supabase 및 OpenAI Key가 노드 서버/Serverless 환경에서 읽혀야 함.
* [ ] `.env` 파일이 Git 추적 대상에서 제외되어 있어야 함.
