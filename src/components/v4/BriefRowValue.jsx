// Brief row value — Stage 2 of the "beefier brief": when a row's answer is
// a set of picked options that have authored expansions (naming territories,
// styles, vibes), render each pick on its own line as a bold label plus a
// one-line meaning with examples, instead of a bare "A · B" join. Rows
// without expansions render exactly as before via the caller's formatter.

import { getExpansion, hasExpansions } from '../../data/v4/briefExpansions';

export default function BriefRowValue({ id, value, fallback, subId }) {
  if (!hasExpansions(id, value, subId)) return <>{fallback(value)}</>;
  const list = Array.isArray(value) ? value : [value];
  return (
    <span className="v4-brief-expand">
      {list.map((label) => {
        const exp = typeof label === 'string' ? getExpansion(id, label, subId) : null;
        return (
          <span key={String(label)} className="v4-brief-expand-item">
            <strong className="v4-brief-expand-label">
              {typeof label === 'string' ? label : fallback(label)}
            </strong>
            {exp && <span className="v4-brief-expand-text"> · {exp}</span>}
          </span>
        );
      })}
    </span>
  );
}
