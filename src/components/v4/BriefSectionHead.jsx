// Section header for the brief — an icon tile in the segment's tone, the
// section title in the display serif, and a one-line blurb underneath.
// Shared by the creator review and the participant brief so a section looks
// the same wherever the brief is read.

import {
  Package, Target, Compass, ListChecks, Sparkle, BookOpen,
} from '@phosphor-icons/react';

const ICONS = { Package, Target, Compass, ListChecks, Sparkle, BookOpen };

export default function BriefSectionHead({ title, sub, icon, tone }) {
  const Icon = ICONS[icon] || Sparkle;
  const toneVars = tone
    ? { '--sec-tint': tone.bg, '--sec-accent': tone.fg }
    : undefined;
  return (
    <div className="v4-brief-group-head" style={toneVars}>
      <div className="v4-brief-group-headline">
        <span className="v4-brief-group-icon" aria-hidden="true">
          <Icon weight="duotone" size={15} />
        </span>
        <h3 className="v4-brief-group-title">{title}</h3>
      </div>
      {sub && <p className="v4-brief-group-sub">{sub}</p>}
    </div>
  );
}
