import StageIcon from "./StageIcon.jsx";
import { STAGES } from "../data/stages.js";

// Maya's path: one card per stage, each with its own color and icon
// so stages stay easy to tell apart, connected by a line down the left
// edge so the sequence still reads as ordered stages, not a flat list.
// Tapping a stage's icon toggles it complete/not-complete (a small
// checkmark badge appears), tapping the rest of the card opens it.
// Completion is its own state (see App's completedStages), not
// something visiting a stage sets automatically.
export default function StoryTray({ currentStage, completedStages, onToggleComplete, onOpenStory }) {
  return (
    <div className="path-stepper">
      {STAGES.map((s, i) => {
        const done = completedStages.has(i);
        const status = done ? "done" : i === currentStage ? "current" : "upcoming";
        const isLast = i === STAGES.length - 1;
        return (
          <div key={s.key} className="stepper-row">
            <div className="stepper-track">
              <button
                type="button"
                className={`stepper-icon tint-${s.color} ${status}`}
                aria-pressed={done}
                aria-label={done ? `Mark ${s.label} as not completed` : `Mark ${s.label} as completed`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(i);
                }}
              >
                <StageIcon stageKey={s.key} />
                {done && (
                  <span className="stepper-icon-check" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12.5l4.5 4.5L19 7"
                        stroke="#fff"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </button>
              {!isLast && <div className="stepper-line" />}
            </div>
            <div className={`path-card ${status}`}>
              <button className="path-card-body" onClick={() => onOpenStory(i)}>
                <div className="path-card-title">{s.label}</div>
                <div className="path-card-sub">{s.sub}</div>
              </button>
              <div className="path-card-chev">›</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
