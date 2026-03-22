import './HowItWorks.css';

const steps = [
  {
    number: '01',
    title: 'Choose Your Category',
    description: 'Select whether you\'re naming a business, team, or personal project. Each category has tailored features.',
    icon: '🎯'
  },
  {
    number: '02',
    title: 'Create Your Brief',
    description: 'Answer questions about what you\'re naming. Our smart brief builder adapts to your needs.',
    icon: '✍️'
  },
  {
    number: '03',
    title: 'Invite Participants',
    description: 'Share a link with collaborators, team members, or friends. They\'ll submit and vote on names.',
    icon: '📬'
  },
  {
    number: '04',
    title: 'Get Your Winner',
    description: 'See results in real-time. Export rankings, generate "name stories," and celebrate your new name.',
    icon: '🎉'
  }
];

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="section-label">
        <span>Simple Process</span>
      </div>

      <h2 className="section-h2">
        How it <span className="accent">works</span>
      </h2>

      <p className="section-lead">
        Run a collaborative naming contest in four easy steps. From setup to winner, everything is streamlined and intuitive.
      </p>

      <div className="steps-grid">
        {steps.map((step) => (
          <div key={step.number} className="step-card">
            <div className="step-icon">{step.icon}</div>
            <div className="step-number">{step.number}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>

      <div className="how-it-works-cta">
        <a href="#get-started" className="btn-secondary">
          Try It Free →
        </a>
      </div>
    </section>
  );
}
