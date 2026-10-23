import type { ResearchSession, Tweet } from './types';
import { supabase } from './supabase';

export async function fetchTweets(): Promise<Tweet[]> {
  const { data, error } = await supabase.from('tweets').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching tweets:', error);
    return [];
  }
  return (data || []) as Tweet[];
}

export async function fetchResearchSessions(): Promise<ResearchSession[]> {
  const { data, error } = await supabase.from('research_sessions').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as ResearchSession[];
}

export async function saveResearchSession(session: ResearchSession): Promise<ResearchSession> {
  const { data, error } = await supabase.from('research_sessions').insert({ topic: session.topic, goal: session.goal, queries: session.queries }).select().maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Research session was not returned after saving.');
  return data as ResearchSession;
}

export function filterTweets(tweets: Tweet[], searchQuery: string, keywordFilter: string, dateFrom: string, dateTo: string): Tweet[] {
  return tweets.filter(t => {
    const matchesSearch = !searchQuery || t.full_text.toLowerCase().includes(searchQuery.toLowerCase()) || t.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesKeyword = !keywordFilter || Object.values(t.extra_columns).some(v => v.toLowerCase().includes(keywordFilter.toLowerCase())) || Object.keys(t.extra_columns).some(k => k.toLowerCase().includes(keywordFilter.toLowerCase())) || t.full_text.toLowerCase().includes(keywordFilter.toLowerCase());
    const tweetDate = new Date(t.created_at).toISOString().split('T')[0];
    return matchesSearch && matchesKeyword && (!dateFrom || tweetDate >= dateFrom) && (!dateTo || tweetDate <= dateTo);
  });
}
