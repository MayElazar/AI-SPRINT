import StageIcon from "./StageIcon.jsx";
import { STAGES } from "../data/stages.js";

// Stacked cards, matching the check-in notification style, rather
// than a horizontal circle scroller. Each stage's icon sits on its
// own pastel tint, the current stage gets a highlighted card. Every
// stage stays browsable regardless of progress, only completing one
// is gated on order, not looking at it.
export default function StoryTray({ currentStage, onOpenStory }) {
  return (
    <div className="path-cards">
      {STAGES.map((s, i) => {
        const status = i < currentStage ? "done" : i === currentStage ? "current" : "upcoming";
        return (
          <button key={s.key} className={`path-card ${status}`} onClick={() => onOpenStory(i)}>
            <div className={`path-card-icon tint-${s.color}`}>
              <StageIcon stageKey={s.key} />
              {status === "done" && (
                <span className="path-card-check" aria-hidden="true">
                  ✓
                </span>
              )}
            </div>
            <div className="path-card-body">
              <div className="path-card-label">{s.label}</div>
              <div className="path-card-meta">
                {status === "current" && "Happening now"}
                {status === "done" && "Completed"}
                {status === "upcoming" && "Up next"}
              </div>
            </div>
            <div className="path-card-chev">›</div>
          </button>
        );
      })}
    </div>
  );
}
