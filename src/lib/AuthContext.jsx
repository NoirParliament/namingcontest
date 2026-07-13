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

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
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
