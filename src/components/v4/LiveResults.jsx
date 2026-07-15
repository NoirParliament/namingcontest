// V4 Live Results panel — the main results surface on the creator
// dashboard. Two views (Names / Participants), search box, click any row
// to expand and see the submitter's rationale (Names) or what they
// submitted (Participants).
//
// Data is passed in per-contest (derived from the contest's OWN
// allSubmissions via buildLiveData) so every segment shows ITS names,
// not a shared set. Vote counts only appear once the contest is past
// the submission phase — during submissions we show names + recency
// only, since no one has voted yet.

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  CaretDown, CaretRight, MagnifyingGlass,
} from '@phosphor-icons/react';
import Avatar from 'boring-avatars';
import AnimatedCount from './AnimatedCount';
import { participantStatsFrom } from '../../utils/v4LiveData';

// Default Boring Avatars palette — only used if the caller doesn't
// supply a segment-specific palette via the `palette` prop. The
// segment palette comes from getSegmentPalette() so each contest's
// avatars sit inside its own colour family (sports = mint-led,
// baby = blush-led, band = periwinkle-led, etc.).
// Only the 5 NC panel pastels — accent-purple intentionally excluded
// because it only exists in the design as a faded decor dot, never
// as a solid block of colour.
const DEFAULT_AVATAR_PALETTE = ['#fadecc', '#fceebc', '#a6dcb3', '#c4dffb', '#b3c4f0'];

// Feature colour for the eyes/mouth of every beam avatar: the design
// system's primary ink (--fg, #030302). It's the same colour used for
// all body text and titles across NamingContest — heavily documented
// and used everywhere — just not as a "panel" colour. Black-out
// pastels would blend into the pastel faces, ink gives the faces real
// readable features without introducing a new colour.
const FEATURE_INK = '#030302';

const COLLAPSED_COUNT = 5;

const FALLBACK_TONE = { bg: '#fadecc', fg: '#9c4818' };

export default function LiveResults({
  tone = FALLBACK_TONE,
  palette = DEFAULT_AVATAR_PALETTE,
  names = [],
  participants = [],
  phase = 'voting',
  // Mock/demo contests fake a live "votes arriving" tick; real contests get
  // their live updates from the DB (realtime), so their counts must never be
  // fabricated. Pass false for real data.
  simulateVotes = true,
}) {
  const [view, setView] = useState('names');     // 'names' | 'participants'
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const showVotes = phase !== 'submission';
  const totalVotes = useMemo(
    () => names.reduce((sum, n) => sum + (n.voteCount || 0), 0),
    [names]
  );

  const getParticipantById = (id) =>
    participants.find((p) => p.id === id) || { name: 'Someone', initials: '··' };

  const handleViewChange = (newView) => {
    setView(newView);
    setExpandedId(null);
    setSearch('');
    setShowAll(false);
  };

  // No submissions yet (real user contest before backend is wired) —
  // a charming empty state instead of pretending.
  if (names.length === 0) {
    return (
      <section className="v4-results">
        <div className="v4-results-head">
          <div>
            <div className="v4-results-eyebrow">Live results</div>
            <div className="v4-results-stats">
              No submissions yet
            </div>
          </div>
        </div>
        <div className="v4-results-empty-state">
          <p>
            Names will roll in here as soon as your participants start
            submitting. Share the link to get the first ones flowing.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="v4-results">
      {/* Header */}
      <div className="v4-results-head">
        <div>
          <div className="v4-results-eyebrow">Live results</div>
          <div className="v4-results-stats">
            {showVotes
              ? `${names.length} names · ${participants.length} voters · ${totalVotes} votes`
              : `${names.length} names submitted · ${participants.length} people`}
          </div>
        </div>

        {/* View toggle */}
        <div className="v4-results-toggle" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'names'}
            className={`v4-results-toggle-btn ${view === 'names' ? 'is-active' : ''}`}
            onClick={() => handleViewChange('names')}
          >
            Names
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'participants'}
            className={`v4-results-toggle-btn ${view === 'participants' ? 'is-active' : ''}`}
            onClick={() => handleViewChange('participants')}
          >
            Participants
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="v4-results-controls">
        <div className="v4-results-search">
          <MagnifyingGlass weight="bold" size={14} className="v4-results-search-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={view === 'names' ? 'Search names…' : 'Search participants…'}
            className="v4-results-search-input"
          />
        </div>
      </div>

      {/* List */}
      {view === 'names' ? (
        <NamesList
          names={names}
          getParticipantById={getParticipantById}
          showVotes={showVotes}
          simulateVotes={simulateVotes}
          search={search}
          expandedId={expandedId}
          onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
          showAll={showAll}
          collapsedCount={COLLAPSED_COUNT}
          onShowAllChange={setShowAll}
          tone={tone}
          palette={palette}
        />
      ) : (
        <ParticipantsList
          names={names}
          participants={participants}
          showVotes={showVotes}
          search={search}
          expandedId={expandedId}
          onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
          showAll={showAll}
          collapsedCount={COLLAPSED_COUNT}
          onShowAllChange={setShowAll}
          tone={tone}
          palette={palette}
        />
      )}
    </section>
  );
}

// ── NAMES VIEW ──────────────────────────────────────────────────────
function NamesList({
  names, getParticipantById, showVotes, simulateVotes = true, search, expandedId, onToggle,
  showAll, collapsedCount, onShowAllChange, tone, palette,
}) {
  const scrollerRef = useRef(null);
  const expandedRowRef = useRef(null);

  // ── Ambient tick (voting phase only) ─────────────────────────────
  // Every ~12s pick a random name and increment its vote count by 1,
  // briefly pulse the row, and let the list re-sort naturally. Reads
  // as a live broadcast — votes arriving while you watch.
  const [bonusVotes, setBonusVotes] = useState({}); // { nameId: +N }
  const [pulsedId, setPulsedId] = useState(null);
  useEffect(() => {
    if (!simulateVotes) return;      // real contest — never fabricate votes
    if (!showVotes) return;          // submission phase has no votes yet
    if (!names || names.length === 0) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const interval = setInterval(() => {
      // Weight selection slightly toward already-voted names (~2x)
      // so ticks feel like momentum, not pure random scatter.
      const weighted = names.flatMap((n) =>
        Array((n.voteCount || 0) > 0 ? 2 : 1).fill(n.id)
      );
      const pickId = weighted[Math.floor(Math.random() * weighted.length)];
      if (!pickId) return;
      setBonusVotes((prev) => ({ ...prev, [pickId]: (prev[pickId] || 0) + 1 }));
      setPulsedId(pickId);
      window.setTimeout(() => setPulsedId((cur) => (cur === pickId ? null : cur)), 1100);
    }, 12000);
    return () => clearInterval(interval);
  }, [simulateVotes, showVotes, names]);

  // Combined vote = mock baseline + simulated ticks. The filtered
  // sort below uses this, so the leaderboard re-orders as votes
  // arrive (snap re-order — keeps it CSS-only).
  const liveVotes = useMemo(() => {
    const map = new Map();
    for (const n of names) map.set(n.id, (n.voteCount || 0) + (bonusVotes[n.id] || 0));
    return map;
  }, [names, bonusVotes]);

  // Past submission: rank by combined votes. During submission: keep
  // submission order (most recent first), which is how the list arrives.
  const filtered = useMemo(() => {
    let list = names;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((n) => n.text.toLowerCase().includes(q));
    }
    if (showVotes) {
      list = [...list].sort(
        (a, b) => (liveVotes.get(b.id) || 0) - (liveVotes.get(a.id) || 0)
      );
    }
    return list;
  }, [names, search, showVotes, liveVotes]);

  const isScrolling = showAll && filtered.length > collapsedCount;

  useEffect(() => {
    if (showAll && expandedId && expandedRowRef.current && scrollerRef.current) {
      expandedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [expandedId, showAll]);

  if (filtered.length === 0) {
    return <div className="v4-results-empty">No names match “{search}”</div>;
  }

  const visible = showAll ? filtered : filtered.slice(0, collapsedCount);

  return (
    <>
      <div
        ref={scrollerRef}
        className={`v4-results-scroller ${isScrolling ? 'is-scrolling' : ''}`}
      >
        <ul className="v4-results-list">
          {visible.map((name, i) => {
            const submitter = getParticipantById(name.submittedBy);
            const isExpanded = expandedId === name.id;
            const isPulsing = pulsedId === name.id;
            const liveCount = liveVotes.get(name.id) ?? (name.voteCount || 0);
            // Top-3 segment wash ONLY during voting — that's when a
            // ranking exists. In submission phase every name is equal
            // (no votes yet), so rows stay plain white. The wash is
            // delivered via a CSS variable on the row + a delayed
            // pseudo-element animation so the top-3 colour "reveals
            // last" after the cascade lands.
            const tintAlphas = ['CC', '66', '26'];
            const tierColor = showVotes && i < 3 ? `${tone.bg}${tintAlphas[i]}` : null;
            // Two cascade groups:
            //   - First `collapsedCount` rows (initial scoreboard view):
            //     60ms stagger, the dramatic "names loading in" reveal.
            //   - Rows past that (only visible when user clicks "Show all
            //     names"): faster 20ms stagger starting from 0, so the
            //     expansion arrives as a quick group rather than 10 rows
            //     all popping in at the same capped delay.
            const enterDelay = i < collapsedCount
              ? i * 0.06
              : (i - collapsedCount) * 0.02;
            const rowStyle = {
              '--enter-delay': `${enterDelay}s`,
              ...(tierColor && { '--tier-tint': tierColor }),
            };
            return (
              <li
                key={name.id}
                ref={isExpanded ? expandedRowRef : null}
                className={[
                  'v4-results-row',
                  'v4-results-row-cascade',
                  isExpanded ? 'is-expanded' : '',
                  showVotes && i < 3 ? `v4-results-row-tier-${i + 1}` : '',
                  isPulsing ? 'is-pulsing' : '',
                ].filter(Boolean).join(' ')}
                style={rowStyle}
              >
                <button
                  type="button"
                  className={`v4-results-row-trigger ${showVotes ? '' : 'is-novotes'}`}
                  onClick={() => onToggle(name.id)}
                >
                  {/* Ranking number only makes sense once there are
                      votes to rank by — during submission we hide it
                      so the list reads as "names coming in," not "1st
                      place / 2nd place." */}
                  {showVotes && <div className="v4-results-rank">#{i + 1}</div>}
                  <div className="v4-results-name">
                    <div className="v4-results-name-text">{name.text}</div>
                    <div className="v4-results-name-meta">
                      <span className="v4-results-submitter-pill">{submitter.name}</span>
                      {' · '}{name.submittedAgo}
                    </div>
                  </div>
                  {showVotes && (
                    <div className="v4-results-votes">
                      <div className="v4-results-votes-value">
                        {/* Start the count-up AFTER the row's cascade
                            entrance lands. Initial-cascade rows wait
                            for their stagger + 420ms cascade duration;
                            expansion rows (clicked "Show all") use the
                            fast 20ms stagger + same cascade duration
                            so their numbers tick up quickly together. */}
                        <AnimatedCount
                          value={liveCount}
                          durationMs={1600}
                          startDelayMs={(
                            i < collapsedCount
                              ? i * 60 + 420
                              : (i - collapsedCount) * 20 + 420
                          )}
                        />
                      </div>
                      <div className="v4-results-votes-label">
                        {liveCount === 1 ? 'vote' : 'votes'}
                      </div>
                    </div>
                  )}
                  <span className="v4-results-caret" aria-hidden="true">
                    {isExpanded ? <CaretDown size={14} weight="bold" /> : <CaretRight size={14} weight="bold" />}
                  </span>
                </button>
                {isExpanded && (
                  <div className="v4-results-row-body">
                    <NameDetail name={name} submitter={submitter} tone={tone} showVotes={showVotes} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {filtered.length > collapsedCount && (
        <button
          type="button"
          className="v4-results-showmore"
          onClick={() => onShowAllChange(!showAll)}
        >
          {showAll ? `Show top ${collapsedCount}` : 'Show all names'}
        </button>
      )}
    </>
  );
}

// ── NAME DETAIL — submitter rationale shown on row expand ───────────
function NameDetail({ name, submitter, tone, showVotes }) {
  return (
    <div className="v4-name-detail">
      <dl className="v4-name-detail-list">
        {name.whyItFits && (
          <div className="v4-name-detail-field">
            <dt>Why it fits</dt>
            <dd>{name.whyItFits}</dd>
          </div>
        )}
        {name.submittedAgo && (
          <div className="v4-name-detail-field">
            <dt>Submitted</dt>
            <dd>{name.submittedAgo}</dd>
          </div>
        )}
        {showVotes && typeof name.voteCount === 'number' && (
          <div className="v4-name-detail-field">
            <dt>Current votes</dt>
            <dd>{name.voteCount} {name.voteCount === 1 ? 'vote' : 'votes'}</dd>
          </div>
        )}
      </dl>
      <div className="v4-name-detail-foot">
        Submitted by{' '}
        <span
          className="v4-results-submitter-pill is-chip"
          style={{ background: tone.bg, color: tone.fg }}
        >
          {submitter.name}
        </span>
      </div>
    </div>
  );
}

// ── PARTICIPANTS VIEW ───────────────────────────────────────────────
function ParticipantsList({
  names, participants, showVotes, search, expandedId, onToggle,
  showAll, collapsedCount, onShowAllChange, tone, palette,
}) {
  const scrollerRef = useRef(null);
  const expandedRowRef = useRef(null);

  // Sorted by submitted count (most active first).
  const filtered = useMemo(() => {
    let list = participants;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    list = list.map((p) => ({ ...p, stats: participantStatsFrom(names, p) }));
    list.sort((a, b) => b.stats.submittedCount - a.stats.submittedCount);
    return list;
  }, [participants, names, search]);

  const isScrolling = showAll && filtered.length > collapsedCount;

  useEffect(() => {
    if (showAll && expandedId && expandedRowRef.current && scrollerRef.current) {
      expandedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [expandedId, showAll]);

  if (filtered.length === 0) {
    return <div className="v4-results-empty">No participants match “{search}”</div>;
  }

  const visible = showAll ? filtered : filtered.slice(0, collapsedCount);

  return (
    <>
      <div
        ref={scrollerRef}
        className={`v4-results-scroller ${isScrolling ? 'is-scrolling' : ''}`}
      >
        <ul className="v4-results-list">
          {visible.map((p) => {
            const isExpanded = expandedId === p.id;
            return (
              <li
                key={p.id}
                ref={isExpanded ? expandedRowRef : null}
                className={`v4-results-row ${isExpanded ? 'is-expanded' : ''}`}
              >
                <button
                  type="button"
                  className="v4-results-row-trigger"
                  onClick={() => onToggle(p.id)}
                >
                  <span
                    className="v4-results-avatar"
                    style={{ '--avatar-feature': FEATURE_INK }}
                    aria-hidden="true"
                  >
                    <Avatar
                      name={p.name || p.id}
                      size={32}
                      variant="beam"
                      colors={palette}
                      square={false}
                    />
                  </span>
                  <div className="v4-results-name">
                    <div className="v4-results-name-text">{p.name}</div>
                    <div className="v4-results-name-meta">
                      {showVotes
                        ? `Submitted ${p.stats.submittedCount} · Voted on ${p.stats.votedOnCount}`
                        : `Submitted ${p.stats.submittedCount}`}
                    </div>
                  </div>
                  <span className="v4-results-caret" aria-hidden="true">
                    {isExpanded ? <CaretDown size={14} weight="bold" /> : <CaretRight size={14} weight="bold" />}
                  </span>
                </button>
                {isExpanded && (
                  <div className="v4-results-row-body">
                    {p.stats.submittedNames.length > 0 ? (
                      <>
                        <div className="v4-results-sub-head">
                          Submitted by {p.name}
                        </div>
                        <ul className="v4-results-sub-list">
                          {p.stats.submittedNames.map((name) => (
                            <li key={name.id} className="v4-results-sub-row">
                              <span className="v4-results-sub-name">{name.text}</span>
                              {showVotes && (
                                <span className="v4-results-sub-votes">
                                  {name.voteCount} {name.voteCount === 1 ? 'vote' : 'votes'}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <div className="v4-results-sub-empty">
                        {p.name} hasn’t submitted any names yet.
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {filtered.length > collapsedCount && (
        <button
          type="button"
          className="v4-results-showmore"
          onClick={() => onShowAllChange(!showAll)}
        >
          {showAll ? `Show top ${collapsedCount}` : 'Show all participants'}
        </button>
      )}
    </>
  );
}
