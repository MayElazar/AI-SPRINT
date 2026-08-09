import welcomeDoctor from "../../assets/welcome-doctor.png";

export default function Welcome({ onViewPath }) {
  return (
    <div className="screen">
      <div className="onb-wrap">
        <div>
          <div className="welcome-hero-wrap">
            <div className="welcome-hero-backdrop" aria-hidden="true" />
            <img className="welcome-hero-photo" src={welcomeDoctor} alt="Dr. Bruckheimer" />
            <span className="welcome-float-icon icon-heart" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 20.5s-7.5-4.6-9.7-9.1C.8 8 2.3 4.7 5.6 4c2-.4 3.9.4 5 2 1.1-1.6 3-2.4 5-2 3.3.7 4.8 4 3.3 7.4-2.2 4.5-9.7 9.1-9.7 9.1z"
                  stroke="var(--raw-coral)"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.5 12h3l1.5-3 2 5 1.5-3h5"
                  stroke="var(--raw-coral)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="welcome-float-icon icon-pulse" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="var(--accent)" strokeWidth="1.8" />
                <path d="M8 12h2l1.4-3 1.6 6 1.2-3H16" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="welcome-float-icon icon-syringe" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M20 4l-3 3M17 7l-9 9-3 3M17 7l-2-2M10.5 13.5L8 11" stroke="var(--accent-bright)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 18l-1.5 1.5" stroke="var(--accent-bright)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
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
