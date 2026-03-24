import './Hero.css';

export default function Hero({ onGetStarted }) {
  return (
    <section className="hero">
      <div className="hero-bg-glow"></div>
      <div className="hero-grid"></div>

      <div className="hero-content">
        <div className="hero-eyebrow">Free & Paid Naming Contests</div>
        
        <h1>
          Get the perfect name from <span className="accent">people who care</span>
        </h1>

        <p className="hero-sub">
          Run a collaborative naming contest for your business, team, or personal project
        </p>

        <p className="hero-meta">
          Powered by Catchword, the #1 Ranked Naming Agency Worldwide
        </p>

        <div className="hero-pills">
          <span className="hero-pill p-biz">Companies & Startups</span>
          <span className="hero-pill p-team">Teams & Groups</span>
          <span className="hero-pill p-pers">Personal Projects</span>
        </div>

        <button className="hero-cta" onClick={onGetStarted}>
          Get Started Free →
        </button>
      </div>

      <div className="hero-scroll">
        <span>Explore</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
}
