# docs/04_backend_api.md - 백엔드 API & OpenAI 연동 지침

## 1. 개요
Node.js Express / Vercel Serverless Functions 기반으로 피드백 CRUD API와 OpenAI API를 활용한 피드백 분석 및 응원 메시지 자동 생성 라우트를 구현합니다.

## 2. API 명세
### 1) `POST /api/feedbacks` (피드백 저장)
* Request Body: `{ "nickname": "열공이", "content": "타이머 기능이 깔끔해서 집중이 잘돼요!" }`
* Response: `{ "success": true, "data": { ... } }`

### 2) `GET /api/feedbacks` (피드백 최신순 목록 조회)
* Response:
  ```json
  {
    "success": true,
    "feedbacks": [
      { "id": 1, "nickname": "열공이", "content": "타이머 최고!", "created_at": "2026-11-11T12:00:00Z" }
    ]
  }
  ```

### 3) `POST /api/analyze-feedback` (OpenAI 연동 감성 응원 메시지 생성)
* OpenAI `gpt-4o-mini` 모델 활용.
* System Prompt:
  > "당신은 따뜻한 공부 메이트 AI입니다. 사용자가 작성한 피드백이나 오늘 공부한 소감을 읽고, 따뜻한 위로와 응원의 한마디(2문장 이내)를 한국어로 응답하세요."

## 3. 완료 기준 & 검증 기준 (Acceptance Criteria)
* [ ] `GET /api/feedbacks` 호출 시 최신순으로 정렬된 피드백 배열이 반환되는가?
* [ ] OpenAI 연동 시 3초 이내에 사용자 응원 텍스트 응답이 생성되는가?
* [ ] API 예외 발생 시 400/500 에러 상태 코드와 함께 JSON 형태의 오류 메시지를 반환하는가?
