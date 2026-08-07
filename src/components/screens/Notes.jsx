import { useEffect, useRef, useState } from "react";
import NotifCard from "../NotifCard.jsx";
import { STAGES } from "../../data/stages.js";

function formatNow() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Shown while a recording is being turned into text. Light in tone,
// but deliberately not jokey about the procedure itself.
const TRANSCRIBING_WORDS = [
  "Listening back",
  "Decoding the doctor-speak",
  "Tidying up the umms",
  "Typing faster than you could",
  "Almost there",
];

// Prototype stub: there is no transcription service wired up yet, so this
// fakes the round trip with a delay and canned text. Swap for a real
// speech-to-text call before this goes anywhere near a real visit.
const FAKE_TRANSCRIPT =
  "Dr. Cohen said the catheter went in without any trouble and Naya handled the sedation well. Recovery should be about an hour, and someone will come get us as soon as she's settled.";

// `checkins` arrives newest-first from App, which owns delivery timing.
// This screen is the full history, Home only shows the latest one.
export default function Notes({ logEntries, currentStage, checkins, onAddLog }) {
  const s = STAGES[currentStage];

  const [noteText, setNoteText] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [micError, setMicError] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [dismissed, setDismissed] = useState(() => new Set());
  const visibleCheckins = checkins.filter((c) => !dismissed.has(c.key));

  useEffect(() => {
    if (!transcribing) return;
    const t = setInterval(() => {
      setWordIndex((i) => (i + 1) % TRANSCRIBING_WORDS.length);
    }, 900);
    return () => clearInterval(t);
  }, [transcribing]);

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
        stream.getTracks().forEach((t) => t.stop());

        setTranscribing(true);
        setWordIndex(0);
        setTimeout(() => {
          setTranscribing(false);
          onAddLog({
            stageKey: s.key,
            stageLabel: s.label,
            time: formatNow(),
            type: "transcript",
            text: FAKE_TRANSCRIPT,
            audioUrl,
          });
        }, 4200);
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
        <div className="eyebrow">Updates &amp; notes</div>
        <div className="title headline">Everything from today</div>
        <div className="sub">
          Check-ins from the team, plus anything you write or record yourself.
        </div>
      </div>

      <div className="section-label" style={{ marginTop: 4 }}>
        Check-ins
      </div>
      {visibleCheckins.length === 0 ? (
        <div className="qa-scope-note">
          No updates yet. The moment something happens, it'll show up here.
        </div>
      ) : (
        <div className="notif-feed">
          {visibleCheckins.map((c, i) => (
            <NotifCard
              key={c.key}
              appLabel={`Alongside · ${c.stageLabel}`}
              time={c.time}
              text={c.text}
              onDismiss={() => setDismissed((prev) => new Set(prev).add(c.key))}
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      )}

      <div className="section-label">Your notes</div>
      <div className="log-card">
        <div className="log-label">Write, or record and let AI write it up</div>
        <textarea
          className="log-input"
          rows={2}
          placeholder="e.g. Dr. Cohen said the IV went in easily"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          disabled={transcribing}
        />
        <div className="note-actions">
          <button className="log-btn" onClick={writeNote} disabled={transcribing}>
            Save note
          </button>
          <button
            className={`record-btn ${recording ? "recording" : ""}`}
            onClick={recording ? stopRecording : startRecording}
            disabled={transcribing}
          >
            <span className="record-dot" />
            {recording ? "Stop recording" : "Record the team"}
          </button>
        </div>
        {micError && <div className="mic-error">{micError}</div>}
      </div>

      {transcribing && (
        <div className="transcribing-card" role="status" aria-live="polite">
          <div className="transcribing-head">
            <span className="transcribing-spark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"
                  fill="var(--accent)"
                />
              </svg>
            </span>
            <span className="transcribing-word" key={wordIndex}>
              {TRANSCRIBING_WORDS[wordIndex]}&hellip;
            </span>
          </div>
          <div className="skeleton-line" style={{ width: "92%" }} />
          <div className="skeleton-line" style={{ width: "78%" }} />
          <div className="skeleton-line" style={{ width: "85%" }} />
          <div className="skeleton-line" style={{ width: "45%" }} />
        </div>
      )}

      {logEntries.length === 0 && !transcribing ? (
        <div className="qa-scope-note">
          Nothing logged yet. Notes you save on any stage will show up here, in
          order, across the whole day.
        </div>
      ) : (
        [...logEntries].reverse().map((e, i) => (
          <div className="notes-screen-item" key={i}>
            <div className="log-stage">
              {e.stageLabel} · {e.time}
              {e.type === "transcript" && (
                <span className="transcript-tag">AI transcript</span>
              )}
            </div>
            {e.type === "audio" ? (
              <audio className="note-audio" src={e.audioUrl} controls />
            ) : (
              e.text
            )}
            {e.type === "transcript" && e.audioUrl && (
              <audio className="note-audio" src={e.audioUrl} controls />
            )}
          </div>
        ))
      )}
    </div>
  );
}
