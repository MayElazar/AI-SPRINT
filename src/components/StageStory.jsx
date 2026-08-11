import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar.jsx";
import { STAGES } from "../data/stages.js";

// Full-bleed video behind the whole screen (or a tinted placeholder for
// stages without one yet). Just the clip itself, mute and close, no
// text or sheet on top, that content already lives on the stage's own
// detail page, this view is purely for watching.
export default function StageStory({ stageIndex, onClose }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(false);

  const s = STAGES[stageIndex];
  const hasVideo = Boolean(s.videoUrl);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Try with sound first, since opening the story is itself a real tap.
    // Some browsers still block that, so fall back to muted autoplay and
    // let the speaker button turn sound back on.
    video.muted = muted;
    video.play().catch(() => {
      video.muted = true;
      setMuted(true);
      video.play().catch(() => {});
    });
  }, [hasVideo, stageIndex, muted]);

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
    </div>
  );
}
