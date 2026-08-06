export default function Arrival({ onCheckIn }) {
  return (
    <div className="screen">
      <div className="onb-wrap">
        <div>
          <div className="onb-hero">
            <svg
              className="onb-icon"
              viewBox="0 0 56 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M28 8c-9 0-15 7-15 15 0 11 15 25 15 25s15-14 15-25c0-8-6-15-15-15z"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <circle cx="28" cy="23" r="6" stroke="#fff" strokeWidth="2.5" />
            </svg>
            <div className="onb-title headline">You've arrived</div>
            <div className="onb-sub">
              Welcome to Schneider. Noa's cath lab visit starts today, here's your
              first stop.
            </div>
          </div>
          <div className="arrival-route">
            <div className="route-item">
              <div className="route-num">1</div>
              <div className="route-text">
                <strong>Main entrance</strong>
                <span>Ground floor, main lobby</span>
              </div>
            </div>
            <div className="route-item">
              <div className="route-num">2</div>
              <div className="route-text">
                <strong>Elevator block B</strong>
                <span>To your right past reception</span>
              </div>
            </div>
            <div className="route-item" style={{ borderBottom: "none" }}>
              <div className="route-num">3</div>
              <div className="route-text">
                <strong>3rd floor, Cath Lab reception</strong>
                <span>Ask for Yael, today's unit nurse</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <button className="primary-btn" onClick={onCheckIn}>
            I've checked in
          </button>
        </div>
      </div>
    </div>
  );
}
