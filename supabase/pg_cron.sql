-- ============================================================
-- NailKarte — pg_cron ジョブ登録
-- Supabase SQL エディタで実行してください
-- ※ pg_cron は Supabase Pro プランで利用可能
-- ============================================================

-- 環境変数（本番 URL と CRON_SECRET を設定してから実行）
-- NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
-- CRON_SECRET = 任意の強い秘密鍵

-- ----------------------------------------------------------------
-- 1. LINE リマインド送信（毎日 9:00 JST = 00:00 UTC）
-- ----------------------------------------------------------------
select cron.schedule(
  'nailkarte-remind',
  '0 0 * * *',
  $$
  select net.http_post(
    url := 'https://your-app.vercel.app/api/cron/remind',
    headers := '{"Content-Type": "application/json", "x-cron-secret": "YOUR_CRON_SECRET"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- ----------------------------------------------------------------
-- 2. 古いデータのクリーンアップ（毎日 2:00 JST = 17:00 UTC 前日）
-- ----------------------------------------------------------------
select cron.schedule(
  'nailkarte-cleanup',
  '0 17 * * *',
  $$
  select net.http_post(
    url := 'https://your-app.vercel.app/api/cron/cleanup',
    headers := '{"Content-Type": "application/json", "x-cron-secret": "YOUR_CRON_SECRET"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- ----------------------------------------------------------------
-- 3. Keep-alive（Supabase 無料プランのスリープ防止、毎日）
-- ----------------------------------------------------------------
select cron.schedule(
  'nailkarte-keepalive',
  '0 12 * * *',
  $$
  select count(*) from owners;
  $$
);

-- ジョブ確認
select * from cron.job;
