import { useState } from "react";
import StoryTray from "../StoryTray.jsx";
import NotifCard from "../NotifCard.jsx";

// `checkins` arrives newest-first from App, which owns delivery timing
// so banners can slide in over any screen.
//
// Home shows only the latest check-in, replaced as new ones land. The
// full history stays one tap away in Updates, so nothing is lost, it
// just isn't stacked up on the home screen.
export default function Home({ currentStage, onOpenStory, checkins, onSeeAllCheckins }) {
  const [dismissed, setDismissed] = useState(() => new Set());
  const latest = checkins.find((c) => !dismissed.has(c.key)) || null;

  return (
    <div className="screen">
      <div className="home-topbar">
        <div className="section-label" style={{ margin: 0 }}>
          Right now
        </div>
        <button className="bell-badge" aria-label="Notifications" onClick={onSeeAllCheckins}>
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4a5 5 0 00-5 5v3.4c0 .6-.2 1.2-.6 1.7L5 16h14l-1.4-1.9c-.4-.5-.6-1.1-.6-1.7V9a5 5 0 00-5-5z"
              stroke="var(--text-soft)"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path d="M10 19a2 2 0 004 0" stroke="var(--text-soft)" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          {latest && <span className="bell-dot" />}
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
            appLabel={`Alongside · ${latest.stageTitle}`}
            time={latest.time}
            text={latest.text}
            onDismiss={() => setDismissed((prev) => new Set(prev).add(latest.key))}
          />
          {checkins.length > 1 && (
            <button className="see-all-checkins" onClick={onSeeAllCheckins}>
              See all {checkins.length} check-ins ›
            </button>
          )}
        </div>
      )}

      <div className="section-label">Naya's path</div>
      <StoryTray currentStage={currentStage} onOpenStory={onOpenStory} />
    </div>
  );
}
