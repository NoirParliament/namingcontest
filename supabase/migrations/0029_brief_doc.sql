-- ============================================================================
-- The composed brief: the participant-facing document written from the
-- creator's answers (Claude, via the compose-brief edge function), then
-- hand-edited by the creator on the review page and frozen at launch.
--
-- Why a separate column and not brief->'composed': `brief` holds the
-- creator's raw answers with frozen question ids, read by the fallback card,
-- the dashboard recap and the RPCs (brief->>'intro', brief->>'projectSummary').
-- The composed text is a different thing: generated, editable prose that can
-- be regenerated or dropped without touching the answers. Keeping them apart
-- means a bad generation can never corrupt an answer, and the fallback (no
-- doc = show the answers) is just "column is null".
--
-- Shape (jsonb, written by the app at launch, read as-is by every brief card):
--   {
--     "about":       "One paragraph of facts about what is being named.",
--     "shouldDo":    [{ "label": "Short and warm", "text": "..." }, ...],
--     "explore":     ["...", ...] | ["Open"],
--     "avoid":       ["...", ...] | ["Open"],
--     "watchouts":   [{ "name": "Lucy", "note": "..." }, ...],
--     "constraints": ["...", ...],
--     "edited":      true | false,       -- creator changed the text by hand
--     "generatedAt": "2026-10-01T10:00:00Z",
--     "model":       "claude-opus-5-5",
--     "sourceHash":  "sha256 of the answers it was written from"
--   }
--
-- Access: no new policies. Creators insert it with the row (contests_insert)
-- and read it back (contests_read); participants read it through the same
-- contests_read policy once they have joined, exactly like `brief`. The
-- public join / winner RPCs keep exposing brief->>'intro' and don't read this.
-- The reporting views (0028) select named columns, so nothing leaks to Looker.
-- ============================================================================

alter table public.contests
  add column if not exists brief_doc jsonb;

comment on column public.contests.brief_doc is
  'Composed participant-facing brief (Claude + creator edits), frozen at launch. Null = show the raw answers.';
