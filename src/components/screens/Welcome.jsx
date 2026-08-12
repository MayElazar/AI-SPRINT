import welcomeDoctor from "../../assets/welcome-doctor.png";

export default function Welcome({ onViewPath }) {
  return (
    <div className="screen welcome-screen">
      <div className="onb-wrap">
        <div>
          <div className="welcome-hero-wrap">
            <div className="welcome-hero-backdrop" aria-hidden="true" />
            <img className="welcome-hero-photo" src={welcomeDoctor} alt="Dr. Bruckheimer" />
          </div>
          <div className="welcome-eyebrow">Alongside · Schneider's Hospital</div>
          <div className="welcome-hero-title headline">Hi Michal and David</div>
          <div className="welcome-sub">
            We'll be walking you through Maya's procedure today.
          </div>
          <div className="welcome-meta">Maya, age 4 · Cardiac catheterization</div>
          <div className="welcome-note">
            <strong>You're not walking through today alone.</strong> Every stage
            has its own guide, and a place to keep what you're told.
          </div>
        </div>
        <div>
          <button className="primary-btn primary-btn-lg" onClick={onViewPath}>
            View Maya's Path
          </button>
        </div>
      </div>
    </div>
  );
}
