# Telloo 프로젝트 상태

## 완료된 작업
- [x] React + Vite 프로젝트 구성
- [x] Supabase 클라이언트 설치 및 설정
- [x] 인증 시스템 (AuthContext, 로그인, 회원가입 페이지)
- [x] 포스트 작성 기능 (이미지 업로드 포함)
- [x] 댓글 기능
- [x] 라우팅 설정

## 다음에 해야 할 작업
1. **Supabase 프로젝트 생성** (https://supabase.com)
2. `.env` 파일 생성:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Supabase에서 테이블 생성 (SQL 실행):
   ```sql
   -- posts 테이블
   CREATE TABLE posts (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     content TEXT,
     image_url TEXT,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     user_email TEXT
   );

   -- comments 테이블
   CREATE TABLE comments (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     content TEXT NOT NULL,
     post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     user_email TEXT
   );

   -- RLS 정책
   ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
   CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
   CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);
   CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
   ```
4. Supabase Storage에서 `post-images` 버킷 생성 (Public)

## 실행 방법
```bash
cd C:\works\telloo
npm run dev
```

## 프로젝트 구조
```
telloo/
├── src/
│   ├── components/
│   │   ├── CreatePost.jsx/css
│   │   ├── PostCard.jsx/css
│   │   └── Comments.jsx/css
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── Home.jsx/css
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── Auth.css
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── package.json
└── vite.config.js
```
