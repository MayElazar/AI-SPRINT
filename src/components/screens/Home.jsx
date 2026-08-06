import { useState, useRef } from "react";
import Avatar from "../Avatar.jsx";
import StoryTray from "../StoryTray.jsx";
import { STAGES } from "../../data/stages.js";

function formatNow() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Home({
  currentStage,
  onOpenStory,
  onOpenStage,
  logEntries,
  onAddLog,
  onSeeAllNotes,
}) {
  const s = STAGES[currentStage];

  // Everything that would realistically have happened by now, in order.
  const checkinsSoFar = STAGES.slice(0, currentStage + 1).flatMap((st) =>
    st.checkins.map((c) => ({ ...c, stageLabel: st.label }))
  );

  const [noteText, setNoteText] = useState("");
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  function writeNote() {
    const text = noteText.trim();
    if (!text) return;
    onAddLog({ stageKey: s.key, stageLabel: s.label, time: formatNow(), type: "text", text });
    setNoteText("");
  }

  async function startRecording() {
    setMicError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(blob);
        onAddLog({
          stageKey: s.key,
          stageLabel: s.label,
          time: formatNow(),
          type: "audio",
          audioUrl,
        });
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch (err) {
      setMicError("Microphone access is needed to record a note.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  const recentNotes = [...logEntries].slice(-2).reverse();

  return (
    <div className="screen">
      <div className="statusbar">
        <span>9:41</span>
        <span>🔊 📶 🔋</span>
      </div>

      <div className="section-label" style={{ marginTop: 0 }}>
        Right now
      </div>
      <div className="now-card">
        <div className="now-avatar">
          <Avatar kind={s.avatar} alt={s.person} />
        </div>
        <div>
          <div className="now-title headline">{s.title}</div>
          <div className="now-sub">{s.sub}</div>
        </div>
      </div>

      <div className="section-label">Noa's path</div>
      <StoryTray currentStage={currentStage} onOpenStory={onOpenStory} />

      <div className="section-label">Check-ins</div>
      {checkinsSoFar.length === 0 ? (
        <div className="qa-scope-note">
          No updates yet. The moment something happens, it'll show up here, this
          isn't a live feed, so a quiet stretch doesn't mean anything's wrong.
        </div>
      ) : (
        <div className="checkin-feed">
          {checkinsSoFar.map((c, i) => (
            <div className="checkin-item" key={i}>
              <div className="checkin-time">
                {c.time} · {c.stageLabel}
              </div>
              {c.text}
            </div>
          ))}
        </div>
      )}

      <div className="section-label">Notes</div>
      <div className="log-card">
        <div className="log-label">Write or record a note</div>
        <textarea
          className="log-input"
          rows={2}
          placeholder="e.g. Dr. Cohen said the IV went in easily"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />
        <div className="note-actions">
          <button className="log-btn" onClick={writeNote}>
            Save note
          </button>
          <button
            className={`record-btn ${recording ? "recording" : ""}`}
            onClick={recording ? stopRecording : startRecording}
          >
            <span className="record-dot" />
            {recording ? "Stop recording" : "Record"}
          </button>
        </div>
        {micError && <div className="mic-error">{micError}</div>}
      </div>

      {recentNotes.length > 0 && (
        <div className="path-list" style={{ marginBottom: 8 }}>
          {recentNotes.map((e, i) => (
            <div className="notes-screen-item" key={i} style={{ marginBottom: 0 }}>
              <div className="log-stage">
                {e.stageLabel} · {e.time}
              </div>
              {e.type === "audio" ? (
                <audio className="note-audio" src={e.audioUrl} controls />
              ) : (
                e.text
              )}
            </div>
          ))}
        </div>
      )}
      <button className="see-all-notes" onClick={onSeeAllNotes}>
        See all notes ›
      </button>
    </div>
  );
}
