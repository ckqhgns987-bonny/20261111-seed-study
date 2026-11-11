-- ==============================================================================
-- [스터디 블룸 (Study Bloom) - Supabase 테이블 생성 및 권한 설정 쿼리]
-- 
-- 사용 방법:
-- 1. Supabase 관리자 대시보드(https://supabase.com/dashboard)에 접속합니다.
-- 2. 본인의 프로젝트를 선택한 후 좌측 메뉴에서 [SQL Editor]를 클릭합니다.
-- 3. [New Query] 버튼을 눌러 아래의 쿼리를 전체 복사하여 붙여넣고 [Run] 버튼을 누릅니다.
-- ==============================================================================

-- 1. feedbacks 테이블 생성 (비로그인 피드백 및 응원 한마디 저장용)
-- 사용자들이 작성한 소중한 공부 후기와 익명 피드백을 저장하는 테이블입니다.
CREATE TABLE IF NOT EXISTS feedbacks (
    -- id: 각 피드백 고유 식별 번호 (자동으로 1씩 증가)
    id BIGSERIAL PRIMARY KEY,
    
    -- nickname: 작성자 닉네임 (입력하지 않으면 기본값 '익명'으로 저장됨)
    nickname VARCHAR(50) DEFAULT '익명',
    
    -- content: 피드백 내용 (필수 입력 항목이므로 빈 값 불가: NOT NULL)
    content TEXT NOT NULL,
    
    -- ai_cheer: OpenAI가 생성해준 감성 응원 한마디 (선택적 저장)
    ai_cheer TEXT,
    
    -- created_at: 피드백이 등록된 날짜 및 시간 (작성 시점의 현재 시각이 자동 입력됨)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. study_logs 테이블 생성 (공부 시간 누적 기록용)
-- 뽀모도로 타이머를 완료했을 때 몇 분 동안 집중했는지 기록하는 테이블입니다.
CREATE TABLE IF NOT EXISTS study_logs (
    -- id: 각 공부 기록의 고유 번호 (자동 증가)
    id BIGSERIAL PRIMARY KEY,
    
    -- study_minutes: 집중 공부 시간(분 단위, 음수 방지)
    study_minutes INT NOT NULL CHECK (study_minutes > 0),
    
    -- created_at: 기록 저장 날짜 및 시간
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- [보안 및 접근 권한 설정 (RLS: Row Level Security)]
-- Supabase는 기본적으로 보안 정책(RLS)을 통해 외부 접근을 통제합니다.
-- 비로그인 사용자(anon 키)가 피드백을 조회하고 새로 등록할 수 있도록 정책을 활성화합니다.
-- ==============================================================================

-- feedbacks 테이블 RLS 활성화
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- 누구나(익명 방문자 포함) 등록된 피드백 목록을 조회(SELECT)할 수 있도록 허용하는 정책
CREATE POLICY "누구나 피드백 목록을 조회할 수 있습니다"
ON feedbacks
FOR SELECT
TO anon, authenticated
USING (true);

-- 누구나 새로운 피드백을 작성(INSERT)할 수 있도록 허용하는 정책
CREATE POLICY "누구나 피드백을 작성할 수 있습니다"
ON feedbacks
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- study_logs 테이블 RLS 활성화
ALTER TABLE study_logs ENABLE ROW LEVEL SECURITY;

-- 공부 기록 조회 허용 정책
CREATE POLICY "누구나 공부 기록을 조회할 수 있습니다"
ON study_logs
FOR SELECT
TO anon, authenticated
USING (true);

-- 공부 기록 저장 허용 정책
CREATE POLICY "누구나 공부 기록을 등록할 수 있습니다"
ON study_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
