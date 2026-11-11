// ==============================================================================
// [api/timer-log.js - 뽀모도로 공부 시간 저장 API]
// 타이머가 종료되었을 때 집중한 공부시간(분)을 Supabase study_logs 테이블에 기록합니다.
// ==============================================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your_supabase_url')) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

async function timerLogHandler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'POST 요청만 지원합니다.'
        });
    }

    if (!supabase) {
        return res.status(500).json({
            success: false,
            message: 'Supabase 연동이 설정되지 않았습니다.'
        });
    }

    try {
        const { study_minutes } = req.body;
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
            message: '서버 내부 오류가 발생했습니다.'
        });
    }
}

module.exports = timerLogHandler;

