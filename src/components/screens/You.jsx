import { useState } from "react";

const DIAL_OPTIONS = [
  {
    key: "everything",
    label: "Reach out with anything new",
    sub: "Every check-in, the moment it's sent.",
  },
  {
    key: "key",
    label: "Key moments only",
    sub: "Stage changes and anything worth knowing, not every routine check-in.",
  },
  {
    key: "attention",
    label: "Only if something needs my attention",
    sub: "Quietest setting. We'll still reach you if the team needs to reach you.",
  },
];

export default function You() {
  const [dialOpen, setDialOpen] = useState(false);
  const [dial, setDial] = useState("key");
  const current = DIAL_OPTIONS.find((o) => o.key === dial);

  return (
    <div className="screen">
      <div className="path-hero">
        <div className="eyebrow">You</div>
        <div className="title headline">Michal and David</div>
        <div className="sub">Maya's parents, connected for today's visit.</div>
      </div>

      <div className="section-label" style={{ marginTop: 0 }}>
        Connected
      </div>
      <div className="confirm-card">
        <div className="confirm-row">
          <span>Child</span>
          <span>Maya, age 4</span>
        </div>
        <div className="confirm-row">
          <span>Both parents connected</span>
          <span>Yes</span>
        </div>
        <div className="confirm-row">
          <span>Notification timing</span>
          <span>{current.label}</span>
        </div>
      </div>

      <div className="section-label">Settings</div>
      <div className="path-list">
        <button
          className="path-item"
          onClick={() => setDialOpen((v) => !v)}
          aria-expanded={dialOpen}
        >
          <div className="path-body">
            <div className="path-name">Notification preferences</div>
            {!dialOpen && (
              <div className="dial-current">{current.label}</div>
            )}
          </div>
          <div className="path-chev" style={{ transform: dialOpen ? "rotate(90deg)" : "none" }}>
            ›
          </div>
        </button>

        {dialOpen && (
          <div className="dial-panel">
            <div className="dial-panel-prompt">How much do you want to hear from us today?</div>
            {DIAL_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`dial-option ${dial === opt.key ? "selected" : ""}`}
                onClick={() => setDial(opt.key)}
              >
                <span className="dial-option-dot" aria-hidden="true" />
                <span className="dial-option-text">
                  <span className="dial-option-label">{opt.label}</span>
                  <span className="dial-option-sub">{opt.sub}</span>
                </span>
              </button>
            ))}
          </div>
        )}

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
