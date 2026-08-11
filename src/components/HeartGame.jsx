import { useState } from "react";

// A simple tap-to-place puzzle: four chambers, four pieces, no wrong
// answers, just find where each one goes. Not a medical diagram, a
// game, so shapes are simplified and colors are playful rather than
// anatomically color-coded.
//
// Slots are percentages of the heart outline's own viewBox (124x140),
// not pixels, so a piece always lines up with the outline underneath
// it regardless of how large the stage is rendered.
const VIEWBOX = { w: 124, h: 140 };
const PIECES = [
  { id: "la", label: "Left atrium", color: "#7B69B0", slot: { x: 62, y: 20, w: 46, h: 46 } },
  { id: "ra", label: "Right atrium", color: "#66CADD", slot: { x: 12, y: 20, w: 46, h: 46 } },
  { id: "lv", label: "Left ventricle", color: "#F26C82", slot: { x: 58, y: 70, w: 54, h: 60 } },
  { id: "rv", label: "Right ventricle", color: "#FFC645", slot: { x: 8, y: 70, w: 54, h: 60 } },
].map((p) => ({
  ...p,
  pct: {
    left: (p.slot.x / VIEWBOX.w) * 100,
    top: (p.slot.y / VIEWBOX.h) * 100,
    width: (p.slot.w / VIEWBOX.w) * 100,
    height: (p.slot.h / VIEWBOX.h) * 100,
  },
}));

export default function HeartGame({ onClose }) {
  const [placed, setPlaced] = useState(() => new Set());
  const [justPlaced, setJustPlaced] = useState(null);

  const tray = PIECES.filter((p) => !placed.has(p.id));
  const done = placed.size === PIECES.length;

  function place(id) {
    setPlaced((prev) => new Set(prev).add(id));
    setJustPlaced(id);
    setTimeout(() => setJustPlaced(null), 600);
  }

  function reset() {
    setPlaced(new Set());
    setJustPlaced(null);
  }

  return (
    <div className="heart-game-overlay">
      <div className="heart-game-topbar">
        <div className="heart-game-title headline">Build Maya's heart</div>
        <button className="heart-game-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="heart-game-board">
        <div className="heart-game-stage">
          <svg className="heart-game-outline" viewBox="0 0 124 140" fill="none">
            <path
              d="M62 138S6 100 6 55C6 30 24 12 46 12c7 0 13 3 16 8 3-5 9-8 16-8 22 0 40 18 40 43 0 45-56 83-56 83Z"
              stroke="var(--border)"
              strokeWidth="2.5"
              strokeDasharray="6 5"
            />
          </svg>

          {PIECES.map((p) => {
            const isPlaced = placed.has(p.id);
            if (!isPlaced) return null;
            return (
              <div
                key={p.id}
                className={`heart-game-piece placed ${justPlaced === p.id ? "pop" : ""}`}
                style={{
                  left: `${p.pct.left}%`,
                  top: `${p.pct.top}%`,
                  width: `${p.pct.width}%`,
                  height: `${p.pct.height}%`,
                  background: p.color,
                }}
              >
                <span className="heart-game-piece-label">{p.label}</span>
              </div>
            );
          })}
        </div>

        {done && (
          <div className="heart-game-celebrate">
            <div className="heart-game-celebrate-emoji">💜</div>
            <div className="heart-game-celebrate-text">You built Maya's heart!</div>
            <button className="heart-game-again" onClick={reset}>
              Play again
            </button>
          </div>
        )}
      </div>

      {!done && (
        <>
          <div className="heart-game-hint">Tap a piece to place it</div>
          <div className="heart-game-tray">
            {tray.map((p) => (
              <button
                key={p.id}
                className="heart-game-tray-piece"
                style={{ background: p.color }}
                onClick={() => place(p.id)}
                aria-label={`Place ${p.label}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
