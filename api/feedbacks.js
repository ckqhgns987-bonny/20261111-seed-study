// ==============================================================================
// [api/feedbacks.js - 피드백 조회 및 저장 API]
// 로컬 Express 서버 및 Vercel Serverless Functions 양쪽 환경에서 모두 완벽히 동작합니다.
// ==============================================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

/**
 * 안전한 Supabase 클라이언트 생성 함수
 */
function getSupabaseClient() {
    const rawUrl = process.env.SUPABASE_URL;
    const rawKey = process.env.SUPABASE_ANON_KEY;

    if (!rawUrl || !rawKey) return null;

    const url = rawUrl.trim();
    const key = rawKey.trim();

    if (url.includes('your_supabase_url') || key.includes('your_supabase_anon_key')) {
        return null;
    }

    return createClient(url, key);
}

/**
 * 피드백 관련 요청을 처리하는 메인 핸들러
 */
async function feedbacksHandler(req, res) {
    // CORS 헤더 설정 (Vercel Serverless Function 대응)
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const supabase = getSupabaseClient();

    // 1. Supabase 연동 정보가 설정되어 있는지 검증
    if (!supabase) {
        return res.status(500).json({
            success: false,
            message: 'Vercel 환경 변수(SUPABASE_URL, SUPABASE_ANON_KEY)가 설정되지 않았습니다. Vercel 대시보드에서 Environment Variables를 등록해 주세요.'
        });
    }

    // 2. GET 요청: 최신순 피드백 목록 조회
    if (req.method === 'GET') {
        try {
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
                message: '서버 내부 오류가 발생했습니다: ' + err.message
            });
        }
    }

    // 3. POST 요청: 새로운 피드백 등록
    if (req.method === 'POST') {
        try {
            // Vercel Serverless의 경우 body가 string일 수 있으므로 파싱 처리
            let body = req.body;
            if (typeof body === 'string') {
                try {
                    body = JSON.parse(body);
                } catch (e) {
                    body = {};
                }
            }
            body = body || {};

            const { nickname, content, ai_cheer } = body;

            // 필수값 검증
            if (!content || !content.trim()) {
                return res.status(400).json({
                    success: false,
                    message: '피드백 내용을 입력해 주세요.'
                });
            }

            const finalNickname = (nickname && nickname.trim()) ? nickname.trim() : '익명';

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
                message: '서버 내부 오류가 발생했습니다: ' + err.message
            });
        }
    }

    return res.status(405).json({
        success: false,
        message: '지원하지 않는 HTTP 메소드입니다.'
    });
}

module.exports = feedbacksHandler;
