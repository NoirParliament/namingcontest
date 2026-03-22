import { useNavigate } from 'react-router-dom';
import { getAllSegments } from '@/data/segments';
import './SegmentSelector.css';

const SEGMENT_GROUPS = getAllSegments();

export default function SegmentSelector() {
  const navigate = useNavigate();

  const handleGroupSelect = (groupId) => {
    navigate(`/select-segment/${groupId}`);
  };

  return (
    <section className="segment-selector" id="get-started">
      <div className="section-label">
        <span>Choose Your Category</span>
      </div>

      <h2 className="section-h2">
        What are you <span className="accent">naming?</span>
      </h2>

      <p className="section-lead">
        Select the category that best describes your project. Each has customized features and pricing.
      </p>

      <div className="group-cards">
        {SEGMENT_GROUPS.map((group) => (
          <button
            key={group.id}
            className={`group-card group-card-${group.id}`}
            onClick={() => handleGroupSelect(group.id)}
          >
            <div className="group-icon">{group.icon}</div>
            <h3>{group.name}</h3>
            <p className="group-sub-count">
              {group.subSegments.length} sub-categories
            </p>
            <p className="group-description">{group.description}</p>

            <div className="seg-list">
              {group.subSegments.slice(0, 3).map((sub) => (
                <div key={sub.id} className="seg-item">
                  <div className={`seg-dot seg-dot-${group.id}`}></div>
                  <span>{sub.name}</span>
                </div>
              ))}
              {group.subSegments.length > 3 && (
                <div className="seg-item">
                  <div className={`seg-dot seg-dot-${group.id}`}></div>
                  <span>+{group.subSegments.length - 3} more</span>
                </div>
              )}
            </div>

            <div className="group-card-arrow">→</div>
          </button>
        ))}
      </div>
    </section>
  );
}
