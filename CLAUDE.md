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
- [x] 상태 필터 (Under Review, Planned, In Progress, Completed, Declined)
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
- [x] 결제 시스템 (Stripe 연동)
- [x] 이미지 업로드 (피드백 + 댓글)
- [x] 이메일 알림 (새 피드백, 상태 변경, 댓글)
- [x] 피드백 검색
- [x] Priority 필드
- [x] 투표자 목록 표시
- [x] 댓글 좋아요
- [x] 계정 설정 (닉네임/아바타 변경)
- [x] 티켓 번호 시스템

## 미구현 기능 (TODO)

### 중기
- [ ] 소셜 로그인 (Google, GitHub)
- [ ] 팀 멤버 초대/관리
- [ ] API Access (Business 플랜)
- [ ] 데이터 내보내기 (CSV)

## 파일 구조
```
src/
├── lib/supabase.js              # Supabase 클라이언트 (env var 검증 포함)
├── context/
│   ├── AuthContext.jsx          # 인증 상태 관리 (user, profile, refreshProfile)
│   └── BoardContext.jsx         # 보드 상태 관리
├── pages/
│   ├── Landing.jsx              # 랜딩 페이지 (데모 프리뷰 포함)
│   ├── Landing.css              # 랜딩 스타일
│   ├── Auth.jsx                 # 로그인/회원가입 (redirect 파라미터, open redirect 방지)
│   ├── Dashboard.jsx            # 대시보드
│   ├── Board.jsx                # 피드백 보드 (메인)
│   ├── Board.css                # 보드 스타일 (Light/Dark 테마)
│   ├── BoardSettings.css        # 보드 설정 스타일
│   ├── FeedbackDetail.jsx       # 피드백 상세 (구버전, 사용안함)
│   ├── BoardSettings.jsx        # 보드 설정 (구버전, 사용안함)
│   └── NotFound.jsx             # 404
├── components/
│   ├── FeedbackCard.jsx         # 피드백 카드 (로그인 모달 포함)
│   ├── FeedbackCard.css         # 카드 스타일
│   ├── FeedbackForm.jsx         # 피드백 작성 폼 (이미지 업로드 지원)
│   ├── FeedbackDetailPanel.jsx  # 피드백 상세 슬라이드 패널
│   ├── FeedbackDetailPanel.css  # 패널 스타일
│   ├── BoardSettingsModal.jsx   # 보드 설정 모달
│   ├── BoardSettingsModal.css   # 모달 스타일
│   ├── AccountSettingsModal.jsx # 계정 설정 모달 (닉네임/아바타 변경)
│   └── AccountSettingsModal.css # 계정 설정 스타일
├── styles/global.css            # 전역 스타일
docs/                            # 프로젝트 문서
├── SETUP.md                     # 환경 설정 가이드
├── DEPLOYMENT.md                # 배포 가이드
├── ARCHITECTURE.md              # 코드 아키텍처
├── KNOWN_ISSUES.md              # 알려진 이슈
└── CURRENT_STATUS.md            # 현재 상태
supabase/
├── seed-demo.sql                # 데모 보드 시드 데이터
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
| `/s/pricing` | Pricing | 가격 페이지 |
| `/404` | NotFound | 404 페이지 |
| `/:slug` | Board | 보드 페이지 (동적) |

**중요**: `/dashboard`가 아니라 `/s/dashboard`임! 잘못된 경로 사용 시 `/:slug`로 매칭되어 404 발생

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

## 마지막 작업 (2026-02-22)

### QA 전체 코드 리뷰 및 Critical/High 이슈 수정

전체 코드베이스를 QA 관점에서 리뷰하여 112개 이슈 발견. Critical 6개 + High 11개 = 총 17개 수정 완료.

#### 수정된 보안 이슈 (Critical)

1. **Auth.jsx - Open Redirect 방지**
   - redirect 파라미터에 `//evil.com` 같은 외부 URL 주입 차단
   - `startsWith('/') && !startsWith('//')` 검증 추가

2. **supabase.js - 환경변수 검증**
   - SUPABASE_URL, SUPABASE_ANON_KEY 없을 때 명확한 에러 메시지와 함께 즉시 실패
   - 기존: 빈 문자열로 조용히 실패

3. **send-notification - 인증 추가**
   - Authorization 헤더 검증 로직 추가
   - 인증 없이 아무나 이메일 발송 트리거 불가능하도록 수정

4. **send-notification - HTML Injection 방지**
   - 이메일 템플릿에 들어가는 모든 사용자 입력값에 escapeHtml() 적용
   - title, comment, description, boardTitle 등

5. **stripe-webhook - Webhook Secret 검증**
   - STRIPE_WEBHOOK_SECRET 미설정 시 500 에러 반환 (기존: undefined로 서명 검증 우회 가능)

6. **create-checkout-session - Open Redirect 방지**
   - Stripe 리다이렉트 URL에 `req.headers.get('origin')` 대신 `Deno.env.get('APP_URL')` 사용
   - 악의적 Origin 헤더로 리다이렉트 조작 불가능

#### 수정된 버그 (High)

7. **Dashboard.jsx - 렌더 중 navigate() 호출**
   - `navigate('/s/auth')` → `<Navigate to="/s/auth" replace />` 컴포넌트로 변경
   - React 렌더 사이클 중 상태 업데이트 경고 해결

8. **Dashboard.jsx - subscription 쿼리 에러**
   - `.single()` → `.maybeSingle()` (Free 유저는 subscription 행 없음)

9. **Landing.jsx - 데모 fetch 에러 무한 로딩**
   - try/catch 추가, 에러 시 "Could not load demo" 표시
   - STATUS_LABELS에 `declined` 누락 수정

10. **AuthContext.jsx - signOut 후 stale state**
    - signOut 시 비동기 호출 전에 user/profile 먼저 null로 초기화

11. **BoardContext.jsx - fetchUserRole stale closure**
    - `boardData` 파라미터 추가하여 최신 보드 데이터 참조
    - 로그아웃 시 userRole null로 초기화

12. **FeedbackForm.jsx - submitting 영구 비활성화**
    - 성공 시 `setSubmitting(false)` 누락 수정
    - `user.email` null guard 추가 (`user.email?.split('@')[0]`)

13. **FeedbackDetailPanel.jsx - 실패해도 알림 발송**
    - 상태 변경 DB 업데이트 성공 시에만 sendNotification 호출

14. **BoardSettingsModal.jsx - slug 예약어 미검증**
    - `s`, `api`, `admin`, `auth`, `dashboard`, `demo`, `404` 등 예약어 차단
    - slug 정규식 강화 (`/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/`)

15. **stripe-webhook - DB 에러 무시**
    - 모든 DB 작업의 에러 체크 후 500 반환 (Stripe가 재시도하도록)

16. **stripe-webhook - userId null 체크**
    - checkout.session.completed에서 userId 없을 때 400 반환

17. **send-notification - getUserById 사용**
    - `listUsers()` O(N) 전체 스캔 → `getUserById()` O(1) 직접 조회

#### 수정된 파일 (12개)
```
src/pages/Auth.jsx                              - open redirect 방지
src/pages/Dashboard.jsx                         - <Navigate>, .maybeSingle()
src/pages/Landing.jsx                           - 에러 핸들링, declined 상태
src/lib/supabase.js                             - env var 검증
src/context/AuthContext.jsx                      - signOut state 초기화
src/context/BoardContext.jsx                     - stale closure 수정
src/components/FeedbackForm.jsx                  - submitting 리셋, email null guard
src/components/FeedbackDetailPanel.jsx           - 성공 시에만 알림 발송
src/components/BoardSettingsModal.jsx            - slug 예약어 검증
supabase/functions/send-notification/index.ts    - 인증, HTML escape, getUserById
supabase/functions/create-checkout-session/index.ts - APP_URL 사용
supabase/functions/stripe-webhook/index.ts       - webhook secret 검증, DB 에러 처리
```

#### 커밋 & 배포
- 커밋: `d02f663 fix: Address critical and high severity QA issues across 12 files`
- main push → Vercel 자동 배포 완료

#### Edge Function 재배포 필요
send-notification, create-checkout-session, stripe-webhook 3개 함수가 수정됨.
Supabase Edge Function은 git push로 자동 배포되지 않으므로 별도 배포 필요:
```bash
# Production
SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy send-notification --no-verify-jwt --project-ref hspgbzgiewlqswoykybf
SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy create-checkout-session --no-verify-jwt --project-ref hspgbzgiewlqswoykybf
SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy stripe-webhook --no-verify-jwt --project-ref hspgbzgiewlqswoykybf

# Development
SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy send-notification --no-verify-jwt --project-ref kalhnkizplawebgdkcym
SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy create-checkout-session --no-verify-jwt --project-ref kalhnkizplawebgdkcym
SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy stripe-webhook --no-verify-jwt --project-ref kalhnkizplawebgdkcym
```

---

## 이전 작업 (2026-02-15)

### 랜딩 페이지 데모 카드 6개로 확장
- `.limit(4)` → `.limit(6)` 변경 (Landing.jsx)
- 커밋: `1c77e36 fix: Increase demo preview to 6 cards and fix BoardSettings.css typo`

### Pricing 카드 한 줄 표시 수정
- 다른 PC(pmstudios)에서 수정
- 커밋: `b60b3fb fix: Display pricing cards in a single row`

### 프로젝트 문서 생성
PC 이전 작업을 위한 종합 문서 5개 생성 (docs/ 폴더):
- `SETUP.md` - 환경 설정 가이드
- `DEPLOYMENT.md` - 배포 가이드
- `ARCHITECTURE.md` - 코드 아키텍처
- `KNOWN_ISSUES.md` - 알려진 이슈
- `CURRENT_STATUS.md` - 현재 상태
- 커밋: `c22df21 docs: Add comprehensive project documentation for PC migration`

---

## 이전 작업 (2026-02-08)

### 랜딩 페이지 개선
- Pricing을 nav 링크로 분리
- 라이브 데모 프리뷰 섹션 추가 (데모 보드에서 피드백 카드 fetch)
- CTA 섹션 추가
- 커밋: `911c244 feat: Improve landing page with live demo preview and CTA section`

### 데모 보드 시드 데이터 생성
- 파일: `supabase/seed-demo.sql`
- Board: Acme Software (slug: `demo`, id: `deadbeef-0000-0000-0000-000000000000`)
- Posts: 12개, Comments: 21개
- dev 환경 실행 완료

### 로그인 리다이렉트 수정
보드에서 가입/로그인 후 원래 보드로 돌아가도록 수정

### 이미지 라이트박스 모달
첨부 이미지 클릭 시 새 탭 대신 모달로 표시

### 다크/라이트 테마 밝기 조정
- 다크: 전체적으로 밝기 올림 (#0a0a0a → #181818 등)
- 라이트: Apple 스타일 오프화이트 (#ffffff → #f5f5f7)

---

## 이전 작업 (2026-01-18 - 세션 2)

### Light/Dark 테마 모드 구현
- Board.jsx: `data-theme` 속성 + `--primary` CSS 변수 동적 적용
- Board.css: Light/Dark 모드별 CSS 변수 정의
- `color-mix()` CSS 함수로 primary 파생 색상 자동 생성
- 하드코딩된 rgba(45, 212, 191, ...) → var(--primary-XX)로 교체

### 액센트 컬러 팔레트 확장
5개 → 12개 색상 (Tailwind CSS 팔레트 기반)

### 이메일 템플릿 색상 수정
모든 텍스트 요소에 명시적 색상 지정 (이메일 클라이언트 호환)

---

## 이전 작업 (2026-01-18 - 세션 1)

### Board Settings 정리
- 메뉴: General, Advanced 2개만 유지
- Delete Board 기능 구현

---

## 이전 작업 (2026-01-14)

### 계정 설정 모달 (AccountSettingsModal)
- 닉네임/아바타 변경
- 아바타 이미지 업로드 (feedback-images 버킷)
- 댓글/투표자 목록에 아바타 표시

---

## 이전 작업 (2026-01-04)

### 이메일 알림 시스템
- send-notification Edge Function (Resend)
- 4가지 자동 알림: 댓글, 상태변경, 새글(관리자), 댓글(참여자)
- 로그인 모달 팝업 구현
- comment_likes 테이블 및 FK 관계 설정

---

## 이전 작업 (2026-01-01)

### 1차~4차 통합
- UI 시안 기반 전체 리뉴얼 (슬라이드 패널, 모달, 체크마크 투표)
- 검색, 이미지 업로드, Priority, 투표자 목록, 댓글 좋아요
- Stripe 결제 연동, 커스텀 도메인 설정
- 티켓 번호 시스템

---

## 이전 작업 (2025-12-31)

### 환경 분리
- dev/prod Supabase 프로젝트 분리
- Vercel GitHub 연동 배포

---

## 배포 상태

### 현재 (2026-02-22)
- `main` 브랜치에서만 작업 (dev 브랜치 미사용)
- main push → Vercel Production 자동 배포 (정상 작동)

### 최근 커밋
```
d02f663 fix: Address critical and high severity QA issues across 12 files
b60b3fb fix: Display pricing cards in a single row
c22df21 docs: Add comprehensive project documentation for PC migration
1c77e36 fix: Increase demo preview to 6 cards and fix BoardSettings.css typo
911c244 feat: Improve landing page with live demo preview and CTA section
```

### Edge Function 배포 상태
| Function | dev | prod | 비고 |
|----------|-----|------|------|
| send-notification | 배포됨 (구버전) | 배포됨 (구버전) | 2026-02-22 코드 수정됨, 재배포 필요 |
| create-checkout-session | 배포됨 (구버전) | 배포됨 (구버전) | 2026-02-22 코드 수정됨, 재배포 필요 |
| stripe-webhook | 배포됨 (구버전) | 배포됨 (구버전) | 2026-02-22 코드 수정됨, 재배포 필요 |

### Production DB 스키마 (필요시 확인)
```sql
ALTER TABLE boards ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark';
ALTER TABLE boards ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE feedback_posts ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'empty';
ALTER TABLE feedback_posts ADD COLUMN IF NOT EXISTS ticket_number INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE feedback_comments ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id UUID REFERENCES feedback_comments ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  PRIMARY KEY (comment_id, user_id)
);
```

## 다음 작업 (TODO)

### 즉시
- [ ] Edge Function 3개 재배포 (send-notification, create-checkout-session, stripe-webhook) - dev/prod 모두

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
