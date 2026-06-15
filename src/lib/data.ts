import type { Tweet } from './types';
import { supabase } from './supabase';

export async function fetchTweets(): Promise<Tweet[]> {
  const { data, error } = await supabase
    .from('tweets')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching tweets:', error);
    return [];
  }

  return (data || []) as Tweet[];
}

export function filterTweets(tweets: Tweet[], searchQuery: string, keywordFilter: string, dateFrom: string, dateTo: string): Tweet[] {
  return tweets.filter(t => {
    const matchesSearch = !searchQuery ||
      t.full_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesKeyword = !keywordFilter ||
      Object.values(t.extra_columns).some(v =>
        v.toLowerCase().includes(keywordFilter.toLowerCase())
      ) ||
      Object.keys(t.extra_columns).some(k =>
        k.toLowerCase().includes(keywordFilter.toLowerCase())
      ) ||
      t.full_text.toLowerCase().includes(keywordFilter.toLowerCase());

    const tweetDate = new Date(t.created_at).toISOString().split('T')[0];
    const matchesDateFrom = !dateFrom || tweetDate >= dateFrom;
    const matchesDateTo = !dateTo || tweetDate <= dateTo;

    return matchesSearch && matchesKeyword && matchesDateFrom && matchesDateTo;
  });
}
