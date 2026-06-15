CREATE TABLE tweets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  full_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  in_reply_to_screen_name TEXT,
  image_url TEXT,
  tweet_url TEXT,
  engagement INTEGER DEFAULT 0,
  extra_columns JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_tweets" ON tweets FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "insert_tweets" ON tweets FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "update_tweets" ON tweets FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "delete_tweets" ON tweets FOR DELETE
  TO authenticated USING (true);
