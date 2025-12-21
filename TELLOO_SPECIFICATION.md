# Telloo - Feedback Management System Specification

## 서비스 개요

**Telloo**는 사용자 피드백을 수집, 투표, 관리하는 SaaS 플랫폼입니다. Canny, UserVoice 등의 경쟁사 대비 저렴한 가격으로 동일한 기능을 제공합니다.

## 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui 컴포넌트
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Payment**: Stripe
- **Email**: Resend API
- **i18n**: i18next (영어, 한국어, 일본어, 프랑스어, 스페인어)
- **State Management**: TanStack React Query
- **Routing**: React Router v6

---

## 핵심 정책

### 1. 서비스명
- 공식 이름은 **"Telloo"**
- 모든 브랜딩, 이메일, UI에서 일관되게 사용
- 외부 브랜딩(Made with Lovable 등) 사용 금지

### 2. 기본 언어
- 영어가 기본 언어
- 모든 UI 텍스트는 i18n으로 다국어 지원

### 3. 익명 피드백 지원 (핵심 기능)
- **피드백 작성**: 로그인 없이 가능 (`user_id`는 null 허용)
- **댓글 작성**: 로그인 없이 가능
- **이미지 업로드**: 로그인 사용자만 가능
- **투표**: 로그인 사용자만 가능

### 4. 인증 정책
- 이메일 자동 확인 활성화 (auto-confirm email signups)
- 익명 회원가입 사용 금지
- 로그인/회원가입 후 랜딩 페이지(`/`)로 이동 (보드 자동 리다이렉트 금지)
- 비밀번호 리셋은 커스텀 토큰 기반 구현

### 5. 구독 모델
- **구독은 사용자 단위** (보드 단위 아님)
- 각 사용자는 하나의 구독 플랜만 가질 수 있음
- 모든 신규 사용자는 Free 플랜으로 시작
- 생성 가능한 보드 수는 구독 티어에 따라 제한

### 6. 가격 정책 (USD)
| 플랜 | 월 가격 | 보드 수 |
|------|---------|---------|
| Free | $0 | 1 |
| Pro | $19.99 | 3 |
| Business | $59.99 | 10 |

---

## URL 라우팅 구조

### Static Routes (내부 페이지)
- `/` - 랜딩 페이지
- `/s/pricing` - 가격 페이지
- `/s/auth` - 로그인/회원가입
- `/s/super-admin` - 슈퍼 관리자 대시보드

### Board Routes (동적 슬러그)
- `/:slug` - 보드 메인 페이지
- `/:slug/feedback/:id` - 피드백 상세 페이지
- `/:slug/settings` - 보드 설정 (관리자 전용)
- `/:slug/profile` - 프로필 설정
- `/:slug/subscription` - 구독 관리

### 예약된 슬러그 (보드명으로 사용 불가)
`s`, `api`, `admin`, `auth`, `login`, `signup`, `pricing`, `super-admin`

---

## 데이터베이스 스키마

### boards
```sql
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  header_bg_color TEXT DEFAULT 'rgb(99, 102, 241)',
  accent_color TEXT DEFAULT '#8b5cf6',
  title_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#e2e8f0',
  background_color TEXT DEFAULT '#1e1b4b',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### feedback_posts
```sql
CREATE TABLE feedback_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id),
  user_id UUID, -- NULL 허용 (익명)
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category feedback_category NOT NULL, -- 'feature_request', 'bug_report', 'improvement'
  status feedback_status DEFAULT 'under_review', -- 'under_review', 'planned', 'in_progress', 'completed', 'declined'
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### feedback_comments
```sql
CREATE TABLE feedback_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES feedback_posts(id),
  user_id UUID, -- NULL 허용 (익명)
  content TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### feedback_votes
```sql
CREATE TABLE feedback_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES feedback_posts(id),
  user_id UUID NOT NULL, -- 로그인 필수
  vote_type vote_type NOT NULL, -- 'upvote', 'downvote'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);
```

### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### user_roles
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  board_id UUID NOT NULL REFERENCES boards(id),
  role app_role DEFAULT 'user', -- 'user', 'admin', 'super_admin'
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### subscription_plans
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  stripe_price_id TEXT NOT NULL,
  price_amount INTEGER NOT NULL, -- cents 단위
  currency TEXT DEFAULT 'usd',
  interval TEXT DEFAULT 'month',
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### user_subscriptions
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  stripe_subscription_id TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL, -- 'active', 'canceled', etc.
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### password_reset_tokens
```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Enums

```sql
CREATE TYPE app_role AS ENUM ('user', 'admin', 'super_admin');
CREATE TYPE feedback_category AS ENUM ('feature_request', 'bug_report', 'improvement');
CREATE TYPE feedback_status AS ENUM ('under_review', 'planned', 'in_progress', 'completed', 'declined');
CREATE TYPE vote_type AS ENUM ('upvote', 'downvote');
```

---

## Edge Functions

### 인증 관련
- `request-password-reset` - 비밀번호 리셋 요청 처리
- `reset-password` - 토큰 검증 및 비밀번호 변경
- `send-password-reset` - 리셋 이메일 발송

### 이메일 관련
- `send-welcome-email` - 회원가입 환영 이메일
- `send-notification` - 댓글/상태변경 알림 이메일

### 결제 관련
- `create-subscription` - Stripe Checkout 세션 생성
- `verify-subscription` - 결제 완료 확인
- `manage-subscription` - Stripe Customer Portal 세션 생성
- `stripe-webhook` - Stripe 웹훅 처리

### 사용자 관리
- `delete-user` - 사용자 삭제

---

## 핵심 기능

### 1. 피드백 보드
- 무한 스크롤 (페이지당 10개)
- 카테고리/상태별 필터링
- 업보트/다운보트 투표 시스템
- 이미지 첨부 지원

### 2. 피드백 상세
- 댓글 시스템 (관리자 댓글은 특별 표시)
- 관리자는 상태 변경 가능
- 댓글에 이미지 첨부 가능

### 3. 보드 설정 (관리자)
- 로고 업로드
- 타이틀/설명 변경
- URL 슬러그 변경
- 테마 색상 설정 (5가지: header, accent, title, text, background)

### 4. Admin 모달
- 보드 선택/생성
- 구독 관리
- 모달 형태로 표시 (전체 페이지 이동 아님)

### 5. Super Admin 대시보드
- 전체 관리자 목록
- 활성 구독 현황
- 전체 보드 목록
- 매출 통계

---

## UI/UX 정책

### 헤더 레이아웃
- 오른쪽 정렬: 언어 선택, 프로필, 로그인/로그아웃
- 관리자용 버튼(Admin, Settings)은 별도 행에 텍스트 레이블과 함께 표시

### 비밀번호 입력
- 모든 비밀번호 입력에 표시/숨김 토글 버튼

### 로딩 화면
- 단순 스피너만 표시
- 디버그 정보 표시 금지

### 색상 커스터마이징
- 5가지 색상 변수: Header, Accent, Title, Text, Background
- Accent 색상은 "Submit Feedback" 버튼에 적용

---

## 이메일 발송 조건

1. **환영 이메일**: 회원가입 시
2. **비밀번호 리셋**: 리셋 요청 시
3. **댓글 알림**: 다른 사람이 내 피드백에 댓글 작성 시 (본인 제외)
4. **상태 변경 알림**: 관리자가 피드백 상태 변경 시 (본인 제외)

---

## Storage

- **버킷명**: `feedback-images`
- **용도**: 피드백 이미지, 댓글 이미지, 아바타, 보드 로고
- **파일 크기 제한**: 5MB
- **허용 형식**: JPEG, PNG, GIF, WEBP

---

## 비밀번호 정책

- 최소 8자
- 영문자와 숫자 포함 필수
- 최대 128자

---

## 필수 Secrets

- `STRIPE_SECRET_KEY` - Stripe 결제
- `RESEND_API_KEY` - 이메일 발송
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

---

## 보드 슬러그 규칙

- 영문 소문자, 숫자, 하이픈만 허용
- 2~50자
- 예약어 사용 불가
- 중복 불가

---

## Context 관리

### BoardContext
- `currentBoard`: 현재 선택된 보드
- `boards`: 전체 보드 목록
- `setCurrentBoardId`: 현재 보드 설정 (네비게이션 하지 않음)
- `createBoard`: 새 보드 생성
- `refreshBoards`: 보드 목록 새로고침

**중요**: BoardContext는 상태 관리만 담당. URL 리다이렉션은 페이지 컴포넌트에서 처리.

---

## 다국어 지원 (i18n)

### 지원 언어
- English (en) - 기본
- Korean (ko)
- Japanese (ja)
- French (fr)
- Spanish (es)

### 저장 방식
- `localStorage`에 `language` 키로 저장
- 각 언어 파일: `src/i18n/locales/{lang}.json`

---

## RLS (Row Level Security) 정책 요약

- **boards**: 누구나 읽기 가능, 소유자만 수정/삭제
- **feedback_posts**: 누구나 읽기/생성, 작성자만 수정
- **feedback_comments**: 누구나 읽기/생성
- **feedback_votes**: 로그인 사용자만 생성, 본인 투표만 수정/삭제
- **profiles**: 누구나 읽기, 본인만 수정
- **user_roles**: 관련 사용자만 읽기
- **user_subscriptions**: 본인만 읽기/수정
- **subscription_plans**: 누구나 읽기

---

## 주요 컴포넌트 구조

```
src/
├── components/
│   ├── ui/              # shadcn 컴포넌트
│   ├── FeedbackForm.tsx
│   ├── FeedbackCard.tsx
│   ├── VoteButtons.tsx
│   ├── FilterBar.tsx
│   ├── CategoryBadge.tsx
│   ├── StatusBadge.tsx
│   ├── AdminDialog.tsx
│   ├── AdminBoardSelector.tsx
│   ├── BoardSelector.tsx
│   └── LanguageSelector.tsx
├── pages/
│   ├── Landing.tsx      # 랜딩 페이지
│   ├── Index.tsx        # 보드 메인 페이지
│   ├── FeedbackDetail.tsx
│   ├── Auth.tsx         # 로그인/회원가입/비밀번호 리셋
│   ├── BoardSettings.tsx
│   ├── Profile.tsx
│   ├── Subscription.tsx
│   ├── Pricing.tsx
│   ├── SuperAdmin.tsx
│   └── NotFound.tsx
├── contexts/
│   └── BoardContext.tsx
├── i18n/
│   ├── config.ts
│   └── locales/
│       ├── en.json
│       ├── ko.json
│       ├── ja.json
│       ├── fr.json
│       └── es.json
└── integrations/
    └── supabase/
        ├── client.ts
        └── types.ts
```

---

## 알려진 버그/주의사항

1. 존재하지 않는 보드 슬러그 접근 시 404 대신 첫 번째 보드로 리다이렉트되는 버그 있음
2. Resend API는 테스트 모드에서 화이트리스트 주소만 이메일 발송 가능

---

## 빌드 시 주의사항

- 모든 색상은 HSL 형식으로 index.css에 정의
- Tailwind 컴포넌트에서 직접 색상 사용 금지 (예: `text-white`, `bg-black`)
- 모든 색상은 디자인 시스템 토큰 사용 (예: `text-foreground`, `bg-background`)
