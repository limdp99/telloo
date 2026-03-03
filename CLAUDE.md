# Telloo - 프로젝트 현황

## 프로젝트 개요
사용자 피드백 수집/관리 SaaS 플랫폼 (Canny, UserVoice 경쟁)

## 기술 스택
- React 18 + Vite
- Supabase (인증, DB, Storage, Edge Functions)
- React Router v7
- Stripe (결제)
- Resend (이메일)

## 환경 구성

### Git 브랜치
- `main` - 유일한 작업 브랜치 (Vercel Production 자동 배포)
- `dev` - 더 이상 사용하지 않음 (2026-02-22부터)

### 배포
- **main에 push하면 Vercel이 자동으로 Production 배포** (정상 작동 확인됨)
- Vercel 대시보드: https://vercel.com/phillips-projects-602ced67/telloo/settings
- Production URL: https://telloo.vercel.app

### 환경별 설정
| 환경 | Supabase Project ID | URL |
|------|---------------------|-----|
| Production | hspgbzgiewlqswoykybf | https://telloo.vercel.app |
| Development | kalhnkizplawebgdkcym | localhost:5173 |

### 환경 파일
- `.env.development` - 로컬 개발용 (dev Supabase)
- `.env.production` - 프로덕션용 (prod Supabase)
- Vercel 환경변수도 별도 설정됨

## 보안 가이드라인

### 민감 정보 관리
**절대 코드/파일에 저장하면 안 되는 정보:**
- Supabase Access Token (`sbp_xxx`)
- Resend API Key (`re_xxx`)
- Stripe Secret Key (`sk_xxx`)
- 기타 모든 API 키/시크릿

### 토큰 사용 시 주의사항
- CLI에서 토큰 사용 시 사용자가 직접 입력
- `.claude/settings.local.json`에 토큰 포함된 명령어 패턴 저장 금지
- 실수로 노출 시 즉시 재발급

### .gitignore 필수 항목
```
.env*
.claude/settings.local.json
```

### Edge Function 배포 방법
```bash
# 사용자가 직접 토큰 입력
SUPABASE_ACCESS_TOKEN=<사용자입력> npx supabase functions deploy <function-name> --no-verify-jwt --project-ref <project-id>
```
- dev project-ref: `kalhnkizplawebgdkcym`
- prod project-ref: `hspgbzgiewlqswoykybf`

## 실행 방법
```bash
npm run dev  # http://localhost:5173 (dev Supabase 연결)
```

## 완성된 기능

### 인증
- [x] 회원가입 (이메일/비밀번호/닉네임)
- [x] 로그인
- [x] 로그아웃
- [x] 세션 유지

### 대시보드
- [x] 내 보드 목록
- [x] 보드 생성 (제목, 설명, URL slug)
- [x] Free 플랜 1개 보드 제한 (하드코딩)

### 피드백 보드
- [x] 피드백 목록 표시
- [x] 카테고리 필터 (Feature Request, Bug Report, Improvement)
- [x] 상태 필터 (Under Review, Considering, Planned, In Progress, Completed, Declined)
- [x] 정렬 (투표순, 최신순, 댓글순)
- [x] 피드백 작성 (로그인/비로그인 모두 가능)
- [x] 익명 제출 지원

### 투표
- [x] Upvote (체크마크 스타일)
- [x] 투표 취소/변경
- [x] 비로그인시 로그인 유도 (모달 팝업)

### 피드백 상세
- [x] 상세 내용 표시 (슬라이드 패널)
- [x] 댓글 목록
- [x] 댓글 작성 (로그인 필요)
- [x] 관리자 댓글 표시 (Admin 뱃지)
- [x] 관리자 상태 변경
- [x] 이미지 라이트박스 모달

### 보드 설정
- [x] 제목/설명 수정
- [x] URL slug 변경 (예약어 검증 포함)
- [x] 액센트 컬러 변경 (12색 팔레트)
- [x] Light/Dark 테마 전환
- [x] 보드 삭제
- [x] 커스텀 도메인 (DB 저장만, 실제 라우팅 미구현)

### 추가 기능
- [x] 결제 시스템 (Stripe 연동) - Pricing UI 비활성 상태 (테스트 후 활성화 예정)
- [x] 이미지 업로드 (피드백 + 댓글)
- [x] 이메일 알림 (새 피드백, 상태 변경, 댓글)
- [x] 피드백 검색
- [x] Priority 필드
- [x] 투표자 목록 표시
- [x] 댓글 좋아요
- [x] 계정 설정 (닉네임/아바타 변경)
- [x] 티켓 번호 시스템
- [x] Toast 알림 시스템

## 미구현 기능 (TODO)

### 단기
- [ ] Pricing 페이지 활성화 (App.jsx, Dashboard.jsx 주석 해제 - Stripe 테스트 후)

### 중기
- [ ] 소셜 로그인 (Google, GitHub)
- [ ] 팀 멤버 초대/관리
- [ ] API Access (Business 플랜)
- [ ] 데이터 내보내기 (CSV)

## 파일 구조
```
src/
├── lib/
│   ├── supabase.js              # Supabase 클라이언트 (env var 검증 포함)
│   └── constants.js             # 공유 상수 (카테고리, 상태, 이미지 제한 등)
├── context/
│   ├── AuthContext.jsx          # 인증 상태 관리 (user, profile, refreshProfile)
│   └── BoardContext.jsx         # 보드 상태 관리
├── pages/
│   ├── Landing.jsx              # 랜딩 페이지 (데모 프리뷰 포함)
│   ├── Landing.css              # 랜딩 스타일
│   ├── Auth.jsx                 # 로그인/회원가입 (redirect 파라미터, open redirect 방지)
│   ├── Dashboard.jsx            # 대시보드
│   ├── Dashboard.css            # 대시보드 스타일
│   ├── Pricing.jsx              # 가격 페이지 (비활성 상태)
│   ├── Pricing.css              # 가격 스타일
│   ├── Board.jsx                # 피드백 보드 (메인)
│   ├── Board.css                # 보드 스타일 (Light/Dark 테마)
│   └── NotFound.jsx             # 404
├── components/
│   ├── FeedbackCard.jsx         # 피드백 카드 (로그인 모달 포함)
│   ├── FeedbackCard.css         # 카드 스타일
│   ├── FeedbackForm.jsx         # 피드백 작성 폼 (이미지 업로드 지원)
│   ├── FeedbackForm.css         # 폼 스타일
│   ├── FeedbackDetailPanel.jsx  # 피드백 상세 슬라이드 패널
│   ├── FeedbackDetailPanel.css  # 패널 스타일
│   ├── BoardSettingsModal.jsx   # 보드 설정 모달
│   ├── BoardSettingsModal.css   # 모달 스타일
│   ├── AccountSettingsModal.jsx # 계정 설정 모달 (닉네임/아바타 변경)
│   ├── AccountSettingsModal.css # 계정 설정 스타일
│   ├── Toast.jsx                # Toast 알림 컴포넌트 (ToastProvider, useToast)
│   └── Toast.css                # Toast 스타일
├── styles/global.css            # 전역 스타일
docs/                            # 프로젝트 문서
├── SETUP.md                     # 환경 설정 가이드
├── DEPLOYMENT.md                # 배포 가이드
├── ARCHITECTURE.md              # 코드 아키텍처
├── KNOWN_ISSUES.md              # 알려진 이슈
└── CURRENT_STATUS.md            # 현재 상태
vercel.json                          # Vercel SPA rewrite 설정
supabase/
├── seed-demo.sql                # 데모 보드 시드 데이터 (dev/prod 모두 실행 완료)
└── functions/
    ├── send-notification/       # 이메일 알림 (Resend)
    ├── create-checkout-session/ # Stripe 결제 세션 생성
    └── stripe-webhook/          # Stripe 웹훅 처리
```

## 라우팅 경로 (App.jsx)
| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/` | Landing | 랜딩 페이지 |
| `/s/auth` | Auth | 로그인/회원가입 |
| `/s/dashboard` | Dashboard | 대시보드 (내 보드 목록) |
| `/s/pricing` | Pricing | 가격 페이지 (비활성) |
| `/404` | NotFound | 404 페이지 |
| `/:slug` | Board | 보드 페이지 (동적) |

**중요**: `/dashboard`가 아니라 `/s/dashboard`임! 잘못된 경로 사용 시 `/:slug`로 매칭되어 404 발생

## 공유 상수 (src/lib/constants.js)
모든 공유 상수는 이 파일에서 관리:
- `RESERVED_SLUGS` - 예약된 slug 목록 (12개)
- `CATEGORIES` / `FILTER_CATEGORIES` - 카테고리 (폼용 / 필터용 with 'All')
- `STATUSES` / `FILTER_STATUSES` - 상태 (배열 / 필터용 with 'All Status')
- `STATUS_LABELS` / `CATEGORY_LABELS` / `CATEGORY_LABELS_SHORT` - 라벨 매핑
- `PRIORITIES` - 우선순위
- `ALLOWED_IMAGE_TYPES` - 허용 이미지 타입
- `MAX_IMAGE_SIZE` (5MB) / `MAX_AVATAR_SIZE` (2MB) - 파일 크기 제한

## Supabase 테이블 구조
- profiles: id (uuid, PK), nickname, avatar_url, created_at
- boards: id (uuid, PK), owner_id, title, description, slug (unique), accent_color, theme, logo_url, custom_domain, created_at
- feedback_posts: id (uuid, PK), board_id, user_id, title, description, category, status, priority, author_name, image_url, ticket_number, created_at
- feedback_votes: post_id + user_id (복합 PK), vote_type
- feedback_comments: id (uuid, PK), post_id, user_id, content, is_admin, image_url, created_at
- user_roles: board_id + user_id (복합 PK), role
- comment_likes: comment_id + user_id (복합 PK)
- subscriptions: user_id (PK), stripe_customer_id, stripe_subscription_id, plan, status, current_period_end

## Edge Function 환경변수 (dev/prod 모두 설정됨)
- RESEND_API_KEY
- FROM_EMAIL (Telloo <notifications@telloo.io>)
- APP_URL
- SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_PRO, STRIPE_PRICE_BUSINESS

---

## 마지막 작업 (2026-03-03)

### Color Theme Overhaul (teal → indigo)
전체 컬러 테마를 teal/mint에서 indigo/blue-tinted slate로 변경:
- Brand Primary: `#2dd4bf` (teal) → `#6366F1` (indigo)
- Dark Background: `#181818` (순수 회색) → `#0F1419` (blue-tinted slate)
- Light Background: `#f5f5f7` → `#F8F9FB` (faint blue tint)
- 기본 액센트 컬러: `#2dd4bf` → `#818CF8` (indigo-400)
- 컬러 팔레트: Tailwind 500 → 400 레벨, indigo를 첫 번째로 재배치
- 수정 파일: global.css, Board.css, Board.jsx, BoardSettingsModal.jsx 등 13개 파일

### 동적 텍스트 대비 색상 (--primary-text)
액센트 컬러 밝기에 따라 primary 배경 위 텍스트 색상 자동 전환:
- Board.jsx에서 `brightness = (R×299 + G×587 + B×114) / 1000` 공식으로 계산
- 밝은 색 (yellow, lime 등) → 어두운 텍스트 (`#1A1F36`)
- 어두운 색 (indigo, purple 등) → 흰색 텍스트 (`#FFFFFF`)
- `--primary-text` CSS 변수를 통해 모든 primary 배경 요소에 적용
- 영향 범위: btn-primary, 카테고리 버튼, 보드 로고, 아바타, 설정 모달 등

### 카테고리 뱃지 표시
- FeedbackCard: 상태 앞에 카테고리 뱃지 추가 (짧은 라벨: Feature, Bug, Improvement)
- FeedbackDetailPanel: 메타 영역에 Category 행 추가 (전체 라벨)

### Vercel SPA 라우팅 수정
- `vercel.json` 추가: `"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]`
- 동적 경로 (`/first` 등)에서 새로고침 시 404 발생하던 문제 해결

### 다크 테마 Select 드롭다운 수정
- `color-scheme: dark/light` 추가 (global.css, Board.css)
- status/priority select에 명시적 `background: var(--surface)` + `option` 스타일 지정
- 다크 모드에서 드롭다운 옵션이 흰 배경에 흰 글씨로 안 보이던 문제 해결

### BoardSettings 저장 오류 수정
- `custom_domain` 컬럼이 prod DB 스키마 캐시에 없어 저장 실패하던 문제
- update payload에서 `custom_domain`을 기본 제외, 값 있을 때만 포함

### 하드코딩 색상 정리 (전체 색상 감사)
- 모든 `color: white`/`color: var(--background)` on primary → `var(--primary-text)`
- 하드코딩된 teal rgba → CSS 변수 (`var(--primary-15)` 등)
- Dashboard business 뱃지, Landing 데모 뱃지/상태, Toast 색상 등 CSS 변수화
- FeedbackCard priority 기본색: 하드코딩 purple → `var(--primary)`

### 커밋 히스토리
```
dc15acc fix: Comprehensive color audit - use dynamic primary-text everywhere
0776b42 feat: Dynamic contrast text color based on accent luminance
df09a71 fix: Remove custom_domain from default board update payload
d14a653 fix: Style select dropdowns with explicit background for dark theme
bb097f3 fix: Add color-scheme for native select dropdowns in dark mode
1318c00 fix: Add SPA fallback rewrite for client-side routing
e16f4f7 feat: Overhaul color theme to indigo and display category badges
```

---

## 이전 작업 (2026-03-02)

### Edge Function 재배포 완료
QA에서 수정된 3개 함수 dev/prod 모두 재배포 완료:
- send-notification (인증 추가, HTML escape, getUserById)
- create-checkout-session (APP_URL 사용)
- stripe-webhook (webhook secret 검증, DB 에러 처리)

### Production DB 스키마 동기화 완료
Production Supabase에 누락된 컬럼/테이블/RLS 정책 모두 적용 확인:
- boards: theme, logo_url
- feedback_posts: priority, ticket_number
- profiles: avatar_url
- feedback_comments: image_url
- comment_likes 테이블 + RLS 정책
- boards DELETE RLS 정책

### Production 데모 시드 데이터 확인
`supabase/seed-demo.sql` 이미 prod에 적용되어 있음 확인:
- 데모 보드 1개, 포스트 12개, 댓글 21개

### 공유 상수 추출 (constants.js)
7개 파일에 중복 정의되어 있던 상수들을 `src/lib/constants.js`로 통합:
- CATEGORIES, STATUSES, STATUS_LABELS, PRIORITIES
- ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE, MAX_AVATAR_SIZE
- RESERVED_SLUGS (Dashboard와 BoardSettings 간 불일치 해소)

### Toast 알림 시스템 추가
- `Toast.jsx` / `Toast.css` 생성 (ToastProvider + useToast hook)
- App.jsx에 ToastProvider 추가
- alert() 5개소 → toast.error()로 교체

### Language 설정 UI 제거
- BoardSettingsModal에서 Language 드롭다운 제거 (DB 저장/적용 안 되는 기능이었음)

### 구버전 페이지 파일 삭제
- `FeedbackDetail.jsx` / `.css` 삭제 (FeedbackDetailPanel로 대체됨)
- `BoardSettings.jsx` / `.css` 삭제 (BoardSettingsModal로 대체됨)
- App.jsx에서 해당 라우트 제거
- CSS 4KB, JS 9KB 감소

### 커밋 히스토리
```
669c4f4 chore: Remove deprecated FeedbackDetail and BoardSettings pages
fee2794 fix: Remove non-functional language setting from board settings
a3a04ee feat: Replace alert() calls with toast notification system
43aa916 refactor: Extract shared constants to src/lib/constants.js
313b6b5 docs: Update CLAUDE.md with accurate project status
d02f663 fix: Address critical and high severity QA issues across 12 files
```

---

## 이전 작업 (2026-02-22)

### QA 전체 코드 리뷰 및 Critical/High 이슈 수정
전체 코드베이스를 QA 관점에서 리뷰하여 112개 이슈 발견. Critical 6개 + High 11개 = 총 17개 수정.

보안 수정: Auth.jsx open redirect, supabase.js env 검증, send-notification 인증/HTML escape, stripe-webhook secret 검증, create-checkout-session APP_URL

버그 수정: Dashboard navigate/maybeSingle, Landing 에러 핸들링, AuthContext signOut, BoardContext stale closure, FeedbackForm submitting, FeedbackDetailPanel 알림 조건, BoardSettingsModal slug 예약어, stripe-webhook DB 에러/userId null

---

## 이전 작업 (2026-02-15)

- 데모 카드 4개 → 6개 확장
- Pricing 카드 한 줄 표시 수정
- 프로젝트 문서 5개 생성 (docs/)

---

## 이전 작업 (2026-02-08)

- 랜딩 페이지 개선 (데모 프리뷰, CTA 섹션, Pricing nav 분리)
- 데모 보드 시드 데이터, 로그인 리다이렉트, 이미지 라이트박스
- 다크/라이트 테마 밝기 조정

---

## 이전 작업 (2026-01-18)

- Light/Dark 테마 모드 구현, 액센트 컬러 12개 확장
- 이메일 템플릿 색상 수정
- Board Settings 정리, Delete Board 구현

---

## 이전 작업 (2026-01-14)

- 계정 설정 모달 (닉네임/아바타)
- 아바타 표시 (프로필, 댓글, 투표자)

---

## 이전 작업 (2026-01-04)

- 이메일 알림 시스템 (4가지 자동 알림)
- 로그인 모달 팝업, comment_likes 테이블

---

## 이전 작업 (2026-01-01)

- UI 전체 리뉴얼 (슬라이드 패널, 모달, 체크마크 투표)
- 검색, 이미지 업로드, Priority, 투표자 목록, 댓글 좋아요
- Stripe 결제 연동, 커스텀 도메인, 티켓 번호

---

## 이전 작업 (2025-12-31)

- dev/prod 환경 분리, Vercel GitHub 연동 배포

---

## 배포 상태

### 현재 (2026-03-03)
- `main` 브랜치에서만 작업
- main push → Vercel Production 자동 배포 (정상 작동)
- `vercel.json` SPA rewrite 설정 추가됨

### 최근 커밋
```
dc15acc fix: Comprehensive color audit - use dynamic primary-text everywhere
0776b42 feat: Dynamic contrast text color based on accent luminance
df09a71 fix: Remove custom_domain from default board update payload
d14a653 fix: Style select dropdowns with explicit background for dark theme
bb097f3 fix: Add color-scheme for native select dropdowns in dark mode
1318c00 fix: Add SPA fallback rewrite for client-side routing
e16f4f7 feat: Overhaul color theme to indigo and display category badges
```

### Edge Function 배포 상태
| Function | dev | prod | 비고 |
|----------|-----|------|------|
| send-notification | 최신 배포 | 최신 배포 | 2026-03-02 재배포 완료 |
| create-checkout-session | 최신 배포 | 최신 배포 | 2026-03-02 재배포 완료 |
| stripe-webhook | 최신 배포 | 최신 배포 | 2026-03-02 재배포 완료 |

### DB 스키마 상태
- dev: 동기화 완료
- prod: 동기화 완료 (2026-03-02 확인)
- 데모 시드 데이터: dev/prod 모두 적용 완료

## 다음 작업 (TODO)

### 단기
- [ ] Pricing 페이지 활성화 (Stripe 테스트 후 App.jsx, Dashboard.jsx 주석 해제)

### 중기
- [ ] 소셜 로그인 (Google, GitHub)
- [ ] 팀 멤버 초대/관리
- [ ] API Access (Business 플랜)
- [ ] 데이터 내보내기 (CSV)

## 참고
- Supabase 대시보드에서 Authentication > Providers > Email > "Confirm email" 옵션 꺼야 함 (dev, prod 둘 다)
- main에 push → Vercel Production 자동 배포 (정상 작동)
- Supabase Access Token 생성: https://supabase.com/dashboard/account/tokens
- Edge Function은 git push로 자동 배포 안 됨 → 수동 CLI 배포 필요
