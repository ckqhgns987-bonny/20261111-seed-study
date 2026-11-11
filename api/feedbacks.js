// ==============================================================================
// [api/feedbacks.js - 피드백 조회 및 저장 API]
// 이 파일은 사용자가 남긴 피드백을 Supabase 데이터베이스에 저장하거나,
// 저장된 피드백 목록을 최신순으로 가져오는 백엔드 API입니다.
// ==============================================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase 접속 정보 환경 변수 불러오기
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Supabase 클라이언트 객체 생성 (URL과 Anon Key가 입력되었을 때만 생성)
let supabase = null;
if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your_supabase_url')) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * 피드백 관련 요청을 처리하는 핸들러 함수
 * @param {import('express').Request} req - 클라이언트 요청 객체
 * @param {import('express').Response} res - 클라이언트 응답 객체
 */
async function feedbacksHandler(req, res) {
    // 1. Supabase 연동 정보가 설정되어 있는지 검증
    if (!supabase) {
        return res.status(500).json({
            success: false,
            message: 'Supabase 환경 변수(SUPABASE_URL, SUPABASE_ANON_KEY)가 올바르게 설정되지 않았습니다. .env 파일을 확인해 주세요.'
        });
    }

    // 2. GET 요청: 최신순 피드백 목록 조회
    if (req.method === 'GET') {
        try {
            // feedbacks 테이블에서 최신 작성일자(created_at) 순으로 정렬하여 조회
            const { data, error } = await supabase
                .from('feedbacks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[Supabase 조회 에러]:', error.message);
                return res.status(500).json({
                    success: false,
                    message: '피드백 목록을 불러오는 중 오류가 발생했습니다: ' + error.message
                });
            }

            return res.status(200).json({
                success: true,
                feedbacks: data || []
            });
        } catch (err) {
            console.error('[서버 내부 에러]:', err);
            return res.status(500).json({
                success: false,
                message: '서버 내부 오류가 발생했습니다.'
            });
        }
    }

    // 3. POST 요청: 새로운 피드백 등록
    if (req.method === 'POST') {
        try {
            const { nickname, content, ai_cheer } = req.body;

            // 필수값 검증: 피드백 내용(content)이 비어있는지 확인
            if (!content || !content.trim()) {
                return res.status(400).json({
                    success: false,
                    message: '피드백 내용을 입력해 주세요.'
                });
            }

            // 닉네임 기본값 처리 (입력하지 않으면 '익명')
            const finalNickname = (nickname && nickname.trim()) ? nickname.trim() : '익명';

            // 데이터베이스에 삽입할 레코드 객체
            const insertPayload = {
                nickname: finalNickname,
                content: content.trim(),
                ai_cheer: ai_cheer || null
            };

            const { data, error } = await supabase
                .from('feedbacks')
                .insert([insertPayload])
                .select();

            if (error) {
                console.error('[Supabase 저장 에러]:', error.message);
                return res.status(500).json({
                    success: false,
                    message: '피드백을 저장하는 중 오류가 발생했습니다: ' + error.message
                });
            }

            return res.status(201).json({
                success: true,
                message: '피드백이 성공적으로 등록되었습니다!',
                data: data ? data[0] : null
            });
        } catch (err) {
            console.error('[서버 내부 에러]:', err);
            return res.status(500).json({
                success: false,
                message: '서버 내부 오류가 발생했습니다.'
            });
        }
    }

    // 지원하지 않는 HTTP 메소드 예외 처리
    return res.status(405).json({
        success: false,
        message: '지원하지 않는 HTTP 메소드입니다.'
    });
}

module.exports = feedbacksHandler;

