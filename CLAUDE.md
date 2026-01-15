# Telloo - 프로젝트 현황

## 프로젝트 개요
사용자 피드백 수집/관리 SaaS 플랫폼 (Canny, UserVoice 경쟁)

## 기술 스택
- React 18 + Vite
- Supabase (인증, DB)
- React Router v7

## 환경 구성

### Git 브랜치
- `main` - 프로덕션 (Vercel 자동 배포)
- `dev` - 개발용 (Preview 배포)

### 환경별 설정
| 환경 | Supabase Project ID | Vercel URL |
|------|---------------------|------------|
| Production | hspgbzgiewlqswoykybf | https://telloo.vercel.app |
| Development | kalhnkizplawebgdkcym | Preview URL (자동 생성) |

### 환경 파일
- `.env.development` - 로컬 개발용 (dev Supabase)
- `.env.production` - 프로덕션용 (prod Supabase)
- Vercel 환경변수도 별도 설정됨

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
- [x] Upvote / Downvote
- [x] 투표 취소/변경
- [x] 비로그인시 로그인 유도

### 피드백 상세
- [x] 상세 내용 표시
- [x] 댓글 목록
- [x] 댓글 작성 (로그인 필요)
- [x] 관리자 댓글 표시 (Admin 뱃지)
- [x] 관리자 상태 변경

### 보드 설정
- [x] 제목/설명 수정
- [x] URL slug 변경
- [x] 액센트 컬러 변경

## 미구현 기능 (TODO)

### 우선순위 높음
- [x] 결제 시스템 (Stripe 연동) ✓
  - Free: 1 보드
  - Pro ($19.99): 3 보드 + 커스텀 브랜딩
  - Business ($59.99): 10 보드 + 팀 멤버 + API
- [x] 이미지 업로드 (피드백에 스크린샷 첨부) ✓

### 우선순위 중간
- [ ] 소셜 로그인 (Google, GitHub)
- [ ] 팀 멤버 초대/관리
- [x] 이메일 알림 (새 피드백, 상태 변경) ✓
- [x] 피드백 검색 ✓

### 우선순위 낮음
- [ ] API Access (Business 플랜)
- [x] 커스텀 도메인 ✓
- [ ] 데이터 내보내기 (CSV)
- [ ] 다크 모드 (기본 테마가 다크모드)

## 파일 구조
```
src/
├── lib/supabase.js              # Supabase 클라이언트
├── context/
│   ├── AuthContext.jsx          # 인증 상태 관리 (user, profile, refreshProfile)
│   └── BoardContext.jsx         # 보드 상태 관리
├── pages/
│   ├── Landing.jsx              # 랜딩 페이지
│   ├── Auth.jsx                 # 로그인/회원가입 (redirect 파라미터 지원)
│   ├── Dashboard.jsx            # 대시보드
│   ├── Board.jsx                # 피드백 보드 (메인)
│   ├── Board.css                # 보드 스타일
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
└── styles/global.css            # 전역 스타일
```

## Supabase 테이블 구조
- profiles: id (uuid, PK), nickname, avatar_url, created_at
- boards: id (uuid, PK), owner_id, title, description, slug (unique), accent_color, created_at
- feedback_posts: id (uuid, PK), board_id, user_id, title, description, category, status, author_name, image_url, created_at
- feedback_votes: post_id + user_id (복합 PK), vote_type
- feedback_comments: id (uuid, PK), post_id, user_id, content, is_admin, created_at
- user_roles: board_id + user_id (복합 PK), role

## UI 개선 작업

UI 시안 위치: `UI/` 폴더 (board.png, ticket_detail.png, board_settings.png, account_settings.png)

### 완료 (2026-01-01)
- [x] 다크 모드 테마 색상 조정 (민트색 액센트 #2dd4bf)
- [x] 모달/슬라이드 패널 CSS 추가 (global.css)
- [x] 피드백 상세 → 슬라이드 패널로 변경
  - FeedbackDetailPanel.jsx 컴포넌트 생성
  - FeedbackDetailPanel.css 스타일 생성
  - Board.jsx에서 클릭 시 패널 열기
- [x] 보드 설정 → 모달로 변경
  - BoardSettingsModal.jsx 컴포넌트 생성
  - BoardSettingsModal.css 스타일 생성
  - 사이드바 메뉴 구조 (General, People, Feedback, Advanced)
- [x] 투표 UI 변경 (체크마크 스타일)
  - 기존: 위/아래 화살표 + 숫자
  - 변경: ✓ + 숫자 (오른쪽 배치)
  - downvote 제거, upvote만 유지
- [x] 상단 네비게이션 구조 변경
  - 고정 네비게이션 바 추가
  - Settings 링크, 프로필 아이콘
- [x] 프로필 드롭다운 메뉴 추가
  - Dashboard 링크
  - Logout
- [x] 티켓 번호 시스템 ✓
  - FeedbackCard, FeedbackDetailPanel에서 #{ticket_number} 표시
  - DB에 ticket_number 컬럼 및 자동 부여 트리거 적용 완료

### 진행 예정 (우선순위 중간)
- [x] 검색 기능 ✓
- [x] Priority (우선순위) 필드 ✓
- [x] 투표자 목록 표시 ✓
- [x] 댓글 좋아요 ✓
- [x] 계정 설정 (닉네임/아바타 변경) ✓
- [x] 아바타 이미지 표시 (프로필, 댓글, 투표자) ✓

### DB 스키마 변경 필요

#### 티켓 번호 시스템 (즉시 실행 필요)
```sql
-- feedback_posts에 ticket_number 컬럼 추가
ALTER TABLE feedback_posts ADD COLUMN ticket_number INTEGER;

-- 기존 데이터에 번호 부여
WITH numbered AS (
  SELECT id, board_id,
    ROW_NUMBER() OVER (PARTITION BY board_id ORDER BY created_at) as rn
  FROM feedback_posts
)
UPDATE feedback_posts
SET ticket_number = numbered.rn
FROM numbered
WHERE feedback_posts.id = numbered.id;

-- 새 피드백 생성 시 자동 번호 부여를 위한 함수
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(MAX(ticket_number), 0) + 1
  INTO NEW.ticket_number
  FROM feedback_posts
  WHERE board_id = NEW.board_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS set_ticket_number_trigger ON feedback_posts;
CREATE TRIGGER set_ticket_number_trigger
  BEFORE INSERT ON feedback_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();
```

#### 추가 기능용 (나중에 필요시)
```sql
-- feedback_posts 테이블에 추가
ALTER TABLE feedback_posts ADD COLUMN priority TEXT DEFAULT 'empty';
ALTER TABLE feedback_posts ADD COLUMN visibility TEXT DEFAULT 'public';

-- 구독 테이블 추가
CREATE TABLE feedback_subscriptions (
  post_id UUID REFERENCES feedback_posts ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);

-- 댓글 좋아요 테이블 추가
CREATE TABLE comment_likes (
  comment_id UUID REFERENCES feedback_comments ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  PRIMARY KEY (comment_id, user_id)
);

-- boards 테이블에 추가
ALTER TABLE boards ADD COLUMN logo_url TEXT;
ALTER TABLE boards ADD COLUMN background_url TEXT;
ALTER TABLE boards ADD COLUMN default_sort TEXT DEFAULT 'trending';
ALTER TABLE boards ADD COLUMN default_view TEXT DEFAULT 'feedback';
ALTER TABLE boards ADD COLUMN language TEXT DEFAULT 'en';
```

## 마지막 작업 (2026-01-14 - 세션 3)

### 계정 설정 모달 추가 (AccountSettingsModal)
- 프로필 드롭다운에 Account 메뉴 추가 (Dashboard와 Logout 사이)
- 닉네임 변경 기능
- 아바타 이미지 업로드/제거 기능 (feedback-images 버킷 사용)
- AuthContext에 refreshProfile 함수 추가 (페이지 리로드 없이 프로필 갱신)
- 저장 후 refreshProfile() 호출하여 즉시 반영

### 아바타 이미지 표시 적용
- **우상단 프로필 버튼**: profile?.avatar_url 사용, 없으면 닉네임 첫글자
- **댓글 작성자**: comment.profiles?.avatar_url 사용
- **투표자 목록**: voter.avatar_url 사용 (fetchPost에서 avatar_url 조회 추가)
- **optimistic 업데이트**: 새 댓글에 profile?.avatar_url 포함

### 댓글 입력창 위치 수정
- 문제: panel-content 안에 있어서 스크롤과 함께 움직임
- 해결: panel-content 밖으로 분리하여 slide-panel의 직접 자식으로 변경
- CSS: position: sticky → flex-shrink: 0 방식으로 변경

### 댓글 이미지 optimistic 업데이트 수정
- 문제: 이미지가 업로드 완료 후에야 표시됨
- 해결:
  1. savedImagePreview, savedImageFile을 로컬 변수로 저장
  2. 폼 먼저 클리어 (UX 개선)
  3. base64 프리뷰로 optimistic comment 즉시 표시
  4. 백그라운드에서 이미지 업로드
  5. DB 저장 후 실제 URL로 교체

### Supabase 쿼리 버그 수정
- **AuthContext.jsx**: profiles 테이블 조회 시 `.eq('user_id', userId)` → `.eq('id', userId)` (profiles.id가 PK)
- **BoardContext.jsx**: user_roles 조회 시 `.single()` → `.maybeSingle()` (결과 없을 때 에러 방지)
- **AuthContext.jsx**: profiles 조회 시 `.single()` → `.maybeSingle()`

### 수정된 파일 상세
```
src/components/AccountSettingsModal.jsx (신규)
  - 닉네임, 아바타 수정 UI
  - 이미지 업로드 로직 (feedback-images 버킷)
  - profiles 테이블 upsert 로직

src/components/AccountSettingsModal.css (신규)
  - 모달 스타일, 아바타 프리뷰, 버튼 스타일

src/components/FeedbackDetailPanel.jsx
  - useAuth에서 profile 추가
  - 댓글 아바타 이미지 표시 로직
  - 투표자 avatar_url 조회 추가
  - optimistic 업데이트에 avatar_url 포함
  - 댓글 폼을 panel-content 밖으로 이동

src/components/FeedbackDetailPanel.css
  - .avatar-img, .voter-avatar-img, .voter-item-avatar-img 스타일 추가

src/context/AuthContext.jsx
  - fetchProfile: .eq('id', userId), .maybeSingle()
  - refreshProfile 함수 추가 및 export

src/context/BoardContext.jsx
  - fetchUserRole: .maybeSingle()

src/pages/Board.jsx
  - useAuth에서 profile 추가
  - 프로필 버튼에 avatar_url 표시
  - Account 메뉴 및 AccountSettingsModal 추가

src/pages/Board.css
  - .profile-avatar-img 스타일 추가
```

## 이전 작업 (2026-01-04 - 2차)
- 로그인 모달 팝업 구현
  - 비로그인 상태에서 투표/댓글 좋아요 시 로그인 팝업 표시
  - Login 버튼 클릭 시 /s/auth로 이동 (redirect 파라미터 포함)
  - 로그인 후 이전 페이지로 자동 복귀
- Edge Function CORS 수정
  - send-notification에 CORS 헤더 추가
  - OPTIONS preflight 요청 처리
  - --no-verify-jwt 옵션으로 배포
- DB FK 관계 수정 (dev 환경)
  - comment_likes 테이블 생성 및 RLS 정책 추가
  - feedback_comments.user_id → profiles.id FK 추가
  - 조인 쿼리에서 명시적 FK 지정 (profiles!fk_feedback_comments_user)
- UI 개선
  - 시간 표기 정책: Just now / Xm ago / Xh ago / Xd ago / MMM DD
  - 목록에서 Trending 정렬 옵션 제거 (기본값: Newest)
- 수정된 파일:
  - src/components/FeedbackCard.jsx - 로그인 모달, formatTimeAgo 함수
  - src/components/FeedbackDetailPanel.jsx - 로그인 모달, FK 명시적 지정
  - src/pages/Auth.jsx - redirect 파라미터 처리
  - src/pages/Board.jsx - 정렬 옵션 제거
  - src/styles/global.css - 로그인 모달 스타일
  - supabase/functions/send-notification/index.ts - CORS 헤더

### dev 환경 DB 스키마 추가 (이미 실행됨)
```sql
-- comment_likes 테이블
CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id UUID REFERENCES feedback_comments ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  PRIMARY KEY (comment_id, user_id)
);
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read comment likes" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- FK 관계
ALTER TABLE feedback_comments ADD CONSTRAINT fk_feedback_comments_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE comment_likes ADD CONSTRAINT fk_comment_likes_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
```

### Edge Function 배포 명령어 (참고)
```bash
# Development 환경 배포 (--no-verify-jwt 필수)
SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy send-notification --no-verify-jwt --project-ref kalhnkizplawebgdkcym

# Production 환경 배포
SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy send-notification --no-verify-jwt --project-ref hspgbzgiewlqswoykybf
```

### Edge Function 환경변수 (dev/prod 모두 설정됨)
- RESEND_API_KEY
- FROM_EMAIL (Telloo <notifications@telloo.io>)
- APP_URL
- SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

## 이전 작업 (2026-01-04 - 1차)
- 이메일 알림 시스템 개선 및 완성
  - Subscribe 버튼 제거 (사용자가 수동으로 구독할 필요 없음)
  - send-notification Edge Function 4가지 자동 알림 케이스로 재구현:
    - Case 1: 내 글에 댓글 → 글 작성자에게 알림
    - Case 2: 내 글 상태 변경 → 글 작성자에게 알림
    - Case 3: 새 글 작성 → 보드 관리자(owner + admin)에게 알림
    - Case 4: 내가 댓글 단 글에 새 댓글 → 이전 댓글 작성자들에게 알림
  - FeedbackForm.jsx에 새 글 작성 시 알림 호출 추가
  - Edge Function 배포 완료 (dev/prod 환경)
  - 테스트 완료 (이메일 발송 확인)

## 이전 작업 (2026-01-01 - 4차)
- Priority 필드 구현
  - 관리자가 Low/Medium/High 설정 가능
  - FeedbackCard, FeedbackDetailPanel에서 표시
- 투표자 목록 표시
  - 투표자 아바타 클릭 시 전체 목록 팝오버
  - 닉네임 및 투표 유형 표시
- 댓글 좋아요 기능
  - comment_likes 테이블
  - 좋아요 버튼 및 카운트 표시
- 커스텀 도메인 설정
  - BoardSettingsModal > Advanced에서 설정
  - DNS CNAME 가이드 표시
- 결제 시스템 (Stripe 연동)
  - Pricing 페이지 (/s/pricing)
  - Dashboard에 구독 정보 및 보드 제한 표시
  - Supabase Edge Functions (create-checkout-session, stripe-webhook)
- 이메일 알림 기능 (초기 구현)
  - send-notification Edge Function (Resend 사용)
  - 피드백 구독 기능 (Subscribe 버튼) - 이후 제거됨
  - 상태 변경/댓글 추가 시 알림 발송

## 이전 작업 (2026-01-01 - 3차)
- 검색 기능 구현
  - 툴바에 검색 입력 UI
  - 제목/설명 실시간 필터링
  - 검색 결과 없음 메시지
- 이미지 업로드 기능 구현
  - Supabase Storage 버킷 (feedback-images)
  - FeedbackForm에 이미지 첨부 UI (최대 5MB, JPEG/PNG/GIF/WebP)
  - FeedbackCard에 썸네일 표시
  - FeedbackDetailPanel에 전체 이미지 표시

## 이전 작업 (2026-01-01 - 2차)
- UI 시안 기반 전체 리뉴얼
  - 피드백 상세 → 슬라이드 패널 (FeedbackDetailPanel)
  - 보드 설정 → 모달 (BoardSettingsModal)
  - 투표 UI → 체크마크 스타일
  - 상단 네비게이션 + 프로필 드롭다운
  - 티켓 번호 표시

## 이전 작업 (2026-01-01 - 1차)
- UI 시안 분석 및 작업 목록 정리
- 다크 모드 테마 색상 변경 (보라색 → 민트색)
- global.css에 모달/슬라이드 패널 스타일 추가

## 이전 작업 (2025-12-31)
- dev/prod 환경 분리
  - Git 브랜치: main (prod), dev (개발)
  - Supabase 프로젝트 2개로 분리
  - Vercel 배포 설정 (GitHub 연동, 환경변수)
- .env.development, .env.production 파일 생성
- Vercel 연동 완료 (자동 배포)

## 배포 대기 상태

### 현재 브랜치 상태
- `dev` 브랜치: 최신 작업 완료, 테스트 필요
- `main` 브랜치: dev 머지 대기 중

### Production 배포 전 체크리스트
1. [x] dev 브랜치에 모든 변경사항 커밋/푸시 완료
2. [ ] dev에서 기능 테스트 (아바타 업로드, 댓글 이미지 등)
3. [ ] main에 머지 (`git checkout main && git merge dev && git push`)
4. [ ] Vercel에서 Production 배포 확인
5. [ ] Production 환경 테스트

### Production DB 스키마 확인 필요
- profiles 테이블에 avatar_url 컬럼 있는지 확인
- feedback_comments에 image_url 컬럼 있는지 확인
- comment_likes 테이블 존재 여부 확인

## 다음 작업 (TODO)
- [ ] dev → main 머지 후 Production 배포
- [ ] Production 환경에 send-notification Edge Function 배포
- [ ] Production 환경에 Edge Function 환경변수 설정 (RESEND_API_KEY, FROM_EMAIL, APP_URL)
- [ ] 소셜 로그인 (Google, GitHub)
- [ ] 팀 멤버 초대/관리
- [ ] API Access (Business 플랜)
- [ ] 데이터 내보내기 (CSV)

## 참고
- Supabase 대시보드에서 Authentication > Providers > Email > "Confirm email" 옵션 꺼야 함 (dev, prod 둘 다)
- Vercel 대시보드: https://vercel.com/phillips-projects-602ced67/telloo/settings
- main에 push → Production 배포
- dev에 push → Preview 배포
- Supabase Access Token 생성: https://supabase.com/dashboard/account/tokens
