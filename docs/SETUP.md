# Telloo - 새 PC 환경 설정 가이드

## 1. 사전 요구사항

| 도구 | 버전 | 용도 |
|------|------|------|
| Node.js | 18+ | 런타임 |
| npm | 9+ | 패키지 관리 |
| Git | 2.x | 버전 관리 |
| VS Code (권장) | 최신 | 에디터 |

## 2. 프로젝트 클론 및 설치

```bash
git clone https://github.com/limdp99/telloo.git
cd telloo
npm install
```

## 3. 환경 변수 설정

`.env.example`을 복사하여 환경별 파일 생성:

```bash
cp .env.example .env.development
cp .env.example .env.production
```

### .env.development (개발용 - dev Supabase)
```
VITE_SUPABASE_URL=https://kalhnkizplawebgdkcym.supabase.co
VITE_SUPABASE_ANON_KEY=<dev anon key>
```

### .env.production (프로덕션용 - prod Supabase)
```
VITE_SUPABASE_URL=https://hspgbzgiewlqswoykybf.supabase.co
VITE_SUPABASE_ANON_KEY=<prod anon key>
```

> **anon key 확인 방법**: Supabase 대시보드 > Project Settings > API > `anon` `public` 키

### Supabase 프로젝트 정보

| 환경 | Project ID | URL |
|------|-----------|-----|
| Development | `kalhnkizplawebgdkcym` | https://kalhnkizplawebgdkcym.supabase.co |
| Production | `hspgbzgiewlqswoykybf` | https://hspgbzgiewlqswoykybf.supabase.co |

## 4. 로컬 개발 서버 실행

```bash
npm run dev
# http://localhost:5173 에서 실행 (dev Supabase 연결)
```

Vite가 `.env.development`를 자동으로 로드합니다.

## 5. 빌드

```bash
npm run build    # dist/ 폴더에 빌드 결과 생성
npm run preview  # 빌드 결과 로컬 미리보기
```

빌드 시 `.env.production`이 자동 로드됩니다.

## 6. Git 브랜치 전략

```
main  ← 프로덕션 (Vercel 자동 배포)
  │
  └── dev  ← 개발용 (Vercel Preview 배포)
```

- **작업은 항상 `dev` 브랜치에서** 진행
- 테스트 완료 후 `dev → main` 머지하여 프로덕션 배포

```bash
# 기본 작업 흐름
git checkout dev
# ... 작업 ...
git add <files>
git commit -m "feat: ..."
git push origin dev          # Preview 배포 트리거

# 프로덕션 배포
git checkout main
git merge dev
git push origin main         # Production 배포 트리거
git checkout dev             # 다시 dev로 복귀
```

## 7. Vercel 설정

- **대시보드**: https://vercel.com/phillips-projects-602ced67/telloo
- **Production URL**: https://telloo.vercel.app
- **GitHub 연동**: `limdp99/telloo` 레포에 연결됨
- **환경변수**: Vercel 대시보드에서 별도 설정됨 (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- **빌드 명령**: `vite build` (자동 감지)
- **프레임워크**: Vite (자동 감지)

### Vercel 로컬 CLI (선택사항)
```bash
npm i -g vercel
vercel login
vercel link  # 프로젝트 연결
```

> 현재 로컬 Vercel CLI 토큰이 만료됨. `vercel login`으로 재인증 필요.

## 8. Supabase CLI (Edge Function 배포용)

```bash
npm install -g supabase  # 또는 npx로 사용
```

Edge Function 배포 시 Access Token 필요:
- 토큰 생성: https://supabase.com/dashboard/account/tokens
- 토큰은 **절대 파일에 저장하지 않음** (CLI에서 직접 입력)

## 9. 주의사항

### Supabase 대시보드 설정 확인 (dev/prod 모두)
- Authentication > Providers > Email > **"Confirm email" 옵션 OFF**
- Storage > `feedback-images` 버킷이 Public으로 설정되어 있어야 함

### .gitignore에 포함된 파일 (수동 생성 필요)
```
.env.development
.env.production
.claude/settings.local.json
.vercel/
```

### Windows 환경 참고
- Git Bash 또는 WSL에서 작업 권장
- CRLF/LF 변환 경고가 나올 수 있으나 무시 가능
