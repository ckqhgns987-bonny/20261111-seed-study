// ==============================================================================
// [api/analyze-feedback.js - OpenAI 기반 감성 응원 한마디 생성 API]
// 로컬 Express 및 Vercel Serverless Functions 양쪽 환경에서 모두 완벽히 동작합니다.
// ==============================================================================

const OpenAI = require('openai');
require('dotenv').config();

function getOpenAIClient() {
    const rawKey = process.env.OPENAI_API_KEY;
    if (!rawKey) return null;
    const apiKey = rawKey.trim();
    if (apiKey.includes('your_openai_api_key')) return null;
    return new OpenAI({ apiKey: apiKey });
}

async function analyzeFeedbackHandler(req, res) {
    // CORS 헤더 설정
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

    const openai = getOpenAIClient();

    if (!openai) {
        return res.status(500).json({
            success: false,
            message: 'OpenAI API 키가 설정되지 않았습니다. Vercel 환경 변수(OPENAI_API_KEY)를 확인해 주세요.'
        });
    }

    try {
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch (e) { body = {}; }
        }
        body = body || {};

        const { content } = body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: '응원 메시지를 생성할 내용을 입력해 주세요.'
            });
        }

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
