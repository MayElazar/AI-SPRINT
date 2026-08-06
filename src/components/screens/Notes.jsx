import { useState, useRef } from "react";
import { STAGES } from "../../data/stages.js";

function formatNow() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Notes({ logEntries, currentStage, onAddLog }) {
  const s = STAGES[currentStage];

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

  return (
    <div className="screen">
      <div className="path-hero">
        <div className="eyebrow">Your notes</div>
        <div className="title headline">Everything you've logged</div>
        <div className="sub">
          Kept here across every stage, so nothing said in passing gets lost.
        </div>
      </div>

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

      {logEntries.length === 0 ? (
        <div className="qa-scope-note">
          Nothing logged yet. Notes you save on any stage will show up here, in
          order, across the whole day.
        </div>
      ) : (
        [...logEntries].reverse().map((e, i) => (
          <div className="notes-screen-item" key={i}>
            <div className="log-stage">
              {e.stageLabel} · {e.time}
            </div>
            {e.type === "audio" ? (
              <audio className="note-audio" src={e.audioUrl} controls />
            ) : (
              e.text
            )}
          </div>
        ))
      )}
    </div>
  );
}
