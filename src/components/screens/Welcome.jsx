import drCohen from "../../assets/dr-cohen.png";

export default function Welcome({ onViewPath }) {
  return (
    <div className="screen">
      <div className="statusbar">
        <span>9:41</span>
        <span>🔊 📶 🔋</span>
      </div>
      <div className="onb-wrap">
        <div>
          <div className="welcome-photo-wrap">
            <img src={drCohen} alt="Your care team" />
          </div>
          <div className="welcome-eyebrow">Alongside · Schneider's Hospital</div>
          <div className="welcome-title headline">Hi Michal and David</div>
          <div className="welcome-sub">
            We'll be walking you through Noa's procedure today.
          </div>
          <div className="welcome-meta">Noa, age 4 · Cardiac catheterization</div>
          <div className="welcome-note">
            <strong>You're not walking through today alone.</strong> Every stage
            has its own guide, and a place to keep what you're told.
          </div>
        </div>
        <div>
          <button className="primary-btn" onClick={onViewPath}>
            View Noa's Path
          </button>
        </div>
      </div>
    </div>
  );
}
