import drCohen from "../../assets/dr-cohen.png";

export default function Welcome({ onViewPath }) {
  return (
    <div className="screen">
      <div className="onb-wrap">
        <div>
          <div className="welcome-hero-card">
            <img src={drCohen} alt="Your care team" />
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
          </div>
          <div className="welcome-eyebrow">Alongside · Schneider's Hospital</div>
          <div className="welcome-hero-title headline">Hi Michal and David</div>
          <div className="welcome-sub">
            We'll be walking you through Naya's procedure today.
          </div>
          <div className="welcome-meta">Naya, age 4 · Cardiac catheterization</div>
          <div className="welcome-note">
            <strong>You're not walking through today alone.</strong> Every stage
            has its own guide, and a place to keep what you're told.
          </div>
        </div>
        <div>
          <button className="primary-btn primary-btn-lg" onClick={onViewPath}>
            View Naya's Path
          </button>
        </div>
      </div>
    </div>
  );
}
