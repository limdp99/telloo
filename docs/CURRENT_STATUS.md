# Telloo - 현재 상태 (2026-02-19)

## 1. Git 상태

```
현재 브랜치: dev
최신 커밋: 1c77e36 fix: Increase demo preview to 6 cards and fix BoardSettings.css typo
main 브랜치: 동일 커밋 (1c77e36)
미커밋 파일: nul (미추적, 삭제 가능)
```

### 최근 커밋 히스토리
```
1c77e36 fix: Increase demo preview to 6 cards and fix BoardSettings.css typo (2026-02-19)
911c244 feat: Improve landing page with live demo preview and CTA section (2026-02-08)
553bd34 docs: Update CLAUDE.md with 2026-02-08 session details
287f814 .
db13cc7 feat: Fix login redirects and add demo board seed data
60265e6 feat: Add image lightbox modal for attachments
696e254 feat: Add Light/Dark theme mode and expand color palette
1f0074b feat: Add delete board functionality and cleanup settings
```

---

## 2. 완성된 기능 목록

### 핵심 기능
- [x] 회원가입 / 로그인 / 로그아웃 / 세션 유지
- [x] 대시보드 (내 보드 목록, 보드 생성)
- [x] 피드백 보드 (목록, 필터, 정렬, 검색)
- [x] 피드백 작성 (로그인/비로그인, 익명 지원)
- [x] Upvote (체크마크 스타일)
- [x] 피드백 상세 슬라이드 패널
- [x] 댓글 (이미지 첨부, 관리자 뱃지)
- [x] 댓글 좋아요
- [x] 투표자 목록 팝오버
- [x] 관리자 상태 변경 / 우선순위 설정
- [x] 티켓 번호 자동 부여

### 보드 설정
- [x] 제목 / 설명 / URL slug 변경
- [x] 액센트 컬러 (12색 팔레트)
- [x] Light / Dark 테마 전환
- [x] 로고 이미지 업로드
- [x] 커스텀 도메인 (DB 저장만)
- [x] 보드 삭제

### 계정
- [x] 닉네임 변경
- [x] 아바타 이미지 업로드/제거
- [x] 프로필 드롭다운 메뉴

### 시스템
- [x] 이메일 알림 (댓글, 상태변경, 새 글)
- [x] 이미지 업로드 (Supabase Storage)
- [x] 이미지 라이트박스 모달
- [x] 로그인 리다이렉트 (보드→로그인→보드)

### 랜딩 페이지
- [x] Hero 섹션
- [x] Features 섹션
- [x] 라이브 데모 프리뷰 (6개 카드)
- [x] CTA 섹션
- [x] Nav에 Pricing 링크

### 결제 (Stripe)
- [x] 결제 세션 생성 Edge Function
- [x] 웹훅 처리 Edge Function
- [ ] Pricing 페이지 (코드 존재, 라우트 비활성)

---

## 3. 미완성 / TODO

### 긴급 (현재 세션)
- [ ] **Vercel 배포 문제 해결** - GitHub 연동 확인 필요
- [ ] Production DB 스키마 동기화 확인 (DEPLOYMENT.md의 SQL 참조)
- [ ] Production에 데모 시드 데이터 실행 여부 결정

### 단기
- [ ] Pricing 페이지 라우트 활성화 및 Stripe 테스트
- [ ] Production Edge Function 배포 확인 (create-checkout-session, stripe-webhook)
- [ ] Language 설정 DB 연동 (또는 UI 제거)

### 중기
- [ ] 소셜 로그인 (Google, GitHub)
- [ ] 팀 멤버 초대/관리
- [ ] API Access (Business 플랜)
- [ ] 데이터 내보내기 (CSV)

---

## 4. 마지막 세션 작업 내용 (2026-02-19)

1. 로컬 개발 서버 실행 (`npm run dev`)
2. 랜딩 페이지 데모 카드 4개 → 6개로 변경
3. `BoardSettings.css` 오타 수정 (`}메인` → `}`)
4. dev에 커밋 & push
5. dev → main 머지 & push (Vercel 자동 배포 의도)
6. **배포가 트리거되지 않는 문제 발견** → 미해결

---

## 5. 이전 세션 작업 요약 (2026-02-08)

1. 랜딩 페이지 대폭 개선
   - Pricing 섹션 → 라이브 데모 프리뷰 섹션으로 교체
   - CTA 섹션 추가
   - Nav에 Pricing 링크 추가
2. 데모 보드 시드 데이터 생성 (supabase/seed-demo.sql)
3. 로그인 리다이렉트 수정 (보드→인증→보드)
4. 이미지 라이트박스 모달
5. 다크/라이트 테마 밝기 조정

---

## 6. 다른 PC에서 이어서 할 때

### 즉시 해야 할 것
1. `docs/SETUP.md` 따라 환경 설정
2. `.env.development`, `.env.production` 파일 생성 (키는 Supabase 대시보드에서 확인)
3. `npm install && npm run dev` 로 로컬 확인
4. Vercel 대시보드에서 GitHub 연동 상태 확인 → 배포 문제 해결

### 참고 문서
| 파일 | 내용 |
|------|------|
| `docs/SETUP.md` | 새 PC 환경 설정 |
| `docs/DEPLOYMENT.md` | 배포 프로세스 전체 |
| `docs/ARCHITECTURE.md` | 코드 구조 & 데이터 흐름 |
| `docs/KNOWN_ISSUES.md` | 버그 & 예외사항 |
| `CLAUDE.md` | 전체 프로젝트 히스토리 (가장 상세) |
