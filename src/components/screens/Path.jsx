import Avatar from "../Avatar.jsx";
import { STAGES } from "../../data/stages.js";

export default function Path({ currentStage, onOpenStage }) {
  return (
    <div className="screen">
      <div className="path-hero">
        <div className="eyebrow">Maya's path</div>
        <div className="title headline">Five stages, one at a time</div>
        <div className="sub">
          Each stage opens with whatever it actually needs, a video, a
          checklist, or a place to check in.
        </div>
      </div>
      <div className="path-list">
        {STAGES.map((s, i) => {
          const status = i < currentStage ? "done" : i === currentStage ? "current" : "";
          return (
            <button
              key={s.key}
              className={`path-item ${status}`}
              onClick={() => onOpenStage(i)}
            >
              <div className="path-num">{i < currentStage ? "✓" : i + 1}</div>
              <div className="path-avatar">
                <Avatar kind={s.avatar} alt={s.person} />
              </div>
              <div className="path-body">
                <div className="path-name">{s.label}</div>
                <div className="path-offers">
                  {s.offers.map((o) => (
                    <span className="offer-chip" key={o}>
                      {o}
                    </span>
                  ))}
                </div>
              </div>
              <div className="path-chev">›</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
