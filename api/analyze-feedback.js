// ==============================================================================
// [api/analyze-feedback.js - OpenAI 기반 감성 응원 한마디 생성 API]
// 이 파일은 사용자가 작성한 소감이나 피드백을 읽고,
// OpenAI gpt-4o-mini 모델을 통해 따뜻한 응원의 한마디를 만들어주는 백엔드 API입니다.
// ==============================================================================

const OpenAI = require('openai');
require('dotenv').config();

// OpenAI API 키 환경 변수 불러오기
const apiKey = process.env.OPENAI_API_KEY;

// OpenAI 클라이언트 초기화
let openai = null;
if (apiKey && !apiKey.includes('your_openai_api_key')) {
    openai = new OpenAI({ apiKey: apiKey });
}

/**
 * OpenAI 감성 응원 메시지 생성 핸들러 함수
 * @param {import('express').Request} req - 요청 객체
 * @param {import('express').Response} res - 응답 객체
 */
async function analyzeFeedbackHandler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'POST 요청만 지원합니다.'
        });
    }

    // OpenAI API 키 설정 여부 확인
    if (!openai) {
        return res.status(500).json({
            success: false,
            message: 'OpenAI API 키가 설정되지 않았습니다. .env 파일의 OPENAI_API_KEY를 확인해 주세요.'
        });
    }

    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: '응원 메시지를 생성할 내용을 입력해 주세요.'
            });
        }

        // OpenAI gpt-4o-mini 모델 호출
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: '당신은 따뜻한 공부 메이트 AI입니다. 사용자가 작성한 피드백이나 오늘 공부한 소감을 읽고, 따뜻한 위로와 응원의 한마디(2문장 이내)를 한국어로 다정하게 응답하세요.'
                },
                {
                    role: 'user',
                    content: content
                }
            ],
            max_tokens: 150,
            temperature: 0.7
        });

        const cheerMessage = completion.choices[0]?.message?.content?.trim() || '오늘 하루도 정말 고생 많으셨어요! 당신의 노력이 예쁜 꽃으로 피어날 거예요 🌸';

        return res.status(200).json({
            success: true,
            cheer: cheerMessage
        });
    } catch (err) {
        console.error('[OpenAI 호출 에러]:', err.message);
        return res.status(500).json({
            success: false,
            message: 'AI 응원 메시지를 생성하는 도중 오류가 발생했습니다: ' + err.message
        });
    }
}

module.exports = analyzeFeedbackHandler;

