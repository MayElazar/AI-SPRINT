import { useEffect, useRef, useState } from "react";
import NotifCard from "../NotifCard.jsx";
import { STAGES } from "../../data/stages.js";
import drBruckheimerPhoto from "../../assets/dr-cohen.png";
import yaelPhoto from "../../assets/yael.png";
import galitPhoto from "../../assets/galit.png";

// Stills for the video hero's `poster`, so a stage screen shows a real
// photo at rest instead of a plain black box before playback starts.
const POSTER_PHOTOS = {
  doctor: drBruckheimerPhoto,
  yael: yaelPhoto,
  galit: galitPhoto,
};

const RESOURCE_ICON = {
  map: (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M9 4L3 6.5v13L9 17l6 3 6-2.5v-13L15 7 9 4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 4v13M15 7v13" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  guide: (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s-7-4.35-9.5-8.5C.7 8.9 2.4 5 6 4.3c2.1-.4 4 .5 6 2.3 2-1.8 3.9-2.7 6-2.3 3.6.7 5.3 4.6 3.5 8.2C19 16.65 12 21 12 21z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  ),
  article: (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="5" y="3.5" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 8h7M8.5 12h7M8.5 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};

export default function StageDetail({
  stageIndex,
  completed,
  onToggleComplete,
  onBack,
  onOpenStory,
  onOpenResource,
  onOpenMap,
  onOpenGame,
  onNavigate,
  checkins,
  onSeeAllCheckins,
}) {
  const s = STAGES[stageIndex];
  const [checkedItems, setCheckedItems] = useState(() => new Set());
  const [dismissed, setDismissed] = useState(() => new Set());
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);
  const screenRef = useRef(null);

  useEffect(() => {
    // window.scrollTo does nothing when .app-shell itself is the
    // scroll container (the desktop device-frame preview), so this
    // scrolls whichever ancestor is actually scrollable instead.
    screenRef.current?.scrollIntoView({ block: "start" });
  }, [stageIndex]);

  function togglePlay(e) {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      video.play().catch(() => {});
      setPlaying(true);
    }
  }

  // Only what's actually been delivered so far shows here, same as
  // Home, this isn't a live feed, so a stage with no updates yet just
  // hasn't gotten there in the timeline, it's not a bug.
  const stageCheckins = checkins.filter((c) => c.stageKey === s.key);
  const latestCheckin = stageCheckins.find((c) => !dismissed.has(c.key)) || null;

  function toggleChecklistItem(itemKey) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
  }

  return (
    <div className="screen" ref={screenRef}>
      <div className="back-row">
        <button className="back-btn" onClick={onBack}>
          ←
        </button>
        <div className="back-title">Stage {stageIndex + 1} of {STAGES.length}</div>
      </div>

      {s.videoUrl && (
        <div className={`stage-hero tint-${s.color}`}>
          <video
            ref={videoRef}
            className="stage-hero-video"
            src={s.videoUrl}
            poster={POSTER_PHOTOS[s.videoAvatar || s.avatar]}
            muted
            playsInline
            preload="metadata"
            onEnded={() => setPlaying(false)}
            onClick={togglePlay}
          />
          {!playing && (
            <>
              <div className="stage-hero-scrim" aria-hidden="true" />
              <button className="stage-hero-play" aria-label="Play" onClick={togglePlay}>
                <span className="stage-hero-play-ring" aria-hidden="true" />
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M8 5.5v13l11-6.5-11-6.5z" fill="#fff" />
                </svg>
              </button>
              {s.resource?.label && (
                <div className="stage-hero-caption">
                  <span className="stage-hero-caption-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" />
                    </svg>
                  </span>
                  {s.resource.label}
                </div>
              )}
            </>
          )}
          <button
            className="stage-hero-expand"
            aria-label="Expand"
            onClick={(e) => { e.stopPropagation(); onOpenStory(stageIndex); }}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M9 4H4v5M15 20h5v-5M4 4l6 6M20 20l-6-6"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="stage-hero-welcome headline">{s.title}</div>
      <div className="stage-hero-sub">{s.sub}</div>

      {latestCheckin && (
        <div className="stage-feature-card stage-feature-card-static">
          <div className="stage-feature-label">Latest update</div>
          <NotifCard
            key={latestCheckin.key}
            appLabel={`${latestCheckin.person} · ${latestCheckin.roleShort}`}
            time={latestCheckin.time}
            text={latestCheckin.text}
            tag="Check-in"
            tagVariant="checkin"
            onDismiss={() => setDismissed((prev) => new Set(prev).add(latestCheckin.key))}
          />
          {stageCheckins.length > 1 && (
            <button className="see-all-checkins" onClick={onSeeAllCheckins}>
              See all {stageCheckins.length} updates ›
            </button>
          )}
        </div>
      )}

      {((s.instructions || []).length > 0 || (s.recommendations || []).length > 0) && (
        <div className="stage-feature-card stage-feature-card-static">
          <div className="stage-feature-label">{s.checklistLabel || "Checklist"}</div>
          {s.checklistIntro && <div className="stage-checklist-intro">{s.checklistIntro}</div>}

          {(s.instructions || []).length > 0 && (
            <div className="checklist-group">
              <div className="checklist-group-label instructions">Instructions</div>
              <div className="check-list">
                {s.instructions.map((c) => {
                  const itemKey = `${s.key}::instr::${c}`;
                  const checked = checkedItems.has(itemKey);
                  return (
                    <button
                      key={c}
                      className={`check-item instruction ${checked ? "checked" : ""}`}
                      onClick={() => toggleChecklistItem(itemKey)}
                    >
                      <span className="check-item-box" aria-hidden="true">
                        {checked && (
                          <svg viewBox="0 0 24 24" fill="none">
                            <path
                              d="M5 12.5l4.5 4.5L19 7"
                              stroke="#fff"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="check-item-text">{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(s.recommendations || []).length > 0 && (
            <div className="checklist-group">
              <div className="checklist-group-label recommendations">Recommended, not required</div>
              <div className="check-list">
                {s.recommendations.map((c) => {
                  const itemKey = `${s.key}::rec::${c}`;
                  const checked = checkedItems.has(itemKey);
                  return (
                    <button
                      key={c}
                      className={`check-item recommendation ${checked ? "checked" : ""}`}
                      onClick={() => toggleChecklistItem(itemKey)}
                    >
                      <span className="check-item-box" aria-hidden="true">
                        {checked && (
                          <svg viewBox="0 0 24 24" fill="none">
                            <path
                              d="M5 12.5l4.5 4.5L19 7"
                              stroke="#fff"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="check-item-text">{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {(s.team || []).length > 0 && (
        <div className="stage-feature-card stage-feature-card-static">
          <div className="stage-feature-label">Meet your team today</div>
          <div className="team-card-list">
            {s.team.map((m) => (
              <div className="team-card" key={m.name}>
                <img className="team-card-photo" src={m.photo} alt={m.name} />
                <div className="team-card-body">
                  <div className="team-card-name">
                    {m.name} · {m.role}
                  </div>
                  <div className="team-card-caption">{m.caption}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(s.resources || []).length > 0 && (
        <div className="stage-feature-card stage-feature-card-static">
          <div className="stage-feature-label">Resources</div>
          <div className="resource-list">
            {s.resources.map((r) => (
              <button
                className="resource-item"
                key={r.title}
                onClick={() => (r.type === "map" ? onOpenMap() : onOpenResource(r, s.color))}
              >
                <div className={`resource-item-icon tint-${s.color}`}>{RESOURCE_ICON[r.type]}</div>
                <div className="resource-item-body">
                  <div className="resource-item-title">{r.title}</div>
                  <div className="resource-item-sub">{r.body}</div>
                </div>
                <div className="resource-item-chev">›</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {s.game && (
        <button className="stage-feature-card stage-game-card" onClick={onOpenGame}>
          <div className="stage-game-card-icon">🏃</div>
          <div className="resource-item-body">
            <div className="resource-item-title">A game for Maya</div>
            <div className="resource-item-sub">A quick game to pass the time.</div>
          </div>
          <div className="resource-item-chev">›</div>
        </button>
      )}

      <button
        type="button"
        className={`stage-complete-toggle ${completed ? "on" : ""}`}
        aria-pressed={completed}
        onClick={onToggleComplete}
      >
        <span className="stage-complete-check" aria-hidden="true">
          {completed && (
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12.5l4.5 4.5L19 7"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        {completed ? "Marked as completed" : "Mark this stage as completed"}
      </button>

      <div className="story-nav stage-detail-nav">
        <button
          className="story-nav-btn"
          disabled={stageIndex === 0}
          onClick={() => onNavigate(stageIndex - 1)}
        >
          ‹ Back
        </button>
        <button
          className="story-nav-btn"
          disabled={stageIndex >= STAGES.length - 1}
          onClick={() => onNavigate(stageIndex + 1)}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
