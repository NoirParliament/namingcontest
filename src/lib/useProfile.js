// Cached profile hook — one source for the signed-in user's profile row
// (display_name, avatar_url) with a localStorage cache so headers paint
// the real avatar on the FIRST frame instead of flashing the generated
// placeholder while each page refetches from Supabase.
//
// Usage: const [profile, setProfile] = useProfile(user);
// - First render returns the cached row (if it belongs to this user).
// - A background fetch then refreshes state + cache.
// - setProfile(next) updates both state and cache (e.g. after the credit
//   step saves a display name), so the next page's first paint is right.
//
// The cache key starts with v4_ on purpose: the sign-out sweeps clear all
// v4_* keys, so a signed-out browser holds no stale identity.

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';

const KEY = 'v4_profile_cache';

export function readProfileCache(userId) {
  if (!userId) return null;
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || 'null');
    return c && c.id === userId ? c : null;
  } catch {
    return null;
  }
}

export function writeProfileCache(userId, patch) {
  if (!userId) return;
  try {
    const cur = readProfileCache(userId) || { id: userId };
    localStorage.setItem(KEY, JSON.stringify({ ...cur, ...patch, id: userId }));
  } catch { /* localStorage unavailable */ }
}

export function useProfile(user) {
  const userId = user?.id;
  const [profile, setProfileState] = useState(() => readProfileCache(userId));

  useEffect(() => {
    if (!userId) { setProfileState(null); return; }
    // Serve the cache instantly when the user arrives after mount (the
    // initializer above only covers the first render).
    setProfileState(readProfileCache(userId));
    let active = true;
    supabase.from('profiles').select('*').eq('id', userId).single()
      .then(({ data }) => {
        if (!active || !data) return;
        setProfileState(data);
        writeProfileCache(userId, data);
      });
    return () => { active = false; };
  }, [userId]);

  const setProfile = useCallback((next) => {
    setProfileState((prev) => {
      const value = typeof next === 'function' ? next(prev) : next;
      if (userId && value) writeProfileCache(userId, value);
      return value;
    });
  }, [userId]);

  return [profile, setProfile];
}
