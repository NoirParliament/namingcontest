// Hosts can't suggest names or vote in their own contest (enforced in the
// database too, migration 0031). If the signed-in host lands on their own
// contest's submit or vote page, send them to their dashboard instead.
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function useHostRedirect(contestId, user, navigate, enabled = true) {
  useEffect(() => {
    if (!enabled || !contestId || !user?.id) return undefined;
    let active = true;
    supabase.from('contests').select('id').eq('id', contestId).eq('creator_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (active && data) navigate(`/v4/contest/${contestId}`, { replace: true });
      });
    return () => { active = false; };
  }, [contestId, user?.id, navigate, enabled]);
}
