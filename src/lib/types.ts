export interface Tweet {
  id: string;
  username: string;
  full_text: string;
  created_at: string;
  location: string | null;
  in_reply_to_screen_name: string | null;
  image_url: string | null;
  tweet_url: string | null;
  engagement: number;
  extra_columns: Record<string, string>;
}
