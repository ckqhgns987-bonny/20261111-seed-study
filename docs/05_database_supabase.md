# docs/05_database_supabase.md - Supabase DB 설계 및 연동 지침

## 1. 개요
비로그인 사용자 피드백 데이터 및 공부시간 누적 로그를 안전하게 보관하기 위한 Supabase PostgreSQL 스키마 설계 및 백엔드 연동 지침입니다.

## 2. DB 테이블 스키마 (`feedbacks`)

```sql
-- 피드백 저장 테이블
CREATE TABLE feedbacks (
    id BIGSERIAL PRIMARY KEY,
    nickname VARCHAR(50) DEFAULT '익명',
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 공부 기록 인덱스 (선택적)
CREATE TABLE study_logs (
    id BIGSERIAL PRIMARY KEY,
    study_minutes INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. 데이터베이스 연결 규칙
* `@supabase/supabase-js` 라이브러리를 통해 백엔드에서만 접속.
* Anonymous Key 권한을 통해 `feedbacks` 테이블에 대한 `INSERT` 및 `SELECT` 허용.
* DB 연동 실패 시에도 프론트엔드 UI 전체가 멈추지 않도록 예외 처리(`try-catch`) 블록 작성.

## 4. 완료 기준 & 검증 기준 (Acceptance Criteria)
* [ ] Supabase Dashboard의 `feedbacks` 테이블에 작성된 피드백이 누락 없이 기록되는가?
* [ ] 피드백 작성 시간이 KST/UTC 정규 포맷으로 저장되는가?
