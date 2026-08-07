export default function You() {
  return (
    <div className="screen">
      <div className="path-hero">
        <div className="eyebrow">You</div>
        <div className="title headline">Michal and David</div>
        <div className="sub">Naya's parents, connected for today's visit.</div>
      </div>

      <div className="section-label" style={{ marginTop: 0 }}>
        Connected
      </div>
      <div className="confirm-card">
        <div className="confirm-row">
          <span>Child</span>
          <span>Naya, age 4</span>
        </div>
        <div className="confirm-row">
          <span>Both parents connected</span>
          <span>Yes</span>
        </div>
        <div className="confirm-row">
          <span>Notification timing</span>
          <span>Instant</span>
        </div>
      </div>

      <div className="section-label">Settings</div>
      <div className="path-list">
        <div className="path-item" style={{ cursor: "default" }}>
          <div className="path-body">
            <div className="path-name">Notification preferences</div>
          </div>
          <div className="path-chev">›</div>
        </div>
        <div className="path-item" style={{ cursor: "default" }}>
          <div className="path-body">
            <div className="path-name">Manage connected family</div>
          </div>
          <div className="path-chev">›</div>
        </div>
        <div className="path-item" style={{ cursor: "default" }}>
          <div className="path-body">
            <div className="path-name">Language</div>
          </div>
          <div className="path-chev">›</div>
        </div>
      </div>
    </div>
  );
}
