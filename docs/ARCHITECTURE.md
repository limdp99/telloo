# Telloo - 아키텍처 & 코드 구조

## 1. 기술 스택

| 레이어 | 기술 | 버전 |
|--------|------|------|
| Frontend | React | 18.3.1 |
| Build | Vite | 6.0.3 |
| Routing | React Router DOM | 7.10.1 |
| Backend | Supabase (PostgreSQL + Edge Functions) | JS SDK 2.87.1 |
| Hosting | Vercel | - |
| Email | Resend API | - |
| Payment | Stripe | - |

## 2. 디렉토리 구조

```
telloo/
├── docs/                        # 프로젝트 문서
├── public/                      # 정적 파일
├── src/
│   ├── App.jsx                  # 라우터 설정
│   ├── main.jsx                 # React 엔트리포인트
│   ├── lib/
│   │   └── supabase.js          # Supabase 클라이언트 (anon key만)
│   ├── context/
│   │   ├── AuthContext.jsx      # 인증 상태 (user, profile, signIn/Up/Out)
│   │   └── BoardContext.jsx     # 보드 상태 (boards, currentBoard, userRole)
│   ├── pages/
│   │   ├── Landing.jsx/css      # 랜딩 페이지 (Hero + Features + Demo + CTA)
│   │   ├── Auth.jsx/css         # 로그인/회원가입
│   │   ├── Dashboard.jsx/css    # 대시보드 (내 보드 목록)
│   │   ├── Board.jsx/css        # 보드 메인 (피드백 목록 + 필터/정렬/검색)
│   │   ├── Pricing.jsx/css      # 가격 페이지 (현재 비활성)
│   │   ├── NotFound.jsx/css     # 404
│   │   ├── BoardSettings.jsx    # (구버전, 사용안함 → BoardSettingsModal로 대체)
│   │   └── FeedbackDetail.jsx   # (구버전, 사용안함 → FeedbackDetailPanel로 대체)
│   ├── components/
│   │   ├── FeedbackCard.jsx/css         # 피드백 카드 (투표, 로그인 모달)
│   │   ├── FeedbackForm.jsx/css         # 피드백 작성 폼 (이미지 업로드)
│   │   ├── FeedbackDetailPanel.jsx/css  # 피드백 상세 슬라이드 패널
│   │   ├── BoardSettingsModal.jsx/css   # 보드 설정 모달
│   │   └── AccountSettingsModal.jsx/css # 계정 설정 모달
│   └── styles/
│       └── global.css           # 전역 스타일 + CSS 변수
├── supabase/
│   ├── functions/
│   │   ├── send-notification/index.ts      # 이메일 알림
│   │   ├── create-checkout-session/index.ts # Stripe 결제
│   │   └── stripe-webhook/index.ts          # Stripe 웹훅
│   └── seed-demo.sql            # 데모 보드 시드 데이터
└── UI/                          # UI 시안 이미지 (참고용)
```

## 3. 라우팅

| 경로 | 컴포넌트 | 인증 필요 | 설명 |
|------|----------|----------|------|
| `/` | Landing | X | 랜딩 페이지 |
| `/s/auth` | Auth | X | 로그인/회원가입 (?redirect= 지원) |
| `/s/dashboard` | Dashboard | O | 내 보드 목록 |
| `/404` | NotFound | X | 404 페이지 |
| `/:slug` | Board | X | 보드 페이지 (비로그인도 열람 가능) |
| `/:slug/feedback/:id` | FeedbackDetail | X | (구버전, 미사용) |
| `/:slug/settings` | BoardSettings | X | (구버전, 미사용) |

> **주의**: `/dashboard`가 아니라 **`/s/dashboard`**. `/dashboard`로 접근하면 `/:slug` 매칭되어 404 발생.

## 4. 데이터베이스 스키마

### 테이블 관계도

```
auth.users (Supabase 내장)
    │
    ├── profiles (1:1)
    │     id, nickname, avatar_url, created_at
    │
    ├── boards (1:N)
    │     id, owner_id, title, description, slug, accent_color, theme, logo_url, created_at
    │     │
    │     ├── feedback_posts (1:N)
    │     │     id, board_id, user_id, title, description, category, status,
    │     │     priority, ticket_number, author_name, image_url, created_at
    │     │     │
    │     │     ├── feedback_votes (1:N)
    │     │     │     post_id + user_id (PK), vote_type
    │     │     │
    │     │     └── feedback_comments (1:N)
    │     │           id, post_id, user_id, content, is_admin, image_url, created_at
    │     │           │
    │     │           └── comment_likes (1:N)
    │     │                 comment_id + user_id (PK)
    │     │
    │     └── user_roles (N:M)
    │           board_id + user_id (PK), role
    │
    └── subscriptions (1:1)
          user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end
```

### 필드 상세

#### feedback_posts.category (enum-like TEXT)
- `feature_request`
- `bug_report`
- `improvement`

#### feedback_posts.status (enum-like TEXT)
- `under_review` (기본값)
- `planned`
- `in_progress`
- `completed`
- `declined`

#### feedback_posts.priority (enum-like TEXT)
- `empty` (기본값)
- `low`
- `medium`
- `high`

#### feedback_votes.vote_type
- `up` / `down`

#### user_roles.role
- `admin` / `member`

## 5. 인증 흐름

```
앱 로드 → supabase.auth.getSession()
        → user 있으면 fetchProfile()
        → onAuthStateChange 구독 (실시간 세션 감지)

회원가입: supabase.auth.signUp({ email, password, options: { data: { nickname } } })
로그인:   supabase.auth.signInWithPassword({ email, password })
로그아웃: supabase.auth.signOut()

프로필 갱신: refreshProfile() → profiles 테이블 재조회 (페이지 리로드 없이)
```

### 권한 체크 (Board 내부)

```
보드 접근 → fetchBoardBySlug(slug)
         → board.owner_id === user.id → role = 'admin'
         → user_roles 테이블 조회 → role 값 사용
         → 해당 없으면 → role = null (일반 방문자)
```

관리자(admin)만 가능한 작업:
- 피드백 상태 변경 (under_review → planned 등)
- 피드백 우선순위 설정 (low/medium/high)
- 보드 설정 변경 (제목, slug, 테마, 색상 등)
- 보드 삭제

## 6. 주요 컴포넌트 데이터 흐름

### Board.jsx (메인 보드 페이지)
```
useEffect → fetchBoardBySlug(slug)
         → board 데이터 + feedback_posts 조회
         → 필터/정렬/검색 적용 → 렌더링

피드백 카드 클릭 → FeedbackDetailPanel 열기 (슬라이드)
설정 아이콘 클릭 → BoardSettingsModal 열기
프로필 아이콘 클릭 → 드롭다운 (Dashboard, Account, Logout)
```

### FeedbackDetailPanel.jsx (슬라이드 패널)
```
열릴 때 → fetchPost(postId)
       → post 상세 + comments + votes + voters 조회

투표 → optimistic update → supabase upsert/delete
댓글 → optimistic update → supabase insert → 이미지 업로드 (있으면)
상태 변경 → supabase update → send-notification Edge Function 호출
```

### 이메일 알림 흐름
```
이벤트 발생 (댓글, 상태변경, 새 글)
→ fetch('supabase-url/functions/v1/send-notification', { type, postId, ... })
→ Edge Function에서 수신자 결정
→ Resend API로 이메일 발송
```

## 7. 테마 시스템

### 보드별 테마
- 보드마다 `theme` (light/dark)와 `accent_color` 설정 가능
- `Board.jsx`에서 `data-theme` 속성과 `--primary` CSS 변수 동적 적용

```jsx
<div className="board-page"
     data-theme={theme}
     style={{ '--primary': accentColor }}>
```

### CSS 변수 구조

```css
/* Board.css에서 테마별 정의 */
.board-page[data-theme="dark"] {
  --background: #181818;
  --surface: #222222;
  --text: #f5f5f5;
  /* ... */
}

.board-page[data-theme="light"] {
  --background: #f5f5f7;
  --surface: #ffffff;
  --text: #1a1a1a;
  /* ... */
}

/* 액센트 컬러에서 파생 (color-mix) */
--primary-05: color-mix(in srgb, var(--primary) 5%, transparent);
--primary-10: color-mix(in srgb, var(--primary) 10%, transparent);
--primary-15: color-mix(in srgb, var(--primary) 15%, transparent);
--primary-20: color-mix(in srgb, var(--primary) 20%, transparent);
--primary-hover: color-mix(in srgb, var(--primary) 85%, black);
```

### global.css (메인 사이트 테마 - 항상 다크)
```css
:root {
  --background: #181818;
  --surface: #222222;
  --accent: #2dd4bf;
  /* ... 랜딩, 대시보드, 인증 페이지에 적용 */
}
```

## 8. 이미지 업로드

### Storage 버킷
- 버킷명: `feedback-images`
- 접근: Public (URL로 직접 접근 가능)
- 용도: 피드백 첨부 이미지, 댓글 이미지, 아바타 이미지

### 업로드 흐름
```
파일 선택 → FileReader로 base64 미리보기 → optimistic UI 표시
→ supabase.storage.from('feedback-images').upload(path, file)
→ getPublicUrl() → DB에 URL 저장
```

### 제한사항
- 최대 5MB
- 허용 형식: JPEG, PNG, GIF, WebP

## 9. 결제 시스템 (Stripe)

### 플랜 구조

| 플랜 | 가격 | 보드 수 | 추가 기능 |
|------|------|---------|----------|
| Free | $0 | 1개 | - |
| Pro | $19.99/월 | 3개 | 커스텀 브랜딩 |
| Business | $59.99/월 | 10개 | 팀 멤버 + API |

### 결제 흐름
```
Pricing 페이지 → 플랜 선택
→ create-checkout-session Edge Function
→ Stripe Checkout 페이지로 리다이렉트
→ 결제 완료 → stripe-webhook → subscriptions 테이블 업데이트
→ 대시보드에서 보드 제한 확인
```

> **참고**: Pricing 페이지 라우트는 현재 App.jsx에서 주석 처리됨.
