import { useState } from "react";
import Avatar from "../Avatar.jsx";
import { STAGES } from "../../data/stages.js";

export default function StageDetail({ stageIndex, onBack, logEntries, onAddLog }) {
  const s = STAGES[stageIndex];
  const [logInput, setLogInput] = useState("");

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

  return (
    <div className="screen">
      <div className="back-row">
        <button className="back-btn" onClick={onBack}>
          ←
        </button>
        <div className="back-title">Stage {stageIndex + 1} of 5</div>
      </div>

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

      {s.resource && s.resource.type === "video" && (
        <div className="resource-card">
          <div className="resource-label">🎥 From {s.person}</div>
          <div className="resource-video">
            <button className="play-mini">▶</button>
            <div className="resource-body">
              {s.resource.label}, {s.resource.body}.
            </div>
          </div>
        </div>
      )}

      {s.checklist.length > 0 && (
        <div className="resource-card">
          <div className="resource-label">📋 Checklist for this stage</div>
          <ul className="checklist">
            {s.checklist.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}

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
          placeholder="e.g. Dr. Cohen said the IV went in easily"
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
        who to ask, what to bring. Nothing here explains or characterizes Naya's
        specific medical situation, that stays with her care team.
      </div>
    </div>
  );
}
