# docs/06_deployment_vercel.md - Vercel 배포 지침서

## 1. 개요
프로젝트 정적 자원(HTML/CSS/JS/Images)과 백엔드 Serverless API를 Vercel 플랫폼에 원클릭 배포하는 환경 및 설정 파일 정의서입니다.

## 2. `vercel.json` 파일 설정
```json
{
  "version": 2,
  "builds": [
    { "src": "public/**", "use": "@vercel/static" },
    { "src": "api/*.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/public/$1" }
  ]
}
```

## 3. 배포 순서 및 Vercel 환경 변수 세팅
1. Vercel Dashboard 또는 Vercel CLI 로그인.
2. 환경 변수(Environment Variables) 설정:
   * `OPENAI_API_KEY`
   * `SUPABASE_URL`
   * `SUPABASE_ANON_KEY`
3. `vercel --prod` 명령어 실행 또는 GitHub Push를 통한 자동 배포.

## 4. 완료 기준 & 검증 기준 (Acceptance Criteria)
* [ ] 배포 URL 접속 시 메인 자연 레퍼런스 UI가 즉시 렌더링되는가?
* [ ] 배포된 환경에서 피드백 작성 및 뽀모도로 타이머 완주 후 DB 저장이 CORS 오류 없이 원활히 작동하는가?
