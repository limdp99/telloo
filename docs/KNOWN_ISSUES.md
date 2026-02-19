# Telloo - 알려진 이슈 & 예외사항

## 1. 현재 버그 / 미해결 이슈

### Vercel 배포 트리거 안 됨 (2026-02-19 확인)
- **증상**: `main`에 push 했으나 Vercel에서 새 빌드가 시작되지 않음
- **가능한 원인**:
  1. Vercel-GitHub 연동이 해제됨
  2. Vercel 대시보드에서 자동 배포가 비활성화됨
  3. GitHub App 권한 만료
- **해결 방법**: Vercel 대시보드 > Settings > Git 에서 연동 상태 확인 및 재연결
- **로컬 CLI 상태**: 토큰 만료됨 (`vercel login` 필요)

### Pricing 페이지 비활성 상태
- **상태**: App.jsx에서 `/s/pricing` 라우트가 주석 처리됨
- **파일**: `src/pages/Pricing.jsx`, `src/pages/Pricing.css` 존재하지만 미사용
- **이유**: Stripe 결제 기능이 완전히 테스트되지 않음

### Language 설정 미동작
- **위치**: BoardSettingsModal.jsx > General 탭
- **상태**: UI만 존재, DB에 저장되지 않음 (boards 테이블에 language 컬럼 없음)
- **영향**: 없음 (UI에서 선택해도 아무 효과 없음)

### Custom Domain 부분 동작
- **위치**: BoardSettingsModal.jsx > Advanced 탭
- **상태**: DB에 값 저장만 됨, 실제 도메인 라우팅/Vercel 연동 없음
- **해결 필요**: Vercel Custom Domain API 연동 또는 수동 DNS 설정 가이드

---

## 2. 코드 레벨 주의사항

### 구버전 페이지 파일 (삭제하지 말 것)
- `src/pages/BoardSettings.jsx` / `.css` → `BoardSettingsModal.jsx`로 대체됨
- `src/pages/FeedbackDetail.jsx` / `.css` → `FeedbackDetailPanel.jsx`로 대체됨
- 라우트는 아직 App.jsx에 남아 있음 (직접 URL 접근 시 사용될 수 있음)

### Supabase 쿼리 패턴 주의

```javascript
// ❌ 잘못된 패턴 - 결과 없을 때 에러 발생
.single()

// ✅ 올바른 패턴 - 결과 없으면 null 반환
.maybeSingle()
```

```javascript
// ❌ 잘못된 패턴 - profiles.user_id는 존재하지 않음
.eq('user_id', userId)

// ✅ 올바른 패턴 - profiles의 PK는 id (= auth.users.id)
.eq('id', userId)
```

### FK 조인 시 명시적 관계 지정
feedback_comments → profiles 조인 시 FK 이름 명시 필요:

```javascript
// ✅ FK 이름 명시
.select('*, profiles!fk_feedback_comments_user(nickname, avatar_url)')
```

### Optimistic Update 패턴
댓글, 투표 등에서 사용. 순서 중요:
1. UI 먼저 업데이트 (즉시 반영)
2. 백그라운드에서 DB 저장
3. 실패 시 롤백 (현재는 페이지 리로드로 대체)

### 이미지 Optimistic Update (댓글)
```
1. base64 프리뷰 → 로컬 변수에 저장
2. 폼 클리어 (UX)
3. base64로 optimistic comment 즉시 렌더
4. 백그라운드에서 실제 업로드
5. DB 저장 후 실제 URL로 교체
```

---

## 3. DB 관련 주의사항

### RLS 정책 필수
Supabase에서 RLS가 활성화된 테이블은 정책 없으면 **모든 요청이 무시됨** (에러 없이!).

현재 필요한 RLS 정책:
- `boards` DELETE: `auth.uid() = owner_id`
- `comment_likes` SELECT/INSERT/DELETE: 위 DEPLOYMENT.md 참조
- `feedback_posts`, `feedback_comments`, `feedback_votes`: 기본 정책 설정 필요

### owner_id, user_id Nullable
데모 보드와 익명 댓글 지원을 위해 다음 컬럼이 nullable로 변경됨:
- `boards.owner_id` → 데모 보드는 owner 없음
- `feedback_comments.user_id` → 익명 댓글 허용

### 티켓 번호 자동 부여
- `feedback_posts.ticket_number`은 트리거로 자동 생성
- 보드별로 1부터 순차 증가 (PARTITION BY board_id)
- 트리거 함수: `set_ticket_number()` (BEFORE INSERT)

### UUID 형식
PostgreSQL UUID는 16진수만 허용 (0-9, a-f).
데모 보드 ID: `deadbeef-0000-0000-0000-000000000000`

---

## 4. 환경별 차이

### dev vs prod Supabase

| 항목 | dev | prod |
|------|-----|------|
| 데모 시드 데이터 | 실행 완료 | 미실행 (필요시 실행) |
| comment_likes 테이블 | 생성 완료 | 확인 필요 |
| FK 관계 (comments→profiles) | 설정 완료 | 확인 필요 |
| RLS DELETE 정책 (boards) | 설정 완료 | 확인 필요 |
| 티켓 번호 트리거 | 설정 완료 | 확인 필요 |
| theme 컬럼 (boards) | 추가 완료 | 확인 필요 |
| "Confirm email" 옵션 | OFF | OFF 확인 필요 |

### 프론트엔드 환경 차이
- 없음 (동일한 코드, 환경변수만 다름)

---

## 5. 보안 관련

### 절대 커밋하면 안 되는 것
- `.env.development`, `.env.production` (anon key 포함)
- `.claude/settings.local.json` (로컬 설정)
- Supabase Access Token (`sbp_xxx`)
- Resend API Key (`re_xxx`)
- Stripe Secret Key (`sk_xxx`)

### 클라이언트에 노출되는 키 (정상)
- `VITE_SUPABASE_URL` - 공개 URL
- `VITE_SUPABASE_ANON_KEY` - 공개 키 (RLS로 보호)

### Service Role Key
- Edge Function에서만 사용
- Supabase 대시보드 환경변수로 설정
- **절대 클라이언트 코드에 포함하지 않음**

---

## 6. CORS 관련

### Edge Function CORS
`send-notification` Edge Function에 CORS 헤더 포함:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- OPTIONS preflight 요청 처리

### Supabase Storage CORS
`feedback-images` 버킷이 Public이므로 CORS 이슈 없음.

---

## 7. 시간 표기 규칙

| 경과 시간 | 표시 |
|----------|------|
| < 1분 | Just now |
| < 60분 | Xm ago |
| < 24시간 | Xh ago |
| < 30일 | Xd ago |
| 그 이상 | MMM DD (Jan 15) |

구현 위치: `FeedbackCard.jsx`의 `formatTimeAgo()` 함수
