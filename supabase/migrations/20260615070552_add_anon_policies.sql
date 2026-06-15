CREATE POLICY "anon_select_tweets" ON tweets FOR SELECT
  TO anon USING (true);

CREATE POLICY "anon_insert_tweets" ON tweets FOR INSERT
  TO anon WITH CHECK (true);
