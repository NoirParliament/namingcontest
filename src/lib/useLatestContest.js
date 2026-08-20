// The signed-in creator's most-recent live contest, shaped for the account
// menu's "active contest" card. Centralised here so EVERY AvatarMenu (home,
// namespace, chat, tier pick, review…) shows the same card and jump target,
// instead of only the two pages that happened to wire the query inline.
//
// Mirrors Settings' active list: cancelled + draft are excluded, so a
// cancelled contest never shows as "LIVE" and an unlaunched draft never shows
// at all. Returns null when there's no user or no qualifying contest.

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { getSegmentTone } from '../data/v4/segmentTheme';

export function useLatestContest(userId) {
  const [row, setRow] = useState(null);
  useEffect(() => {
    if (!userId) { setRow(null); return; }
    let active = true;
    supabase
      .from('contests')
      .select('*')
      .eq('creator_id', userId)
      .neq('status', 'cancelled')
      .neq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (active) setRow(data || null); });
    return () => { active = false; };
  }, [userId]);

  if (!row) return null;
  return {
    id: row.id,
    name: row.working_name || 'Your contest',
    phase: row.status === 'submission' ? 'Submissions'
      : row.status === 'voting' ? 'Voting'
      : row.status === 'closed' ? 'Winner' : 'Live',
    tone: getSegmentTone(row.sub_segment_id || 'b1'),
    to: `/v4/contest/${row.id}`,
    contest: row,
  };
}
