import { useState } from "react";
import Avatar from "./Avatar.jsx";
import { STAGES } from "../data/stages.js";

// Full-screen story view for one stage: segmented progress bar across the
// top (one segment per stage, matching Instagram's story-tray convention),
// a Text/Video toggle, and the actual content underneath. In video mode the
// clip is a full-bleed background layer (no letterboxing, no native
// controls), the rest of the UI floats on top of it, Instagram-style.
export default function StageStory({ stageIndex, currentStage, onClose, onNavigate }) {
  const [mode, setMode] = useState("video"); // "video" | "text"
  const s = STAGES[stageIndex];
  const hasVideo = Boolean(s.videoUrl);

  return (
    <div className="story-overlay">
      {mode === "video" && hasVideo && (
        <video
          key={s.videoUrl}
          className="story-video-bg"
          src={s.videoUrl}
          autoPlay
          playsInline
          loop
        />
      )}

      <div className="story-ui">
        <div className="story-progress-row">
          {STAGES.map((st, i) => (
            <div className="story-progress-track" key={st.key}>
              <div
                className="story-progress-fill"
                style={{ width: i < stageIndex ? "100%" : i === stageIndex ? "60%" : "0%" }}
              />
            </div>
          ))}
        </div>

        <div className="story-header">
          <div className="story-header-avatar">
            <Avatar kind={s.avatar} alt={s.person} />
          </div>
          <div className="story-header-text">
            <div className="story-header-name">{s.person}</div>
            <div className="story-header-role">{s.role}</div>
          </div>
          <button className="story-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="story-toggle">
          <button
            className={mode === "video" ? "on" : ""}
            onClick={() => setMode("video")}
            disabled={!hasVideo}
          >
            Video
          </button>
          <button className={mode === "text" ? "on" : ""} onClick={() => setMode("text")}>
            Text
          </button>
        </div>

        <div className="story-body">
          {mode === "video" && !hasVideo && (
            <div className="story-video-missing">
              No video yet for this stage. Switch to Text.
            </div>
          )}
          {mode === "text" && (
            <div className="story-text">
              <div className="story-text-title headline">{s.title}</div>
              {s.transcript && (
                <>
                  <div className="story-text-eyebrow">What {s.person} says in the video</div>
                  <div className="story-text-sub">"{s.transcript}"</div>
                </>
              )}
              {!s.transcript && <div className="story-text-sub">{s.sub}</div>}
              {s.checklist.length > 0 && (
                <>
                  <div className="story-text-eyebrow" style={{ marginTop: 16 }}>
                    Checklist
                  </div>
                  <ul className="checklist" style={{ marginTop: 8 }}>
                    {s.checklist.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

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
            disabled={stageIndex === STAGES.length - 1}
            onClick={() => onNavigate(stageIndex + 1)}
          >
            Next ›
          </button>
        </div>
      </div>
    </div>
  );
}
