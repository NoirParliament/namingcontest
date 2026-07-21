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

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

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
    // Sends a real magic link. `redirectTo` is where the emailed link lands
    // (defaults to the app root on the current origin — localhost in dev,
    // the deployed URL in prod).
    signInWithEmail: (email, redirectTo) =>
      supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo || window.location.origin },
      }),
    signOut: () => supabase.auth.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
