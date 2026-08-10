import { useEffect, useRef, useState } from "react";
import NotifCard from "../NotifCard.jsx";
import Avatar from "../Avatar.jsx";
import { STAGES } from "../../data/stages.js";

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

// `checkins` arrives newest-first from App, which owns delivery timing
// so banners can slide in over any screen.
//
// Home shows only the latest check-in, replaced as new ones land. The
// full history stays one tap away in Updates, so nothing is lost, it
// just isn't stacked up on the home screen.
export default function Home({ currentStage, onOpenStory, checkins, onSeeAllCheckins, onOpenMap }) {
  const [dismissed, setDismissed] = useState(() => new Set());
  const [viewedStage, setViewedStage] = useState(currentStage);
  const scrollerRef = useRef(null);
  const bubbleRefs = useRef([]);
  const latest = checkins.find((c) => !dismissed.has(c.key)) || null;

  // Scrolling the panel by hand (or tapping a bubble) both land here, so
  // whichever one moved last, the other stays in sync.
  function scrollToStage(i) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setViewedStage(i);
  }

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setViewedStage((prev) => (prev === i ? prev : i));
  }

  useEffect(() => {
    bubbleRefs.current[viewedStage]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [viewedStage]);

  return (
    <div className="screen">
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
      <div className="story-bubble-row">
        {STAGES.map((s, i) => {
          const status = i < currentStage ? "done" : i === currentStage ? "current" : "upcoming";
          return (
            <button
              key={s.key}
              ref={(el) => (bubbleRefs.current[i] = el)}
              className={`story-bubble ${status} ${i === viewedStage ? "viewed" : ""}`}
              onClick={() => scrollToStage(i)}
            >
              <div className="story-bubble-ring">
                <div className="story-bubble-avatar">
                  <Avatar kind={s.avatar} alt={s.person} />
                </div>
                {status === "done" && (
                  <span className="story-bubble-check" aria-hidden="true">
                    ✓
                  </span>
                )}
              </div>
              <div className="story-bubble-label">{s.label}</div>
            </button>
          );
        })}
      </div>

      {/* Swipe (or tap a bubble above) to read any stage's full text
          right here, not just the current one, without leaving Home. */}
      <div className="stage-panel-scroller" ref={scrollerRef} onScroll={handleScroll}>
        {STAGES.map((s, i) => (
          <div className="stage-panel" key={s.key}>
            <div className="story-person-row">
              <div className="story-person-avatar">
                <Avatar kind={s.avatar} alt={s.person} />
              </div>
              <div>
                <div className="story-person-name">{s.person}</div>
                <div className="story-person-role">{s.role}</div>
              </div>
            </div>
            <div className="current-step-title headline">{s.title}</div>
            <div className="current-step-sub">{s.transcript ? `"${s.transcript}"` : s.sub}</div>

            {s.checklist.length > 0 && (
              <>
                <div className="section-label" style={{ marginTop: 16 }}>
                  Checklist
                </div>
                <ul className="checklist">
                  {s.checklist.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </>
            )}

            {(s.resources || []).length > 0 && (
              <>
                <div className="section-label" style={{ marginTop: 16 }}>
                  Resources
                </div>
                <div className="resource-list">
                  {s.resources.map((r) => (
                    <div className="resource-item" key={r.title}>
                      <div className={`resource-item-icon tint-${s.color}`}>
                        {RESOURCE_ICON[r.type]}
                      </div>
                      <div className="resource-item-body">
                        <div className="resource-item-title">{r.title}</div>
                        <div className="resource-item-sub">{r.body}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <button className="current-step-open-btn" onClick={() => onOpenStory(i)}>
              {s.videoUrl ? "Watch & mark complete" : "Open & mark complete"} ›
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
