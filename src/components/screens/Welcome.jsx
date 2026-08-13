import welcomeDoctor from "../../assets/welcome-doctor.png";

export default function Welcome({ onViewPath }) {
  return (
    <div className="screen welcome-screen">
      <div className="welcome-bg" aria-hidden="true" />
      <div className="welcome-layout">
        <div className="welcome-portrait-wrap">
          <img className="welcome-portrait" src={welcomeDoctor} alt="Dr. Bruckheimer" />
        </div>
        <div className="welcome-text-block">
          <div className="welcome-eyebrow">Alongside · Schneider's Hospital</div>
          <div className="welcome-greeting">Hi Michal and David</div>
          <div className="welcome-hero-title headline">Here for every step of Maya's day</div>
          <div className="welcome-meta">Maya, age 4 · Cardiac catheterization</div>
        </div>
        <button className="primary-btn primary-btn-lg welcome-cta" onClick={onViewPath}>
          View Maya's Path
        </button>
      </div>
    </div>
  );
}
