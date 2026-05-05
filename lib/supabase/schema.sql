-- DeutschMaster Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================================
-- USERS & SETTINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS user_settings (
  user_id            TEXT PRIMARY KEY,
  daily_goal_words   INT DEFAULT 10,
  daily_goal_minutes INT DEFAULT 30,
  current_level      TEXT DEFAULT 'A2',
  target_level       TEXT DEFAULT 'B1',
  profession         TEXT,
  weak_areas         TEXT[] DEFAULT '{}',
  preferred_topics   TEXT[] DEFAULT '{}',
  interface_theme    TEXT DEFAULT 'system',
  streak_count       INT DEFAULT 0,
  streak_last_date   DATE,
  total_study_days   INT DEFAULT 0,
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VOCABULARY
-- ============================================================

CREATE TABLE IF NOT EXISTS vocabulary_words (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  german           TEXT NOT NULL,
  translation_ru   TEXT NOT NULL,
  translation_en   TEXT,
  article          TEXT,
  plural           TEXT,
  word_type        TEXT NOT NULL DEFAULT 'noun',
  cefr_level       TEXT NOT NULL DEFAULT 'A2',
  topic            TEXT,
  frequency_rank   INT,
  example_de       TEXT,
  example_ru       TEXT,
  audio_url        TEXT,
  notes            TEXT,
  is_system        BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_words_level ON vocabulary_words(cefr_level);
CREATE INDEX IF NOT EXISTS idx_words_topic ON vocabulary_words(topic);
CREATE INDEX IF NOT EXISTS idx_words_type ON vocabulary_words(word_type);

CREATE TABLE IF NOT EXISTS verb_data (
  word_id          UUID PRIMARY KEY REFERENCES vocabulary_words(id) ON DELETE CASCADE,
  infinitive       TEXT NOT NULL,
  praesens_ich     TEXT,
  praesens_du      TEXT,
  praesens_er      TEXT,
  praeteritum      TEXT,
  perfekt          TEXT,
  partizip_2       TEXT,
  hilfsverb        TEXT DEFAULT 'haben',
  is_trennbar      BOOLEAN DEFAULT FALSE,
  prefix           TEXT,
  case_governance  TEXT,
  case_example     TEXT,
  is_reflexive     BOOLEAN DEFAULT FALSE,
  reflexive_case   TEXT
);

CREATE TABLE IF NOT EXISTS noun_data (
  word_id           UUID PRIMARY KEY REFERENCES vocabulary_words(id) ON DELETE CASCADE,
  declension_type   TEXT,
  gen_singular      TEXT,
  dat_singular      TEXT,
  akk_singular      TEXT,
  gen_plural        TEXT,
  dat_plural        TEXT,
  akk_plural        TEXT
);

CREATE TABLE IF NOT EXISTS user_word_progress (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id           UUID NOT NULL REFERENCES vocabulary_words(id) ON DELETE CASCADE,
  status            TEXT DEFAULT 'new',
  ease_factor       FLOAT DEFAULT 2.5,
  interval_days     INT DEFAULT 0,
  repetition_count  INT DEFAULT 0,
  due_date          DATE DEFAULT CURRENT_DATE,
  last_reviewed_at  TIMESTAMPTZ,
  correct_count     INT DEFAULT 0,
  wrong_count       INT DEFAULT 0,
  added_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_due ON user_word_progress(user_id, due_date, status);

ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON user_word_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS srs_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id         UUID NOT NULL REFERENCES vocabulary_words(id) ON DELETE CASCADE,
  rating          TEXT NOT NULL,
  time_taken_ms   INT,
  reviewed_at     TIMESTAMPTZ DEFAULT NOW(),
  interval_before INT,
  interval_after  INT
);

CREATE INDEX IF NOT EXISTS idx_reviews_user ON srs_reviews(user_id, reviewed_at);

ALTER TABLE srs_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reviews" ON srs_reviews
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- GRAMMAR
-- ============================================================

CREATE TABLE IF NOT EXISTS grammar_topics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title_de      TEXT NOT NULL,
  title_ru      TEXT NOT NULL,
  cefr_level    TEXT NOT NULL,
  category      TEXT NOT NULL,
  order_index   INT NOT NULL,
  content_json  JSONB NOT NULL DEFAULT '{}',
  exercises     JSONB NOT NULL DEFAULT '[]',
  mini_test     JSONB NOT NULL DEFAULT '[]',
  is_published  BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_grammar_level ON grammar_topics(cefr_level, order_index);

CREATE TABLE IF NOT EXISTS user_grammar_progress (
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id         UUID NOT NULL REFERENCES grammar_topics(id) ON DELETE CASCADE,
  status           TEXT DEFAULT 'not_started',
  score            INT,
  attempts         INT DEFAULT 0,
  last_studied_at  TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  PRIMARY KEY (user_id, topic_id)
);

ALTER TABLE user_grammar_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own grammar progress" ON user_grammar_progress
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- DAILY PLAN
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_date       DATE NOT NULL,
  status          TEXT DEFAULT 'pending',
  plan_json       JSONB NOT NULL DEFAULT '{}',
  steps_total     INT NOT NULL DEFAULT 0,
  steps_completed INT DEFAULT 0,
  score           INT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  UNIQUE(user_id, plan_date)
);

ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own plans" ON daily_plans
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- WRITING
-- ============================================================

CREATE TABLE IF NOT EXISTS writing_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'formal',
  topic           TEXT NOT NULL,
  cefr_level      TEXT NOT NULL DEFAULT 'B1',
  prompt          TEXT NOT NULL,
  structure       JSONB NOT NULL DEFAULT '{}',
  example         TEXT NOT NULL,
  key_phrases     TEXT[] DEFAULT '{}',
  vocabulary_ids  UUID[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS user_writings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id     UUID REFERENCES writing_templates(id),
  content         TEXT NOT NULL,
  ai_feedback     JSONB,
  score           INT,
  errors_count    INT,
  written_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_writings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own writings" ON user_writings
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- STATS
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_stats (
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stat_date         DATE NOT NULL,
  words_reviewed    INT DEFAULT 0,
  words_learned     INT DEFAULT 0,
  minutes_studied   INT DEFAULT 0,
  grammar_completed INT DEFAULT 0,
  writings_done     INT DEFAULT 0,
  avg_accuracy      FLOAT,
  PRIMARY KEY (user_id, stat_date)
);

ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own stats" ON daily_stats
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTION: auto-create user settings on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
