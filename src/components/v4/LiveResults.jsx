// V4 Live Results panel — main results surface during voting phase.
// Two views (Names / Participants), search box, click any row to expand
// and see the submitter's rationale (Names) or what they submitted /
// voted on (Participants). Names are always sorted by vote count.

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  CaretDown, CaretRight, MagnifyingGlass,
} from '@phosphor-icons/react';
import {
  NAMES, PARTICIPANTS, getParticipantById, getParticipantStats,
} from '../../data/v4/mockContestData';

const COLLAPSED_COUNT = 5;

// Tone is driven by the contest's sub-segment (passed from ContestManage
// via getSegmentTone). Keeps participant avatars + accents cohesive with
// the rest of the page rather than a random rainbow.
const FALLBACK_TONE = { bg: '#fadecc', fg: '#9c4818' };

export default function LiveResults({ tone = FALLBACK_TONE, isMock = false }) {
  const [view, setView] = useState('names');     // 'names' | 'participants'
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const handleViewChange = (newView) => {
    setView(newView);
    setExpandedId(null);
    setSearch('');
    setShowAll(false);
  };

  // For real (user-launched) contests we don't have submissions wired
  // yet — show a charming empty state instead of pretending. The
  // football mock data only renders for the demo "Sunday football crew"
  // contest (where isMock=true).
  if (!isMock) {
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
            {NAMES.length} names · {PARTICIPANTS.length} voters · 89 votes
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
          search={search}
          expandedId={expandedId}
          onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
          showAll={showAll}
          collapsedCount={COLLAPSED_COUNT}
          onShowAllChange={setShowAll}
          tone={tone}
        />
      ) : (
        <ParticipantsList
          search={search}
          expandedId={expandedId}
          onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
          showAll={showAll}
          collapsedCount={COLLAPSED_COUNT}
          onShowAllChange={setShowAll}
          tone={tone}
        />
      )}
    </section>
  );
}

// Scroll trapping is handled by CSS `overscroll-behavior: contain` on
// .v4-results-scroller.is-scrolling — once the inner list hits its
// top/bottom, scroll won't bleed to the page. Native wheel handling
// stays in charge, so the feel matches the rest of the page.

// ── NAMES VIEW ──────────────────────────────────────────────────────
function NamesList({ search, expandedId, onToggle, showAll, collapsedCount, onShowAllChange, tone }) {
  const scrollerRef = useRef(null);
  const expandedRowRef = useRef(null);

  // Always sorted by vote count (top voted first)
  const filtered = useMemo(() => {
    let list = NAMES;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((n) => n.text.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => b.voteCount - a.voteCount);
    return list;
  }, [search]);

  const isScrolling = showAll && filtered.length > collapsedCount;

  // When a row expands inside the scroller, scroll it into view
  useEffect(() => {
    if (showAll && expandedId && expandedRowRef.current && scrollerRef.current) {
      expandedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [expandedId, showAll]);

  if (filtered.length === 0) {
    return <div className="v4-results-empty">No names match "{search}"</div>;
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
            // Top 3 get a fading wash of the segment tone — strongest at
            // rank 1, lightest at rank 3, none from rank 4 onward.
            const tintAlphas = ['CC', '66', '26']; // ~80% / ~40% / ~15%
            const rowTint = i < 3
              ? { background: `${tone.bg}${tintAlphas[i]}` }
              : undefined;
            return (
              <li
                key={name.id}
                ref={isExpanded ? expandedRowRef : null}
                className={`v4-results-row ${isExpanded ? 'is-expanded' : ''} ${i < 3 ? `v4-results-row-tier-${i + 1}` : ''}`}
                style={rowTint}
              >
                <button
                  type="button"
                  className="v4-results-row-trigger"
                  onClick={() => onToggle(name.id)}
                >
                  <div className="v4-results-rank">#{i + 1}</div>
                  <div className="v4-results-name">
                    <div className="v4-results-name-text">{name.text}</div>
                    <div className="v4-results-name-meta">
                      <span className="v4-results-submitter-pill">{submitter.name}</span>
                      {' · '}{name.submittedAgo}
                    </div>
                  </div>
                  <div className="v4-results-votes">
                    <div className="v4-results-votes-value">{name.voteCount}</div>
                    <div className="v4-results-votes-label">
                      {name.voteCount === 1 ? 'vote' : 'votes'}
                    </div>
                  </div>
                  <span className="v4-results-caret" aria-hidden="true">
                    {isExpanded ? <CaretDown size={14} weight="bold" /> : <CaretRight size={14} weight="bold" />}
                  </span>
                </button>
                {isExpanded && (
                  <div className="v4-results-row-body">
                    <NameDetail name={name} submitter={submitter} tone={tone} />
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
function NameDetail({ name, submitter, tone }) {
  return (
    <div className="v4-name-detail">
      {name.tagline && (
        <div className="v4-name-detail-tagline">"{name.tagline}"</div>
      )}
      <dl className="v4-name-detail-list">
        {name.description && (
          <div className="v4-name-detail-field">
            <dt>Description</dt>
            <dd>{name.description}</dd>
          </div>
        )}
        {name.whyItFits && (
          <div className="v4-name-detail-field">
            <dt>Why it fits</dt>
            <dd>{name.whyItFits}</dd>
          </div>
        )}
        {name.inspiration && (
          <div className="v4-name-detail-field">
            <dt>Inspiration</dt>
            <dd>{name.inspiration}</dd>
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
function ParticipantsList({ search, expandedId, onToggle, showAll, collapsedCount, onShowAllChange, tone }) {
  const scrollerRef = useRef(null);
  const expandedRowRef = useRef(null);

  // Always sorted by submitted count (most active first)
  const filtered = useMemo(() => {
    let list = PARTICIPANTS;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    list = list.map((p) => ({ ...p, stats: getParticipantStats(p.id) }));
    list.sort((a, b) => b.stats.submittedCount - a.stats.submittedCount);
    return list;
  }, [search]);

  const isScrolling = showAll && filtered.length > collapsedCount;

  useEffect(() => {
    if (showAll && expandedId && expandedRowRef.current && scrollerRef.current) {
      expandedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [expandedId, showAll]);

  if (filtered.length === 0) {
    return <div className="v4-results-empty">No participants match "{search}"</div>;
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
                    style={{ background: tone.bg, color: tone.fg }}
                    aria-hidden="true"
                  >
                    {p.initials}
                  </span>
                  <div className="v4-results-name">
                    <div className="v4-results-name-text">{p.name}</div>
                    <div className="v4-results-name-meta">
                      Submitted {p.stats.submittedCount} · Voted on {p.stats.votedOnCount}
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
                              <span className="v4-results-sub-votes">
                                {name.voteCount} {name.voteCount === 1 ? 'vote' : 'votes'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <div className="v4-results-sub-empty">
                        {p.name} hasn't submitted any names — but voted on {p.stats.votedOnCount}.
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
