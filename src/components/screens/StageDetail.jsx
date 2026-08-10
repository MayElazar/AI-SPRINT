import { useState } from "react";
import Avatar from "../Avatar.jsx";
import { STAGES } from "../../data/stages.js";

export default function StageDetail({ stageIndex, onBack, logEntries, onAddLog, onOpenStory, onOpenMap }) {
  const s = STAGES[stageIndex];
  const [logInput, setLogInput] = useState("");
  const [checkedItems, setCheckedItems] = useState(() => new Set());

  const entriesForStage = logEntries.filter((e) => e.stageKey === s.key);

  function saveLog() {
    const text = logInput.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    onAddLog({ stageKey: s.key, stageLabel: s.label, text, time });
    setLogInput("");
  }

  function toggleChecklistItem(itemKey) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
  }

  return (
    <div className="screen">
      <div className="back-row">
        <button className="back-btn" onClick={onBack}>
          ←
        </button>
        <div className="back-title">Stage {stageIndex + 1} of 5</div>
      </div>

      <div className={`stage-hero tint-${s.color}`} onClick={() => onOpenStory(stageIndex)}>
        {s.videoUrl ? (
          <video className="stage-hero-video" src={s.videoUrl} muted playsInline preload="metadata" />
        ) : (
          <div className="stage-hero-avatar">
            <Avatar kind={s.avatar} alt={s.person} />
          </div>
        )}
        <button className="stage-hero-play" aria-label="Play" onClick={(e) => { e.stopPropagation(); onOpenStory(stageIndex); }}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M8 5.5v13l11-6.5-11-6.5z" fill="#fff" />
          </svg>
        </button>
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

      <div className="stage-hero-welcome headline">{s.title}</div>

      <button className="stage-feature-card" onClick={onOpenMap}>
        <div className="stage-feature-label">Hospital Map</div>
        <div className="stage-map-preview">
          <svg className="stage-map-lines" viewBox="0 0 300 60" preserveAspectRatio="none">
            <path d="M40 20h220M40 40h140" stroke="var(--border)" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="stage-map-pin" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13z"
                fill="var(--accent-deep)"
              />
              <circle cx="12" cy="9" r="2.6" fill="#fff" />
            </svg>
          </span>
        </div>
      </button>

      {s.checklist.length > 0 && (
        <div className="stage-feature-card stage-feature-card-static">
          <div className="stage-feature-label">Checklist</div>
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
        </div>
      )}

      <div className="stage-person">
        <div className="path-avatar">
          <Avatar kind={s.avatar} alt={s.person} />
        </div>
        <div>
          <div className="stage-person-name">{s.person}</div>
          <div className="stage-person-role">{s.role}</div>
        </div>
      </div>

      <div className="stage-title headline">{s.title}</div>
      <div className="stage-sub">{s.sub}</div>

      {s.checkins.length > 0 && (
        <>
          <div className="section-label" style={{ marginTop: 0 }}>
            Check-ins so far, not a live feed
          </div>
          <div className="checkin-feed">
            {s.checkins.map((c) => (
              <div className="checkin-item" key={c.time}>
                <div className="checkin-time">{c.time}</div>
                {c.text}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="log-card">
        <div className="log-label">Log what you heard</div>
        <textarea
          className="log-input"
          rows={2}
          placeholder="e.g. Dr. Bruckheimer said the IV went in easily"
          value={logInput}
          onChange={(e) => setLogInput(e.target.value)}
        />
        <button className="log-btn" onClick={saveLog}>
          Save note
        </button>
        {entriesForStage.map((e, i) => (
          <div className="log-entry" key={i}>
            <div className="log-stage">{e.time}</div>
            {e.text}
          </div>
        ))}
      </div>

      <div className="section-label">Quick answers</div>
      {s.qa.map((item) => (
        <div className="qa-card" key={item.q}>
          <div className="qa-q">{item.q}</div>
          <div className="qa-a">{item.a}</div>
        </div>
      ))}
      <div className="qa-scope-note">
        <strong>Scoped on purpose:</strong> these answer logistics only, timing,
        who to ask, what to bring. Nothing here explains or characterizes Maya's
        specific medical situation, that stays with her care team.
      </div>
    </div>
  );
}
