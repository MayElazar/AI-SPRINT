import Avatar from "./Avatar.jsx";
import { STAGES } from "../data/stages.js";

// Instagram-Stories-style row: circular avatars with a ring showing
// done / current / upcoming, label underneath.
export default function StoryTray({ currentStage, onOpenStory }) {
  return (
    <div className="story-tray">
      {STAGES.map((s, i) => {
        const status = i < currentStage ? "done" : i === currentStage ? "current" : "upcoming";
        return (
          <button
            key={s.key}
            className={`story-item ${status}`}
            onClick={() => onOpenStory(i)}
          >
            <div className="story-ring">
              <div className="story-avatar">
                <Avatar kind={s.avatar} alt={s.person} />
              </div>
              {status === "done" && (
                <span className="story-check" aria-hidden="true">
                  ✓
                </span>
              )}
            </div>
            <div className="story-label">{s.label}</div>
          </button>
        );
      })}
    </div>
  );
}
