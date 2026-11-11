// ==============================================================================
// [public/app.js - 스터디 블룸 프론트엔드 핵심 제어 로직]
// 
// 본 파일은 프레임워크 없는 순수 Vanilla JavaScript (ES6+)로 작성되었으며,
// 다음 핵심 기능들을 담당합니다:
// 1. 뽀모도로 타이머 (공부/쉬는시간 카운트다운, 시작/일시정지/초기화)
// 2. 사용자가 직접 입력하는 공부시간 수동 누적 기능 (타이머 자동 합산 제거)
// 3. 일일 목표 공부시간 설정 및 누적 시간 합산
// 4. 3단계 식물 성장 시각화 (0~33% 씨앗, 34~66% 새싹, 67%~ 꽃피우기)
// 5. 비로그인 피드백 작성/조회 및 OpenAI 감성 응원 한마디 연동
// 6. 사용자 오류 토스트 안내창 표시
// ==============================================================================

// ==============================================================================
// 1. 전역 상태 변수 관리 (State Management)
// ==============================================================================
const STATE = {
    // 타이머 관련 상태
    timerMode: 'study',       // 'study'(공부시간) 또는 'break'(쉬는시간)
    isRunning: false,         // 타이머 작동 여부
    timerInterval: null,      // setInterval 인스턴스
    remainingSeconds: 25 * 60,// 남은 시간 (초 단위, 기본 25분)
    currentSetStudyMin: 25,   // 설정된 공부 시간(분)
    currentSetBreakMin: 5,    // 설정된 쉬는 시간(분)

    // 목표 및 성장 관련 상태
    goalHours: 4.0,           // 일일 목표 공부시간 (시간 단위)
    accumulatedMinutes: 0,    // 오늘 누적한 공부시간 (분 단위)
    currentStage: 1           // 1: 씨앗(Seed), 2: 새싹(Sprout), 3: 꽃(Bloom)
};

// ==============================================================================
// 2. DOM 요소 참조 캐싱
// ==============================================================================
const DOM = {
    // 타이머 요소
    timerDisplay: document.getElementById('timer-display'),
    timerStatus: document.getElementById('timer-status'),
    btnStart: document.getElementById('btn-start'),
    btnPause: document.getElementById('btn-pause'),
    btnReset: document.getElementById('btn-reset'),
    btnModeStudy: document.getElementById('btn-mode-study'),
    btnModeBreak: document.getElementById('btn-mode-break'),
    inputStudyMin: document.getElementById('input-study-min'),
    inputBreakMin: document.getElementById('input-break-min'),

    // [신규] 수동 공부시간 추가 요소
    inputManualMinutes: document.getElementById('input-manual-minutes'),
    btnAddManualTime: document.getElementById('btn-add-manual-time'),
    quickChips: document.querySelectorAll('.chip-btn'),

    // 목표 및 히어로 표시 요소
    inputGoalHours: document.getElementById('input-goal-hours'),
    btnSaveGoal: document.getElementById('btn-save-goal'),
    heroGoalDisplay: document.getElementById('hero-goal-display'),
    heroTodayDisplay: document.getElementById('hero-today-display'),
    heroStageDisplay: document.getElementById('hero-stage-display'),

    // 성장 시각화 요소
    growthStageBadge: document.getElementById('growth-stage-badge'),
    stageSeed: document.getElementById('stage-seed'),
    stageSprout: document.getElementById('stage-sprout'),
    stageBloom: document.getElementById('stage-bloom'),
    growthPercentText: document.getElementById('growth-percent-text'),
    growthProgressFill: document.getElementById('growth-progress-fill'),
    summaryAccumulated: document.getElementById('summary-accumulated'),
    summaryRemaining: document.getElementById('summary-remaining'),

    // 피드백 폼 & 목록 요소
    feedbackForm: document.getElementById('feedback-form'),
    inputNickname: document.getElementById('input-nickname'),
    inputContent: document.getElementById('input-content'),
    btnSubmitFeedback: document.getElementById('btn-submit-feedback'),
    feedbackList: document.getElementById('feedback-list'),
    feedbackCount: document.getElementById('feedback-count'),
    btnRefreshFeedback: document.getElementById('btn-refresh-feedback'),

    // 토스트 알림 컨테이너
    toastContainer: document.getElementById('toast-container')
};

// ==============================================================================
// 3. 토스트 알림창 헬퍼 함수
// ==============================================================================
/**
 * 사용자에게 알림 팝업 메시지를 띄웁니다.
 * @param {string} message - 출력할 메시지
 * @param {'success'|'error'|'info'} type - 메시지 종류 (성공/오류/정보)
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    DOM.toastContainer.appendChild(toast);

    // 3.5초 후 자연스럽게 사라짐
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ==============================================================================
// 4. 타이머 포맷팅 & 화면 업데이트
// ==============================================================================
/**
 * 초 단위 숫자를 'MM:SS' 형태의 문자열로 포맷팅합니다.
 * @param {number} totalSeconds 
 * @returns {string} 예: "25:00"
 */
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const padMin = String(minutes).padStart(2, '0');
    const padSec = String(seconds).padStart(2, '0');
    return `${padMin}:${padSec}`;
}

/**
 * 대형 타이머 숫자 및 문서 타이틀을 업데이트합니다.
 */
function renderTimer() {
    const timeText = formatTime(STATE.remainingSeconds);
    DOM.timerDisplay.textContent = timeText;

    // 브라우저 탭 제목에도 현재 남은 시간 표출
    const modeLabel = STATE.timerMode === 'study' ? '집중' : '휴식';
    document.title = `(${timeText}) ${modeLabel} 중 - 스터디 블룸`;
}

// ==============================================================================
// 5. 식물 3단계 성장 시각화 계산 & 렌더링
// ==============================================================================
/**
 * 목표 대비 달성률을 계산하고 씨앗/새싹/꽃 단계를 화면에 반영합니다.
 */
function updateGrowthDisplay() {
    // 목표 시간을 분 단위로 환산
    const goalMinutes = Math.max(1, STATE.goalHours * 60);

    // 달성률 계산 (0% ~ 100% 이상)
    const percentage = Math.min(100, Math.round((STATE.accumulatedMinutes / goalMinutes) * 100));

    // 프로그레스 바 및 퍼센트 텍스트 반영
    DOM.growthPercentText.textContent = `${percentage}%`;
    DOM.growthProgressFill.style.width = `${percentage}%`;

    // 3단계 식물 성장 판정 (PRD 기준)
    // 1단계 (0 ~ 33%): 씨앗 (Seed) 🌱
    // 2단계 (34 ~ 66%): 새싹 (Sprout) 🌿
    // 3단계 (67 ~ 100% 이상): 꽃피우기 (Bloom) 🌸
    DOM.stageSeed.classList.remove('active');
    DOM.stageSprout.classList.remove('active');
    DOM.stageBloom.classList.remove('active');

    let stageName = '';
    let stageNumber = 1;

    if (percentage < 34) {
        stageNumber = 1;
        stageName = '1단계: 씨앗 (Seed) 🌱';
        DOM.stageSeed.classList.add('active');
    } else if (percentage < 67) {
        stageNumber = 2;
        stageName = '2단계: 새싹 (Sprout) 🌿';
        DOM.stageSprout.classList.add('active');
    } else {
        stageNumber = 3;
        stageName = '3단계: 꽃피우기 (Bloom) 🌸';
        DOM.stageBloom.classList.add('active');
    }

    STATE.currentStage = stageNumber;
    DOM.growthStageBadge.textContent = stageName;
    DOM.heroStageDisplay.textContent = stageName;

    // 히어로 배너 통계 수치 갱신
    const hours = Math.floor(STATE.accumulatedMinutes / 60);
    const mins = STATE.accumulatedMinutes % 60;
    DOM.heroTodayDisplay.textContent = `${hours}시간 ${String(mins).padStart(2, '0')}분`;
    DOM.heroGoalDisplay.textContent = `${Math.floor(STATE.goalHours)}시간 ${Math.round((STATE.goalHours % 1) * 60)}분`;

    // 요약 박스 갱신
    DOM.summaryAccumulated.textContent = `${STATE.accumulatedMinutes}분 (${(STATE.accumulatedMinutes / 60).toFixed(1)}시간)`;
    const remainingMins = Math.max(0, goalMinutes - STATE.accumulatedMinutes);
    DOM.summaryRemaining.textContent = `${remainingMins}분`;

    // 로컬 스토리지에 저장하여 새로고침 시에도 유지
    localStorage.setItem('pomobloom_accumulated_mins', STATE.accumulatedMinutes);
    localStorage.setItem('pomobloom_goal_hours', STATE.goalHours);
}

// ==============================================================================
// 6. [신규 기능] 사용자가 직접 공부시간을 기록하는 로직 (수동 추가)
// ==============================================================================
/**
 * 사용자가 입력한 분 단위 공부시간을 누적 시간에 수동으로 추가합니다.
 * @param {number} minutesToAdd - 추가할 공부 시간(분)
 */
async function addManualStudyTime(minutesToAdd) {
    const minutes = parseInt(minutesToAdd, 10);

    // 유효성 검사 (음수 또는 0 이하 입력 방지)
    if (isNaN(minutes) || minutes <= 0) {
        showToast('올바른 공부시간(1분 이상)을 입력해 주세요.', 'error');
        return;
    }

    // 1. 로컬 상태에 누적 시간 합산
    STATE.accumulatedMinutes += minutes;

    // 2. 화면의 성장률 및 씨앗/새싹/꽃 그래픽 즉시 업데이트
    updateGrowthDisplay();

    // 3. 사용자 안내 토스트 메시지 표출
    showToast(`🌱 ${minutes}분이 내 공부시간에 추가되었습니다! 식물이 무럭무럭 자라납니다.`, 'success');

    // 4. 백엔드 API를 통해 Supabase study_logs 테이블에 안전하게 기록
    try {
        await fetch('/api/timer-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ study_minutes: minutes })
        });
    } catch (err) {
        console.warn('[공부 기록 저장 알림]:', err.message);
    }
}

// ==============================================================================
// 7. 뽀모도로 타이머 제어 함수들 (자동 합산 제거됨)
// ==============================================================================
/**
 * 타이머 카운트다운 시작
 */
function startTimer() {
    if (STATE.isRunning) return;

    STATE.isRunning = true;
    DOM.btnStart.disabled = true;
    DOM.btnPause.disabled = false;
    DOM.timerStatus.textContent = STATE.timerMode === 'study' ? '집중하는 중입니다... 차분히 몰입하세요 🌱' : '편안히 쉬어가는 중입니다 ☕';

    STATE.timerInterval = setInterval(() => {
        if (STATE.remainingSeconds > 0) {
            STATE.remainingSeconds--;
            renderTimer();
        } else {
            // 시간이 00:00에 도달했을 때
            completeTimer();
        }
    }, 1000);
}

/**
 * 타이머 일시정지
 */
function pauseTimer() {
    if (!STATE.isRunning) return;

    clearInterval(STATE.timerInterval);
    STATE.isRunning = false;
    DOM.btnStart.disabled = false;
    DOM.btnPause.disabled = true;
    DOM.timerStatus.textContent = '타이머가 일시정지되었습니다.';
}

/**
 * 타이머 초기화 (현재 모드의 초기 시간으로 리셋)
 */
function resetTimer() {
    pauseTimer();
    const targetMin = STATE.timerMode === 'study' ? STATE.currentSetStudyMin : STATE.currentSetBreakMin;
    STATE.remainingSeconds = targetMin * 60;
    renderTimer();
    DOM.timerStatus.textContent = '준비 완료 • 새로운 집중을 시작해보세요';
}

/**
 * 타이머 완료 처리:
 * [중요 변경사항]: 자동으로 공부시간을 합산하지 않고,
 * 사용자가 직접 [공부시간 기록하기]를 누르도록 친절하게 안내합니다.
 */
function completeTimer() {
    clearInterval(STATE.timerInterval);
    STATE.isRunning = false;
    DOM.btnStart.disabled = false;
    DOM.btnPause.disabled = true;

    if (STATE.timerMode === 'study') {
        const completedMin = STATE.currentSetStudyMin;
        
        // 자동 추가하지 않고, 사용자가 직접 추가할 수 있도록 입력창 기본값에 방금 마친 시간을 세팅해 줍니다.
        if (DOM.inputManualMinutes) {
            DOM.inputManualMinutes.value = completedMin;
        }

        showToast(`🎉 ${completedMin}분 집중 타이머가 끝났습니다! 아래 [공부시간 기록하기]를 눌러 소중한 공부시간을 직접 적립해 보세요 🌿`, 'info');

        // 쉬는시간 모드로 전환 제안
        switchTimerMode('break');
    } else {
        showToast('☕ 휴식 시간이 끝났습니다. 다시 집중을 시작해볼까요?', 'info');
        switchTimerMode('study');
    }
}

/**
 * 공부시간/쉬는시간 모드 변경
 * @param {'study'|'break'} newMode 
 */
function switchTimerMode(newMode) {
    pauseTimer();
    STATE.timerMode = newMode;

    if (newMode === 'study') {
        DOM.btnModeStudy.classList.add('active');
        DOM.btnModeBreak.classList.remove('active');
        STATE.remainingSeconds = STATE.currentSetStudyMin * 60;
        DOM.timerStatus.textContent = '공부 시간 모드 • 씨앗이 기다리고 있어요';
    } else {
        DOM.btnModeStudy.classList.remove('active');
        DOM.btnModeBreak.classList.add('active');
        STATE.remainingSeconds = STATE.currentSetBreakMin * 60;
        DOM.timerStatus.textContent = '휴식 시간 모드 • 잠시 눈을 감고 숨을 고르세요';
    }

    renderTimer();
}

// ==============================================================================
// 8. 피드백 CRUD 및 OpenAI 응원 연동 로직
// ==============================================================================
/**
 * 최신순 피드백 목록을 서버에서 불러와 화면에 렌더링합니다.
 */
async function loadFeedbacks() {
    DOM.feedbackList.innerHTML = '<div class="empty-state">피드백 목록을 불러오는 중...</div>';

    try {
        const response = await fetch('/api/feedbacks');
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || '피드백을 불러오지 못했습니다.');
        }

        const feedbacks = result.feedbacks || [];
        DOM.feedbackCount.textContent = feedbacks.length;

        if (feedbacks.length === 0) {
            DOM.feedbackList.innerHTML = '<div class="empty-state">아직 등록된 첫 피드백이 없습니다. 첫 주자가 되어보세요!</div>';
            return;
        }

        DOM.feedbackList.innerHTML = '';
        feedbacks.forEach(item => {
            const card = document.createElement('div');
            card.className = 'feedback-item';

            const createdDate = new Date(item.created_at);
            const formattedDate = isNaN(createdDate.getTime()) ? '' : createdDate.toLocaleString('ko-KR', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            card.innerHTML = `
                <div class="feedback-meta">
                    <span class="feedback-author">🌱 ${escapeHtml(item.nickname || '익명')}</span>
                    <span class="feedback-date">${formattedDate}</span>
                </div>
                <div class="feedback-content">${escapeHtml(item.content)}</div>
                ${item.ai_cheer ? `
                    <div class="feedback-ai-box">
                        <span class="ai-tag">🌸 AI 메이트의 응원:</span>
                        <span>${escapeHtml(item.ai_cheer)}</span>
                    </div>
                ` : ''}
            `;
            DOM.feedbackList.appendChild(card);
        });

    } catch (err) {
        console.error('[피드백 로드 오류]:', err);
        DOM.feedbackList.innerHTML = `<div class="empty-state" style="color: #D9534F;">⚠️ 피드백을 불러올 수 없습니다. (.env 설정 확인 필요)</div>`;
    }
}

/**
 * 새로운 피드백 등록 및 OpenAI 응원 한마디 생성
 */
async function handleFeedbackSubmit(event) {
    event.preventDefault();

    const nickname = DOM.inputNickname.value.trim();
    const content = DOM.inputContent.value.trim();

    // 유효성 검사 (PRD 예외 처리 지침)
    if (!content) {
        showToast('피드백 내용을 입력해 주세요.', 'error');
        DOM.inputContent.focus();
        return;
    }

    DOM.btnSubmitFeedback.disabled = true;
    DOM.btnSubmitFeedback.textContent = 'AI 응원 생성 및 저장 중... 🌿';

    try {
        // 1. OpenAI 기반 감성 응원 한마디 생성 호출
        let aiCheer = null;
        try {
            const aiResponse = await fetch('/api/analyze-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: content })
            });
            const aiResult = await aiResponse.json();
            if (aiResult.success) {
                aiCheer = aiResult.cheer;
            }
        } catch (aiErr) {
            console.warn('[AI 응원 생성 건너뜀]:', aiErr.message);
        }

        // 2. Supabase DB에 피드백 저장 호출
        const saveResponse = await fetch('/api/feedbacks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nickname: nickname || '익명',
                content: content,
                ai_cheer: aiCheer
            })
        });

        const saveResult = await saveResponse.json();

        if (!saveResponse.ok || !saveResult.success) {
            throw new Error(saveResult.message || '피드백 저장에 실패했습니다.');
        }

        // 성공 안내 및 폼 초기화
        showToast('피드백이 성공적으로 등록되었습니다!', 'success');
        DOM.inputContent.value = '';

        // 피드백 목록 새로고침
        await loadFeedbacks();

    } catch (err) {
        console.error('[피드백 제출 실패]:', err);
        showToast(`오류 발생: ${err.message}`, 'error');
    } finally {
        DOM.btnSubmitFeedback.disabled = false;
        DOM.btnSubmitFeedback.innerHTML = '<span>피드백 전송 및 AI 응원받기</span>';
    }
}

/**
 * XSS 공격 방지를 위한 HTML 특수문자 이스케이프 함수
 */
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

// ==============================================================================
// 9. 이벤트 리스너 등록 & 초기화 실행
// ==============================================================================
function initEventListeners() {
    // 타이머 제어 버튼들
    DOM.btnStart.addEventListener('click', startTimer);
    DOM.btnPause.addEventListener('click', pauseTimer);
    DOM.btnReset.addEventListener('click', resetTimer);

    // 모드 전환 버튼들
    DOM.btnModeStudy.addEventListener('click', () => switchTimerMode('study'));
    DOM.btnModeBreak.addEventListener('click', () => switchTimerMode('break'));

    // 시간 설정 변경 시
    DOM.inputStudyMin.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10);
        if (isNaN(val) || val <= 0) {
            showToast('공부 시간은 1분 이상이어야 합니다.', 'error');
            e.target.value = STATE.currentSetStudyMin;
            return;
        }
        STATE.currentSetStudyMin = val;
        if (STATE.timerMode === 'study' && !STATE.isRunning) {
            STATE.remainingSeconds = val * 60;
            renderTimer();
        }
    });

    DOM.inputBreakMin.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10);
        if (isNaN(val) || val <= 0) {
            showToast('쉬는 시간은 1분 이상이어야 합니다.', 'error');
            e.target.value = STATE.currentSetBreakMin;
            return;
        }
        STATE.currentSetBreakMin = val;
        if (STATE.timerMode === 'break' && !STATE.isRunning) {
            STATE.remainingSeconds = val * 60;
            renderTimer();
        }
    });

    // 목표 시간 저장 버튼
    DOM.btnSaveGoal.addEventListener('click', () => {
        const val = parseFloat(DOM.inputGoalHours.value);
        if (isNaN(val) || val <= 0) {
            showToast('올바른 목표 시간을 입력해주세요 (0.5시간 이상).', 'error');
            return;
        }
        STATE.goalHours = val;
        updateGrowthDisplay();
        showToast(`일일 목표가 ${val}시간으로 설정되었습니다.`, 'success');
    });

    // [신규] 수동 공부시간 추가 버튼 이벤트
    DOM.btnAddManualTime.addEventListener('click', () => {
        const val = parseInt(DOM.inputManualMinutes.value, 10);
        addManualStudyTime(val);
    });

    // [신규] 퀵 추가 칩 버튼 (+10분, +25분, +50분, +1시간) 이벤트
    DOM.quickChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const min = parseInt(chip.dataset.min, 10);
            DOM.inputManualMinutes.value = min;
            addManualStudyTime(min);
        });
    });

    // 피드백 관련
    DOM.feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    DOM.btnRefreshFeedback.addEventListener('click', () => {
        loadFeedbacks();
        showToast('피드백 목록을 새로고침했습니다.', 'info');
    });
}

/**
 * 앱 초기 실행 함수
 */
function initApp() {
    // 로컬 스토리지에서 이전 공부시간 및 목표 불러오기
    const savedAccumulated = localStorage.getItem('pomobloom_accumulated_mins');
    if (savedAccumulated) {
        STATE.accumulatedMinutes = parseInt(savedAccumulated, 10) || 0;
    }

    const savedGoal = localStorage.getItem('pomobloom_goal_hours');
    if (savedGoal) {
        STATE.goalHours = parseFloat(savedGoal) || 4.0;
        DOM.inputGoalHours.value = STATE.goalHours;
    }

    // 초기 화면 렌더링
    renderTimer();
    updateGrowthDisplay();
    initEventListeners();

    // 피드백 목록 로드
    loadFeedbacks();
}

// DOM 콘텐츠가 준비되면 앱 실행
document.addEventListener('DOMContentLoaded', initApp);
