# Telloo - 배포 가이드

## 1. 프론트엔드 배포 (Vercel)

### 자동 배포 (GitHub 연동)

| 이벤트 | 배포 환경 | URL |
|--------|----------|-----|
| `main` 브랜치 push | Production | https://telloo.vercel.app |
| `dev` 브랜치 push | Preview | 자동 생성 URL |
| PR 생성 | Preview | 자동 생성 URL |

```bash
# 프로덕션 배포 전체 흐름
git checkout dev
# ... 작업 & 커밋 ...
git push origin dev                    # 1) Preview 배포
# Preview URL에서 테스트 확인
git checkout main && git merge dev     # 2) main에 머지
git push origin main                   # 3) Production 배포 트리거
git checkout dev                       # 4) dev로 복귀
```

### Vercel 환경변수 (대시보드에서 설정)

| 변수 | Production | Preview | Development |
|------|-----------|---------|-------------|
| VITE_SUPABASE_URL | prod URL | dev URL | dev URL |
| VITE_SUPABASE_ANON_KEY | prod key | dev key | dev key |

> Vercel 대시보드 > Settings > Environment Variables 에서 관리

### 배포 실패 시 확인사항
1. Vercel 대시보드에서 Deployments 탭 확인
2. GitHub 연동 상태 확인 (Settings > Git)
3. 빌드 로그 확인 (Deployments > 해당 배포 클릭)
4. 환경변수 확인 (빈 값이면 빌드는 성공하지만 런타임 에러)

### 현재 알려진 이슈 (2026-02-19)
- Vercel 로컬 CLI 토큰 만료됨 → `vercel login` 필요
- 배포가 트리거되지 않는 경우 → Vercel 대시보드에서 GitHub 연동 상태 확인

---

## 2. Edge Function 배포 (Supabase)

### 배포 명령어

```bash
# Development 환경
SUPABASE_ACCESS_TOKEN=<직접입력> npx supabase functions deploy <function-name> \
  --no-verify-jwt \
  --project-ref kalhnkizplawebgdkcym

# Production 환경
SUPABASE_ACCESS_TOKEN=<직접입력> npx supabase functions deploy <function-name> \
  --no-verify-jwt \
  --project-ref hspgbzgiewlqswoykybf
```

### Edge Function 목록

| 함수명 | 용도 | 배포 상태 |
|--------|------|----------|
| `send-notification` | 이메일 알림 (Resend) | dev: 완료, prod: 완료 |
| `create-checkout-session` | Stripe 결제 세션 | dev: 완료, prod: 미확인 |
| `stripe-webhook` | Stripe 웹훅 처리 | dev: 완료, prod: 미확인 |

### Edge Function 환경변수 (Supabase 대시보드에서 설정)

| 변수 | 설명 | dev | prod |
|------|------|-----|------|
| RESEND_API_KEY | Resend 이메일 API 키 | 설정됨 | 설정됨 |
| FROM_EMAIL | 발신 이메일 | Telloo <notifications@telloo.io> | 동일 |
| APP_URL | 앱 URL | Preview URL | https://telloo.vercel.app |
| SUPABASE_URL | Supabase URL | dev URL | prod URL |
| SUPABASE_SERVICE_ROLE_KEY | 서비스 역할 키 | 설정됨 | 설정됨 |
| STRIPE_SECRET_KEY | Stripe 시크릿 키 | 설정됨 | 미확인 |
| STRIPE_PRICE_PRO | Pro 가격 ID | 설정됨 | 미확인 |
| STRIPE_PRICE_BUSINESS | Business 가격 ID | 설정됨 | 미확인 |

> **주의**: `--no-verify-jwt` 필수! 없으면 외부 호출 시 401 에러.

### Access Token 발급
1. https://supabase.com/dashboard/account/tokens 접속
2. "Generate new token" 클릭
3. 토큰 복사 → CLI 명령어에 직접 입력
4. **절대 파일에 저장하지 않음**

---

## 3. 데이터베이스 관리

### DB 스키마 변경 방법
Supabase 대시보드 > SQL Editor에서 직접 실행.

### Production DB에 필요한 스키마 (아직 미실행일 수 있음)

```sql
-- 필수 컬럼 추가 (IF NOT EXISTS로 안전)
ALTER TABLE boards ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark';
ALTER TABLE boards ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE feedback_posts ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'empty';
ALTER TABLE feedback_posts ADD COLUMN IF NOT EXISTS ticket_number INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE feedback_comments ADD COLUMN IF NOT EXISTS image_url TEXT;

-- comment_likes 테이블 (없으면 생성)
CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id UUID REFERENCES feedback_comments ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  PRIMARY KEY (comment_id, user_id)
);
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Anyone can read comment likes" ON comment_likes FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can insert own likes" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own likes" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- FK 관계 (이미 있으면 무시)
ALTER TABLE feedback_comments ADD CONSTRAINT IF NOT EXISTS fk_feedback_comments_user
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE comment_likes ADD CONSTRAINT IF NOT EXISTS fk_comment_likes_user
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 보드 삭제 RLS 정책
CREATE POLICY IF NOT EXISTS "Users can delete own boards" ON boards FOR DELETE USING (auth.uid() = owner_id);

-- 데모 보드용 (owner_id nullable)
ALTER TABLE boards ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE feedback_comments ALTER COLUMN user_id DROP NOT NULL;

-- 티켓 번호 자동 부여 트리거
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

DROP TRIGGER IF EXISTS set_ticket_number_trigger ON feedback_posts;
CREATE TRIGGER set_ticket_number_trigger
  BEFORE INSERT ON feedback_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();
```

### 데모 보드 시드 데이터
```bash
# supabase/seed-demo.sql을 SQL Editor에서 실행
# dev 환경: 실행 완료
# prod 환경: 필요시 실행
```

---

## 4. 배포 체크리스트

### 일반 배포
- [ ] `dev`에서 코드 변경 & 커밋
- [ ] `git push origin dev` → Preview 배포
- [ ] Preview URL에서 기능 확인
- [ ] `main`에 머지 & push → Production 배포
- [ ] https://telloo.vercel.app 에서 최종 확인

### 대규모 변경 시 추가 확인
- [ ] DB 스키마 변경이 있는 경우: prod Supabase SQL Editor에서 먼저 실행
- [ ] Edge Function 변경이 있는 경우: prod에 재배포
- [ ] 환경변수 추가/변경: Vercel + Supabase 대시보드 모두 확인
- [ ] Storage 버킷 설정 변경: dev/prod 모두 확인
