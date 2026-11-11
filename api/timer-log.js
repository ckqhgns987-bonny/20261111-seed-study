// ==============================================================================
// [api/timer-log.js - 뽀모도로 공부 시간 저장 API]
// 로컬 Express 및 Vercel Serverless Functions 양쪽 환경에서 모두 완벽히 동작합니다.
// ==============================================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

function getSupabaseClient() {
    const rawUrl = process.env.SUPABASE_URL;
    const rawKey = process.env.SUPABASE_ANON_KEY;
    if (!rawUrl || !rawKey) return null;
    const url = rawUrl.trim();
    const key = rawKey.trim();
    if (url.includes('your_supabase_url') || key.includes('your_supabase_anon_key')) return null;
    return createClient(url, key);
}

async function timerLogHandler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'POST 요청만 지원합니다.'
        });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
        return res.status(500).json({
            success: false,
            message: 'Supabase 연동이 설정되지 않았습니다. Vercel 환경 변수를 확인해 주세요.'
        });
    }

    try {
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch (e) { body = {}; }
        }
        body = body || {};

        const { study_minutes } = body;
        const minutes = parseInt(study_minutes, 10);

        if (isNaN(minutes) || minutes <= 0) {
            return res.status(400).json({
                success: false,
                message: '유효한 공부시간(분)을 입력해 주세요.'
            });
        }

        const { data, error } = await supabase
            .from('study_logs')
            .insert([{ study_minutes: minutes }])
            .select();

        if (error) {
            console.error('[Supabase study_logs 저장 에러]:', error.message);
            return res.status(500).json({
                success: false,
                message: '공부 기록 저장 중 오류 발생: ' + error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: '공부시간이 성공적으로 기록되었습니다.',
            data: data ? data[0] : null
        });
    } catch (err) {
        console.error('[서버 에러]:', err);
        return res.status(500).json({
            success: false,
            message: '서버 내부 오류가 발생했습니다: ' + err.message
        });
    }
}

module.exports = timerLogHandler;
