# Telloo - 프로젝트 현황

## 프로젝트 개요
사용자 피드백 수집/관리 SaaS 플랫폼 (Canny, UserVoice 경쟁)

## 기술 스택
- React 18 + Vite
- Supabase (인증, DB)
- React Router v7

## 실행 방법
```bash
npm run dev  # http://localhost:5173
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
- [ ] 이미지 업로드 (피드백에 스크린샷 첨부)

### 우선순위 중간
- [ ] 소셜 로그인 (Google, GitHub)
- [ ] 팀 멤버 초대/관리
- [ ] 이메일 알림 (새 피드백, 상태 변경)
- [ ] 피드백 검색

### 우선순위 낮음
- [ ] API Access (Business 플랜)
- [ ] 커스텀 도메인
- [ ] 데이터 내보내기 (CSV)
- [ ] 다크 모드

## 파일 구조
```
src/
├── lib/supabase.js          # Supabase 클라이언트
├── context/
│   ├── AuthContext.jsx      # 인증 상태 관리
│   └── BoardContext.jsx     # 보드 상태 관리
├── pages/
│   ├── Landing.jsx          # 랜딩 페이지
│   ├── Auth.jsx             # 로그인/회원가입
│   ├── Dashboard.jsx        # 대시보드
│   ├── Board.jsx            # 피드백 보드
│   ├── FeedbackDetail.jsx   # 피드백 상세
│   ├── BoardSettings.jsx    # 보드 설정
│   └── NotFound.jsx         # 404
├── components/
│   ├── FeedbackCard.jsx     # 피드백 카드
│   └── FeedbackForm.jsx     # 피드백 작성 폼
└── styles/global.css        # 전역 스타일
```

## Supabase 테이블 구조 (추정)
- profiles: user_id, nickname, avatar_url
- boards: id, owner_id, title, description, slug, accent_color
- feedback_posts: id, board_id, user_id, title, description, category, status, author_name, image_url
- feedback_votes: post_id, user_id, vote_type
- feedback_comments: id, post_id, user_id, content, is_admin
- user_roles: board_id, user_id, role

## 마지막 작업 (2024-12-17)
- 프로젝트 현황 파악 및 문서화
- 이메일 인증 제거 (회원가입 시 바로 로그인)

## 참고
- Supabase 대시보드에서 Authentication > Providers > Email > "Confirm email" 옵션 꺼야 함
