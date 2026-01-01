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
- [ ] 결제 시스템 (Stripe 연동)
  - Free: 1 보드
  - Pro ($19.99): 3 보드 + 커스텀 브랜딩
  - Business ($59.99): 10 보드 + 팀 멤버 + API
- [x] 이미지 업로드 (피드백에 스크린샷 첨부) ✓

### 우선순위 중간
- [ ] 소셜 로그인 (Google, GitHub)
- [ ] 팀 멤버 초대/관리
- [ ] 이메일 알림 (새 피드백, 상태 변경)
- [x] 피드백 검색 ✓

### 우선순위 낮음
- [ ] API Access (Business 플랜)
- [ ] 커스텀 도메인
- [ ] 데이터 내보내기 (CSV)
- [ ] 다크 모드

## 파일 구조
```
src/
├── lib/supabase.js              # Supabase 클라이언트
├── context/
│   ├── AuthContext.jsx          # 인증 상태 관리
│   └── BoardContext.jsx         # 보드 상태 관리
├── pages/
│   ├── Landing.jsx              # 랜딩 페이지
│   ├── Auth.jsx                 # 로그인/회원가입
│   ├── Dashboard.jsx            # 대시보드
│   ├── Board.jsx                # 피드백 보드 (메인)
│   ├── Board.css                # 보드 스타일
│   ├── FeedbackDetail.jsx       # 피드백 상세 (구버전)
│   ├── BoardSettings.jsx        # 보드 설정 (구버전)
│   └── NotFound.jsx             # 404
├── components/
│   ├── FeedbackCard.jsx         # 피드백 카드
│   ├── FeedbackCard.css         # 카드 스타일
│   ├── FeedbackForm.jsx         # 피드백 작성 폼
│   ├── FeedbackDetailPanel.jsx  # 피드백 상세 슬라이드 패널
│   ├── FeedbackDetailPanel.css  # 패널 스타일
│   ├── BoardSettingsModal.jsx   # 보드 설정 모달
│   └── BoardSettingsModal.css   # 모달 스타일
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
- [ ] Priority (우선순위) 필드
- [ ] 구독 기능
- [ ] 투표자 목록 표시
- [ ] 댓글 좋아요

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

## 마지막 작업 (2026-01-01 - 3차)
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

## 참고
- Supabase 대시보드에서 Authentication > Providers > Email > "Confirm email" 옵션 꺼야 함 (dev, prod 둘 다)
- Vercel 대시보드: https://vercel.com/phillips-projects-602ced67/telloo/settings
- main에 push → Production 배포
- dev에 push → Preview 배포
