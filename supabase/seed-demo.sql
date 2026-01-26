-- =====================================================
-- Telloo Demo Board Seed Data
-- Run this in Supabase SQL Editor (dev or prod)
-- =====================================================

-- 0. Schema changes (safe to run multiple times)
DO $$
BEGIN
  ALTER TABLE boards ALTER COLUMN owner_id DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE feedback_comments ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

ALTER TABLE boards ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark';
ALTER TABLE boards ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE feedback_posts ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'empty';
ALTER TABLE feedback_posts ADD COLUMN IF NOT EXISTS ticket_number INTEGER;

-- 1. Create Demo Board
-- Note: owner_id should be set to an actual user ID or NULL for public demo
INSERT INTO boards (id, owner_id, title, description, slug, accent_color, theme, logo_url)
VALUES (
  'deadbeef-0000-0000-0000-000000000000',
  NULL,  -- No owner (public demo board)
  'Acme Software',
  'Help us build the product you love. Share your ideas, report bugs, and vote on features.',
  'demo',
  '#3b82f6',
  'dark',
  NULL
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  accent_color = EXCLUDED.accent_color,
  theme = EXCLUDED.theme;

-- 2. Create Sample Feedback Posts
-- Post 1: Popular feature request (completed)
INSERT INTO feedback_posts (id, board_id, user_id, title, description, category, status, priority, ticket_number, created_at)
VALUES (
  'deadbeef-0001-0000-0000-000000000001',
  'deadbeef-0000-0000-0000-000000000000',
  NULL,
  'Dark mode support',
  'Would love to have a dark mode option for the dashboard. Working late at night and the bright white background is hard on the eyes. Many modern apps support this now and it would be a great addition.',
  'feature_request',
  'completed',
  'high',
  1,
  NOW() - INTERVAL '45 days'
) ON CONFLICT (id) DO NOTHING;

-- Post 2: In progress feature
INSERT INTO feedback_posts (id, board_id, user_id, title, description, category, status, priority, ticket_number, author_name, created_at)
VALUES (
  'deadbeef-0002-0000-0000-000000000002',
  'deadbeef-0000-0000-0000-000000000000',
  NULL,
  'Export data to CSV',
  'Need the ability to export my data to CSV format for reporting purposes. Currently I have to manually copy everything which is time consuming. This would save hours of work each month.',
  'feature_request',
  'in_progress',
  'medium',
  2,
  'Sarah M.',
  NOW() - INTERVAL '30 days'
) ON CONFLICT (id) DO NOTHING;

-- Post 3: Planned feature
INSERT INTO feedback_posts (id, board_id, user_id, title, description, category, status, priority, ticket_number, author_name, created_at)
VALUES (
  'deadbeef-0003-0000-0000-000000000003',
  'deadbeef-0000-0000-0000-000000000000',
  NULL,
  'Mobile app for iOS and Android',
  'A native mobile app would be amazing! I often need to check things on the go and the mobile web experience could be better. Push notifications would also be super helpful.',
  'feature_request',
  'planned',
  'high',
  3,
  'Mike Chen',
  NOW() - INTERVAL '25 days'
) ON CONFLICT (id) DO NOTHING;

-- Post 4: Bug report (fixed)
INSERT INTO feedback_posts (id, board_id, user_id, title, description, category, status, priority, ticket_number, author_name, created_at)
VALUES (
  'deadbeef-0004-0000-0000-000000000004',
  'deadbeef-0000-0000-0000-000000000000',
  NULL,
  'Login button not working on Safari',
  'When I try to click the login button on Safari 16.4, nothing happens. I have to use Chrome instead. This started happening after the last update. Console shows a JavaScript error.',
  'bug_report',
  'completed',
  'high',
  4,
  'Alex Johnson',
  NOW() - INTERVAL '20 days'
) ON CONFLICT (id) DO NOTHING;

-- Post 5: Under review
INSERT INTO feedback_posts (id, board_id, user_id, title, description, category, status, priority, ticket_number, author_name, created_at)
VALUES (
  'deadbeef-0005-0000-0000-000000000005',
  'deadbeef-0000-0000-0000-000000000000',
  NULL,
  'Keyboard shortcuts for power users',
  'As someone who uses the app daily, keyboard shortcuts would significantly speed up my workflow. Something like Cmd+K for quick search, Cmd+N for new item, etc. Similar to what Notion or Linear has.',
  'feature_request',
  'under_review',
  'medium',
  5,
  'David Park',
  NOW() - INTERVAL '15 days'
) ON CONFLICT (id) DO NOTHING;

-- Post 6: Improvement suggestion
INSERT INTO feedback_posts (id, board_id, user_id, title, description, category, status, priority, ticket_number, author_name, created_at)
VALUES (
  'deadbeef-0006-0000-0000-000000000006',
  'deadbeef-0000-0000-0000-000000000000',
  NULL,
  'Improve loading speed on dashboard',
  'The dashboard takes about 3-4 seconds to load which feels slow. Would be great if this could be optimized. Maybe lazy loading or caching could help?',
  'improvement',
  'planned',
  'medium',
  6,
  'Emma Wilson',
  NOW() - INTERVAL '12 days'
) ON CONFLICT (id) DO NOTHING;

-- Post 7: Recent feature request
INSERT INTO feedback_posts (id, board_id, user_id, title, description, category, status, priority, ticket_number, author_name, created_at)
VALUES (
  'deadbeef-0007-0000-0000-000000000007',
  'deadbeef-0000-0000-0000-000000000000',
  NULL,
  'Integration with Slack',
  'Would be awesome to get notifications in Slack when something important happens. Our team lives in Slack and this would help us stay on top of things without constantly checking the app.',
  'feature_request',
  'under_review',
  'low',
  7,
  'James Lee',
  NOW() - INTERVAL '10 days'
) ON CONFLICT (id) DO NOTHING;

-- Post 8: Bug report (under review)
INSERT INTO feedback_posts (id, board_id, user_id, title, description, category, status, priority, ticket_number, author_name, created_at)
VALUES (
  'deadbeef-0008-0000-0000-000000000008',
  'deadbeef-0000-0000-0000-000000000000',
  NULL,
  'Charts not rendering correctly on Firefox',
  'The analytics charts appear broken on Firefox 120. The bars overlap each other and the labels are cut off. Works fine on Chrome. Screenshot attached shows the issue.',
  'bug_report',
  'under_review',
  'medium',
  8,
  'Lisa Wang',
  NOW() - INTERVAL '7 days'
) ON CONFLICT (id) DO NOTHING;

-- Post 9: Popular feature request
INSERT INTO feedback_posts (id, board_id, user_id, title, description, category, status, priority, ticket_number, author_name, created_at)
VALUES (
  'deadbeef-0009-0000-0000-000000000009',
  'deadbeef-0000-0000-0000-000000000000',
  NULL,
  'Two-factor authentication (2FA)',
  'Security is important for our organization. Please add support for 2FA using authenticator apps like Google Authenticator or Authy. This is a requirement for our compliance.',
  'feature_request',
  'in_progress',
  'high',
  9,
  'Robert Kim',
  NOW() - INTERVAL '5 days'
) ON CONFLICT (id) DO NOTHING;

-- Post 10: New feature request
INSERT INTO feedback_posts (id, board_id, user_id, title, description, category, status, priority, ticket_number, author_name, created_at)
VALUES (
  'deadbeef-000a-0000-0000-00000000000a',
  'deadbeef-0000-0000-0000-000000000000',
  NULL,
  'Bulk actions for items',
  'When managing lots of items, I need to be able to select multiple and perform bulk actions like archive, delete, or change status. Currently I have to do each one individually which is tedious.',
  'feature_request',
  'under_review',
  'empty',
  10,
  'Jennifer Taylor',
  NOW() - INTERVAL '3 days'
) ON CONFLICT (id) DO NOTHING;

-- Post 11: Improvement
INSERT INTO feedback_posts (id, board_id, user_id, title, description, category, status, priority, ticket_number, author_name, created_at)
VALUES (
  'deadbeef-000b-0000-0000-00000000000b',
  'deadbeef-0000-0000-0000-000000000000',
  NULL,
  'Better search functionality',
  'The current search only matches exact words. Would be great to have fuzzy search that can find results even with typos, and filter by date range, status, etc.',
  'improvement',
  'under_review',
  'low',
  11,
  'Chris Anderson',
  NOW() - INTERVAL '2 days'
) ON CONFLICT (id) DO NOTHING;

-- Post 12: Recent bug
INSERT INTO feedback_posts (id, board_id, user_id, title, description, category, status, priority, ticket_number, author_name, created_at)
VALUES (
  'deadbeef-000c-0000-0000-00000000000c',
  'deadbeef-0000-0000-0000-000000000000',
  NULL,
  'Email notifications arriving late',
  'I''m receiving email notifications about 2-3 hours after the actual event. This makes them less useful. Is there a delay in the email queue or something?',
  'bug_report',
  'under_review',
  'medium',
  12,
  'Nina Patel',
  NOW() - INTERVAL '1 day'
) ON CONFLICT (id) DO NOTHING;

-- 3. Create Sample Comments
-- Comments for Post 1 (Dark mode)
INSERT INTO feedback_comments (id, post_id, user_id, content, is_admin, created_at)
VALUES
  ('deadbeef-c001-0000-0000-000000000001', 'deadbeef-0001-0000-0000-000000000001', NULL, 'Yes please! My eyes would thank you.', false, NOW() - INTERVAL '44 days'),
  ('deadbeef-c002-0000-0000-000000000002', 'deadbeef-0001-0000-0000-000000000001', NULL, 'This is a must-have feature in 2024!', false, NOW() - INTERVAL '42 days'),
  ('deadbeef-c003-0000-0000-000000000003', 'deadbeef-0001-0000-0000-000000000001', NULL, 'We''ve heard your feedback and dark mode is now live! Check your settings to enable it.', true, NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- Comments for Post 2 (CSV Export)
INSERT INTO feedback_comments (id, post_id, user_id, content, is_admin, created_at)
VALUES
  ('deadbeef-c004-0000-0000-000000000004', 'deadbeef-0002-0000-0000-000000000002', NULL, 'This would be super helpful for our monthly reports.', false, NOW() - INTERVAL '28 days'),
  ('deadbeef-c005-0000-0000-000000000005', 'deadbeef-0002-0000-0000-000000000002', NULL, 'Great news - we''re actively working on this! Should be ready in the next sprint.', true, NOW() - INTERVAL '20 days'),
  ('deadbeef-c006-0000-0000-000000000006', 'deadbeef-0002-0000-0000-000000000002', NULL, 'Can''t wait! Will it include all fields or just the visible ones?', false, NOW() - INTERVAL '18 days'),
  ('deadbeef-c007-0000-0000-000000000007', 'deadbeef-0002-0000-0000-000000000002', NULL, 'You''ll be able to choose which fields to include in the export.', true, NOW() - INTERVAL '17 days')
ON CONFLICT (id) DO NOTHING;

-- Comments for Post 3 (Mobile app)
INSERT INTO feedback_comments (id, post_id, user_id, content, is_admin, created_at)
VALUES
  ('deadbeef-c008-0000-0000-000000000008', 'deadbeef-0003-0000-0000-000000000003', NULL, '+1 for this! Would use it daily.', false, NOW() - INTERVAL '23 days'),
  ('deadbeef-c009-0000-0000-000000000009', 'deadbeef-0003-0000-0000-000000000003', NULL, 'Please prioritize iOS first!', false, NOW() - INTERVAL '20 days'),
  ('deadbeef-c00a-0000-0000-00000000000a', 'deadbeef-0003-0000-0000-000000000003', NULL, 'Android user here - hoping for both platforms at launch!', false, NOW() - INTERVAL '18 days'),
  ('deadbeef-c00b-0000-0000-00000000000b', 'deadbeef-0003-0000-0000-000000000003', NULL, 'Mobile apps are on our 2024 roadmap. We''ll launch iOS and Android simultaneously.', true, NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- Comments for Post 4 (Safari bug)
INSERT INTO feedback_comments (id, post_id, user_id, content, is_admin, created_at)
VALUES
  ('deadbeef-c00c-0000-0000-00000000000c', 'deadbeef-0004-0000-0000-000000000004', NULL, 'I''m seeing the same issue on Safari 16.5', false, NOW() - INTERVAL '19 days'),
  ('deadbeef-c00d-0000-0000-00000000000d', 'deadbeef-0004-0000-0000-000000000004', NULL, 'Thanks for reporting! We''ve identified the issue and a fix is being deployed now.', true, NOW() - INTERVAL '18 days'),
  ('deadbeef-c00e-0000-0000-00000000000e', 'deadbeef-0004-0000-0000-000000000004', NULL, 'Confirmed fixed! Thanks for the quick turnaround.', false, NOW() - INTERVAL '17 days')
ON CONFLICT (id) DO NOTHING;

-- Comments for Post 5 (Keyboard shortcuts)
INSERT INTO feedback_comments (id, post_id, user_id, content, is_admin, created_at)
VALUES
  ('deadbeef-c00f-0000-0000-00000000000f', 'deadbeef-0005-0000-0000-000000000005', NULL, 'As a vim user, I''d love this!', false, NOW() - INTERVAL '14 days'),
  ('deadbeef-c010-0000-0000-000000000010', 'deadbeef-0005-0000-0000-000000000005', NULL, 'Cmd+K for command palette would be amazing', false, NOW() - INTERVAL '12 days')
ON CONFLICT (id) DO NOTHING;

-- Comments for Post 9 (2FA)
INSERT INTO feedback_comments (id, post_id, user_id, content, is_admin, created_at)
VALUES
  ('deadbeef-c011-0000-0000-000000000011', 'deadbeef-0009-0000-0000-000000000009', NULL, 'This is blocking us from using the product in production.', false, NOW() - INTERVAL '4 days'),
  ('deadbeef-c012-0000-0000-000000000012', 'deadbeef-0009-0000-0000-000000000009', NULL, 'Completely understand - 2FA is in active development and will be released this month.', true, NOW() - INTERVAL '3 days'),
  ('deadbeef-c013-0000-0000-000000000013', 'deadbeef-0009-0000-0000-000000000009', NULL, 'Will you support hardware keys like YubiKey as well?', false, NOW() - INTERVAL '2 days'),
  ('deadbeef-c014-0000-0000-000000000014', 'deadbeef-0009-0000-0000-000000000009', NULL, 'TOTP first, then we''ll add WebAuthn/hardware key support in a follow-up release.', true, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Comments for Post 11 (Search)
INSERT INTO feedback_comments (id, post_id, user_id, content, is_admin, created_at)
VALUES
  ('deadbeef-c015-0000-0000-000000000015', 'deadbeef-000b-0000-0000-00000000000b', NULL, 'Filters would be a game changer!', false, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- 4. Create Sample Votes (upvotes)
-- Note: These are anonymous votes since we don't have real user IDs
-- In production, you'd want actual user_ids

-- For a realistic demo, we'll skip votes since they require user_ids
-- The vote counts will show as 0, which is fine for a demo
-- Users can vote when they interact with the demo

-- =====================================================
-- Done! The demo board is now available at /demo
-- =====================================================

SELECT 'Demo board created successfully!' as result;
SELECT COUNT(*) as feedback_count FROM feedback_posts WHERE board_id = 'deadbeef-0000-0000-0000-000000000000';
SELECT COUNT(*) as comment_count FROM feedback_comments WHERE post_id IN (SELECT id FROM feedback_posts WHERE board_id = 'deadbeef-0000-0000-0000-000000000000');
