// ==============================================================================
// [server.js - 메인 Express 백엔드 서버]
// 이 파일은 프론트엔드 정적 웹페이지(HTML, CSS, JS)를 브라우저에 제공(서빙)하고,
// 피드백 등록/조회 및 AI 응원 생성 API 요청을 중계하는 메인 서버 파일입니다.
// 로컬 실행(node server.js) 및 Vercel Serverless 환경을 모두 지원합니다.
// ==============================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 백엔드 API 핸들러 모듈 불러오기
const feedbacksHandler = require('./api/feedbacks');
const analyzeFeedbackHandler = require('./api/analyze-feedback');
const timerLogHandler = require('./api/timer-log');

// Express 어플리케이션 생성
const app = express();

// 환경 변수에서 포트 번호 가져오기 (기본값: 3000)
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
// 1. CORS 허용: 다른 도메인에서도 API 호출이 가능하도록 설정
app.use(cors());

// 2. JSON 파싱: 클라이언트에서 보내는 JSON 요청 본문(body)을 해석
app.use(express.json());

// 3. 정적 파일 서빙: public 폴더 내부의 HTML, CSS, JavaScript, 이미지 파일들을 브라우저에 제공
app.use(express.static(path.join(__dirname, 'public')));

// ==============================================================================
// [API 라우트 연결]
// 프론트엔드 자바스크립트에서 fetch('/api/...')로 호출할 엔드포인트들입니다.
// ==============================================================================

// 1. 피드백 조회(GET) 및 등록(POST)
app.all('/api/feedbacks', (req, res) => {
    feedbacksHandler(req, res);
});

// 2. OpenAI 기반 피드백 분석 및 감성 응원 한마디 생성(POST)
app.post('/api/analyze-feedback', (req, res) => {
    analyzeFeedbackHandler(req, res);
});

// 3. 뽀모도로 공부 시간 기록 저장(POST)
app.post('/api/timer-log', (req, res) => {
    timerLogHandler(req, res);
});

// 4. 서버 상태 확인용 헬스체크 엔드포인트
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Study Bloom (PomoBloom)',
        timestamp: new Date().toISOString()
    });
});

// 5. 기타 모든 경로는 메인 index.html로 연결
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==============================================================================
// [서버 시작 및 모듈 내보내기]
// 로컬 환경에서는 직접 포트를 열고, Vercel 환경에서는 app 객체를 내보냅니다.
// ==============================================================================
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log('====================================================');
        console.log(`🌸 스터디 블룸(Study Bloom) 로컬 서버가 시작되었습니다!`);
        console.log(`👉 접속 주소: http://localhost:${PORT}`);
        console.log('====================================================');
    });
}

module.exports = app;
