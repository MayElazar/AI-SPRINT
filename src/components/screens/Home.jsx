import { useState } from "react";
import StoryTray from "../StoryTray.jsx";
import NotifCard from "../NotifCard.jsx";

// `checkins` arrives newest-first from App, which owns delivery timing
// so banners can slide in over any screen.
//
// Home shows only the latest check-in, replaced as new ones land. The
// full history stays one tap away in Updates, so nothing is lost, it
// just isn't stacked up on the home screen.
export default function Home({ currentStage, onOpenStory, checkins, onSeeAllCheckins, onOpenMap, liveLabel }) {
  const [dismissed, setDismissed] = useState(() => new Set());
  const latest = checkins.find((c) => !dismissed.has(c.key)) || null;

  return (
    <div className="screen">
      <div className="home-welcome">Hi Michal and David</div>
      {liveLabel && (
        <div className="home-live-pill">
          <span className="home-live-dot" aria-hidden="true" />
          {liveLabel}
        </div>
      )}

      <div className="home-topbar">
        <div className="section-label" style={{ margin: 0 }}>
          Right now
        </div>
        <button className="bell-badge" aria-label="Hospital map" onClick={onOpenMap}>
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M9 4L3 6.5v13L9 17l6 3 6-2.5v-13L15 7 9 4z"
              stroke="var(--text-soft)"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path d="M9 4v13M15 7v13" stroke="var(--text-soft)" strokeWidth="1.7" />
          </svg>
        </button>
      </div>

      {!latest ? (
        <div className="qa-scope-note">
          No updates yet. The moment something happens, it'll show up here, this
          isn't a live feed, so a quiet stretch doesn't mean anything's wrong.
        </div>
      ) : (
        <div className="latest-checkin">
          {/* Keyed so a new check-in re-runs the slide-in animation
              rather than swapping text inside the existing card. */}
          <NotifCard
            key={latest.key}
            appLabel={`${latest.person} · ${latest.roleShort}`}
            time={latest.time}
            text={latest.text}
            tag="Check-in"
            tagVariant="checkin"
            onDismiss={() => setDismissed((prev) => new Set(prev).add(latest.key))}
          />
          {checkins.length > 1 && (
            <button className="see-all-checkins" onClick={onSeeAllCheckins}>
              See all {checkins.length} check-ins ›
            </button>
          )}
        </div>
      )}

      <div className="section-label">Maya's path</div>
      <StoryTray currentStage={currentStage} onOpenStory={onOpenStory} />
    </div>
  );
}
