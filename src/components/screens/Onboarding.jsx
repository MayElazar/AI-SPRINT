import { useState } from "react";

const ICON_ARRIVE = (
  <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="28" r="27" stroke="#fff" strokeWidth="2" opacity="0.5" />
    <path
      d="M28 14v14l9 9"
      stroke="#fff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ICON_CHECK = (
  <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="28" r="27" stroke="#fff" strokeWidth="2" opacity="0.5" />
    <path
      d="M17 29l7 7 15-15"
      stroke="#fff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(1);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteValue, setInviteValue] = useState("");
  const [detail, setDetail] = useState("more");
  const [timing, setTiming] = useState("instant");

  function sendInvite() {
    if (!inviteValue.trim()) return;
    setInviteSent(true);
  }

  return (
    <div className="screen">
      <div className="statusbar">
        <span>9:41</span>
        <span>🔊 📶 🔋</span>
      </div>
      <div className="onb-wrap">
        {step === 1 && (
          <>
            <div>
              <div className="onb-hero">
                <div className="onb-icon">{ICON_ARRIVE}</div>
                <div className="onb-title headline">A companion for Noa's visit</div>
                <div className="onb-sub">
                  Stay with every stage of the day, wherever you are. Set up takes
                  about a minute.
                </div>
              </div>
            </div>
            <div>
              <div className="onb-dots">
                <span className="onb-dot on" />
                <span className="onb-dot" />
                <span className="onb-dot" />
              </div>
              <button className="primary-btn" onClick={() => setStep(2)}>
                Get started
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <div className="section-label" style={{ marginTop: 0 }}>
                Confirm your visit
              </div>
              <div className="confirm-card">
                <div className="confirm-row">
                  <span>Child</span>
                  <span>Noa, age 4</span>
                </div>
                <div className="confirm-row">
                  <span>Procedure</span>
                  <span>Cardiac catheterization</span>
                </div>
                <div className="confirm-row">
                  <span>Date</span>
                  <span>Aug 2, 2026</span>
                </div>
                <div className="confirm-row">
                  <span>Location</span>
                  <span>Schneider, Cath Lab</span>
                </div>
              </div>
              <div className="confirm-note">
                Pulled automatically from your scheduled visit, nothing to type.
              </div>
              <div className="section-label">Who else should stay connected?</div>
              <div className="invite-row">
                <input
                  className="invite-input"
                  type="text"
                  placeholder="Partner's phone or email"
                  value={inviteValue}
                  onChange={(e) => setInviteValue(e.target.value)}
                />
                <button className="invite-btn" onClick={sendInvite}>
                  Invite
                </button>
              </div>
              {inviteSent && (
                <div className="invite-sent">
                  ✓ Invite sent, they'll see the same Path and Notes
                </div>
              )}
            </div>
            <div>
              <div className="onb-dots">
                <span className="onb-dot" />
                <span className="onb-dot on" />
                <span className="onb-dot" />
              </div>
              <button className="primary-btn" onClick={() => setStep(3)}>
                Continue
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <div className="onb-hero">
                <div className="onb-icon">{ICON_CHECK}</div>
                <div className="onb-title headline">You're all set</div>
                <div className="onb-sub">
                  We'll reach out a few days before Noa's visit, then walk you
                  through arrival day itself.
                </div>
              </div>
            </div>
            <div>
              <div className="onb-dots">
                <span className="onb-dot" />
                <span className="onb-dot" />
                <span className="onb-dot on" />
              </div>
              <button className="primary-btn" onClick={onDone}>
                Preview arrival day
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
