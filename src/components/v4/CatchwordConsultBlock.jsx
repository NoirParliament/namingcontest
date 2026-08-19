// CatchwordConsultBlock — a quiet "still stuck? get the pros" CTA
// that appears in two places:
//   1. The winner-phase ContestManage screen (replaces the
//      Cancel-contest button that lives there for active phases).
//   2. The Workspace (Settings) page underneath any cancelled
//      contests, as the natural follow-up.
//
// Tone is gentle, not pushy — naming is hard and Catchword is the
// agency NamingContest is built on top of, so the message reads as
// "if the crowd didn't crack it, here's the deeper option."

import { ArrowRight } from '@phosphor-icons/react';
import cwLogo from '../../assets/cwlogo.png';

export default function CatchwordConsultBlock({ headline, body }) {
  return (
    <aside className="v4-catchword-block" aria-label="Catchword consultation">
      <span className="v4-catchword-block-icon" aria-hidden="true">
        <img src={cwLogo} alt="Catchword" className="v4-catchword-block-logo" />
      </span>
      <div className="v4-catchword-block-text">
        <h3 className="v4-catchword-block-title">
          {headline || "Couldn’t find the right name?"}
        </h3>
        <p className="v4-catchword-block-body">
          {body || (
            <>
              Book a session with Catchword, the naming agency
              NamingContest is built on top of. They find names
              contests don’t.
            </>
          )}
        </p>
      </div>
      <a
        className="v4-catchword-block-cta"
        href="https://catchwordbranding.com/contact/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Book consultation <ArrowRight weight="bold" size={14} />
      </a>
    </aside>
  );
}
