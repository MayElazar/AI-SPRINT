// A mocked-up native Messages thread, the very first thing a family
// sees, before the actual app. Tapping the link in the SMS is what
// opens Alongside itself, the way a real text message would.
export default function SmsIntro({ onOpenApp }) {
  return (
    <div className="sms-screen">
      <div className="sms-header">
        <span className="sms-back" aria-hidden="true">
          ‹
        </span>
        <div className="sms-contact">
          <div className="sms-avatar">SH</div>
          <div className="sms-contact-name">Schneider's Hospital</div>
          <div className="sms-contact-sub">Text Message</div>
        </div>
        <span className="sms-info" aria-hidden="true">
          ⓘ
        </span>
      </div>

      <div className="sms-thread">
        <div className="sms-date-label">Today 8:41 AM</div>
        <div className="sms-bubble-row">
          <div className="sms-bubble">
            Hi Michal, Maya's catheterization is a week away. While you prepare, we wanted to
            share Alongside with you, an app that's there to support you and David in the days
            leading up to the procedure and all throughout the day itself. Check it out here:{" "}
            <button className="sms-link" onClick={onOpenApp}>
              app.alongside.com
            </button>
          </div>
        </div>
      </div>

      <div className="sms-input-bar">
        <div className="sms-input-pill">Text Message</div>
        <span className="sms-mic" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M6 11a6 6 0 0 0 12 0M12 17v3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}
