import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar.jsx";
import NotifCard from "./NotifCard.jsx";
import HospitalMap3D from "./HospitalMap3D.jsx";
import { STAGES } from "../data/stages.js";

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

const DRAG_THRESHOLD = 60;

// Full-bleed video behind the whole screen (or a tinted placeholder for
// stages without one yet), with a sheet that starts as a peek at the
// bottom and slides up over the video to reveal the stage's text,
// checklist, and resources, rather than a small contained player.
export default function StageStory({
  stageIndex,
  currentStage,
  onClose,
  onNavigate,
  onComplete,
  checkins,
  onSeeAllCheckins,
}) {
  const [expanded, setExpanded] = useState(false);
  const dragging = useRef(false);
  const startY = useRef(0);
  const dragYRef = useRef(0);
  const [dragY, setDragY] = useState(0);
  const videoRef = useRef(null);
  const [checkedItems, setCheckedItems] = useState(() => new Set());
  const [map3dOpen, setMap3dOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [dismissed, setDismissed] = useState(() => new Set());

  function toggleChecklistItem(itemKey) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
  }

  const s = STAGES[stageIndex];
  const hasVideo = Boolean(s.videoUrl);
  const isCurrent = stageIndex === currentStage;
  const isLastStage = stageIndex === STAGES.length - 1;
  const resources = s.resources || [];
  const stageCheckins = checkins.filter((c) => c.stageKey === s.key);
  const latestCheckin = stageCheckins.find((c) => !dismissed.has(c.key)) || null;

  // Pull the sheet up and the video pauses, it's covered anyway and
  // shouldn't keep playing (or making sound, once it has any) behind
  // the text. Push the sheet back down and it picks up again.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (expanded) {
      video.pause();
      return;
    }
    // Try with sound first, since opening the story is itself a real tap.
    // Some browsers still block that, so fall back to muted autoplay and
    // let the speaker button turn sound back on.
    video.muted = muted;
    video.play().catch(() => {
      video.muted = true;
      setMuted(true);
      video.play().catch(() => {});
    });
  }, [expanded, hasVideo, stageIndex, muted]);

  function onPointerDown(e) {
    startY.current = e.clientY;
    dragging.current = true;
  }

  function onPointerMove(e) {
    if (!dragging.current) return;
    dragYRef.current = e.clientY - startY.current;
    setDragY(dragYRef.current);
  }

  function endDrag() {
    if (!dragging.current) return;
    dragging.current = false;
    const dy = dragYRef.current;
    if (!expanded && dy < -DRAG_THRESHOLD) setExpanded(true);
    if (expanded && dy > DRAG_THRESHOLD) setExpanded(false);
    dragYRef.current = 0;
    setDragY(0);
  }

  return (
    <div className="story-overlay">
      {hasVideo ? (
        <>
          <video
            key={s.videoUrl}
            ref={videoRef}
            className="story-video-bg"
            src={s.videoUrl}
            autoPlay
            muted={muted}
            playsInline
            loop
          />
          <button
            className="story-mute-btn"
            onClick={() => setMuted((v) => !v)}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 9v6h4l5 4V5L8 9H4z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M16 9l5 6M21 9l-5 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 9v6h4l5 4V5L8 9H4z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </>
      ) : (
        <div className={`story-video-placeholder tint-${s.color}`}>
          <div className="story-video-placeholder-avatar">
            <Avatar kind={s.avatar} alt={s.person} />
          </div>
        </div>
      )}

      <div className="story-top-fade" />

      <div className="story-top-ui">
        <div className="story-topbar">
          <button className="story-close" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      <div
        className={`story-sheet ${expanded ? "expanded" : ""}`}
        style={{
          "--drag-y": `${dragY}px`,
          transition: dragging.current ? "none" : "transform 0.32s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        <div
          className="story-sheet-handle-row"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onClick={() => !dragging.current && setExpanded((v) => !v)}
        >
          <div className="story-sheet-handle" />
        </div>

        <div className="story-sheet-body">
          {latestCheckin && (
            <>
              <div className="section-label" style={{ marginTop: 18 }}>
                Latest update
              </div>
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
            </>
          )}

          {s.checklist.length > 0 && (
            <>
              <div className="section-label" style={{ marginTop: 18 }}>
                Checklist
              </div>
              <div className="check-list">
                {s.checklist.map((c) => {
                  const itemKey = `${s.key}::${c}`;
                  const checked = checkedItems.has(itemKey);
                  return (
                    <button
                      key={c}
                      className={`check-item ${checked ? "checked" : ""}`}
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
            </>
          )}

          {resources.length > 0 && (
            <>
              <div className="section-label" style={{ marginTop: 18 }}>
                Resources for this stage
              </div>
              <div className="resource-list">
                {resources.map((r) => {
                  const isMap = r.type === "map";
                  const Tag = isMap ? "button" : "div";
                  return (
                    <Tag
                      className="resource-item"
                      key={r.title}
                      onClick={isMap ? () => setMap3dOpen(true) : undefined}
                    >
                      <div className={`resource-item-icon tint-${s.color}`}>
                        {RESOURCE_ICON[r.type]}
                      </div>
                      <div className="resource-item-body">
                        <div className="resource-item-title">{r.title}</div>
                        <div className="resource-item-sub">{r.body}</div>
                      </div>
                      {isMap && <div className="path-chev">›</div>}
                    </Tag>
                  );
                })}
              </div>
            </>
          )}

          {isCurrent && !isLastStage && (
            <div className="story-complete-row">
              <button className="story-complete-btn" onClick={onComplete}>
                Mark "{s.label}" complete
              </button>
            </div>
          )}

          <div className="story-nav">
            <button
              className="story-nav-btn"
              disabled={stageIndex === 0}
              onClick={() => onNavigate(stageIndex - 1)}
            >
              ‹ Prev
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
      </div>

      {map3dOpen && <HospitalMap3D onClose={() => setMap3dOpen(false)} />}
    </div>
  );
}
