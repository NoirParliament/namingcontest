// App-wide auth state, backed by Supabase. One source of truth for "who is
// signed in" — replaces the scattered localStorage identity of the prototype.
//
// On load it reads any existing session (this also completes a magic-link
// redirect: supabase-js parses the token out of the URL and stores it), then
// keeps `session`/`user` in sync via onAuthStateChange.
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext({
  session: null,
  user: null,
  loading: true,
  signInWithEmail: async () => {},
  signOut: async () => {},
});

// The v4_contest_setup blob is the guest identity — email, display name,
// photo, and the contest being built before an account exists. It outlives a
// browsing session, so someone who tried the demo and later signed in for
// real still carried the demo's identity around: pages that fall back to the
// blob showed the wrong name, and the landing page's redirect sent them into
// the demo's contest.
//
// When a real session appears under a DIFFERENT email, that blob belongs to
// someone else — drop its identity. Brief answers are deliberately left
// alone: a guest part-way through building a contest keeps their work when
// they sign in, which is the whole point of letting them start without an
// account.
function dropForeignSetup(session) {
  const email = session?.user?.email;
  if (!email) return;
  try {
    const raw = localStorage.getItem('v4_contest_setup');
    if (!raw) return;
    const setup = JSON.parse(raw);
    if (!setup?.userEmail || setup.userEmail.toLowerCase() === email.toLowerCase()) return;
    delete setup.userEmail;
    delete setup.userName;
    delete setup.userPhoto;
    delete setup.contestId;
    delete setup.winner;
    localStorage.setItem('v4_contest_setup', JSON.stringify(setup));
  } catch { /* unparseable or storage blocked — the session is still the truth */ }
}

// Supabase reports a rejected magic link by redirecting to the app with the
// reason in the URL — `#error=access_denied&error_code=otp_expired` and
// friends — rather than by throwing. Nothing read it, so a dead link landed
// you on an empty namespace that looked like a working but blank account.
// The commonest cause is a link that was already opened: they're one-time,
// and mail scanners often follow them before the recipient does.
function readAuthError() {
  try {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const query = new URLSearchParams(window.location.search);
    const code = hash.get('error_code') || query.get('error_code');
    const desc = hash.get('error_description') || query.get('error_description');
    if (!code && !desc) return null;
    return {
      code: code || 'unknown',
      message: (desc || '').replace(/\+/g, ' ') || 'That sign-in link did not work.',
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(() => readAuthError());

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      dropForeignSetup(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      dropForeignSetup(s);
      // A session arriving means whatever went wrong before is history.
      if (s) setAuthError(null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    authError,
    clearAuthError: () => setAuthError(null),
    // Sends a real magic link. `redirectTo` is where the emailed link lands
    // (defaults to the app root on the current origin — localhost in dev,
    // the deployed URL in prod).
    signInWithEmail: (email, redirectTo) =>
      supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo || window.location.origin },
      }),
    // Starts an email change. Supabase emails a confirmation link and only
    // moves the address once it's clicked — the session (and therefore where
    // future magic links go) is untouched until then, so a typo can't lock
    // anyone out. With "Secure email change" on (Supabase's default) it
    // confirms from BOTH the old and new address; the UI says so.
    changeEmail: (newEmail, redirectTo) =>
      supabase.auth.updateUser(
        { email: newEmail.trim() },
        { emailRedirectTo: redirectTo || `${window.location.origin}/v4/settings` }
      ),
    signOut: () => supabase.auth.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
