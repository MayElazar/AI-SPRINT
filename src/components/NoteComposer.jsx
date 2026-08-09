import { useEffect, useRef, useState } from "react";

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
  "Dr. Bruckheimer said the catheter went in without any trouble and Maya handled the sedation well. Recovery should be about an hour, and someone will come get us as soon as she's settled.";

// Full-screen composer, iPhone Notes-style: Cancel / Done up top, a big
// plain textarea, and a record button that fills the textarea with an
// AI write-up once it's done, rather than a small inline card.
export default function NoteComposer({ onClose, onSave }) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [micError, setMicError] = useState("");
  const [usedVoice, setUsedVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!transcribing) return;
    const t = setInterval(() => {
      setWordIndex((i) => (i + 1) % TRANSCRIBING_WORDS.length);
    }, 900);
    return () => clearInterval(t);
  }, [transcribing]);

  async function startRecording() {
    setMicError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        stream.getTracks().forEach((t) => t.stop());
        setAudioUrl(url);
        setTranscribing(true);
        setWordIndex(0);
        setTimeout(() => {
          setTranscribing(false);
          setUsedVoice(true);
          setText((prev) => (prev.trim() ? `${prev.trim()}\n\n${FAKE_TRANSCRIPT}` : FAKE_TRANSCRIPT));
        }, 4200);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch {
      setMicError("Microphone access is needed to record a note.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  function handleDone() {
    const trimmed = text.trim();
    if (!trimmed) {
      onClose();
      return;
    }
    onSave({
      type: usedVoice ? "transcript" : "text",
      text: trimmed,
      audioUrl: usedVoice ? audioUrl : undefined,
    });
  }

  return (
    <div className="note-compose-overlay">
      <div className="note-compose-topbar">
        <button className="note-compose-cancel" onClick={onClose}>
          Cancel
        </button>
        <div className="note-compose-title">New note</div>
        <button className="note-compose-done" onClick={handleDone} disabled={!text.trim() || transcribing}>
          Done
        </button>
      </div>

      <textarea
        ref={textareaRef}
        className="note-compose-text"
        placeholder="Write what you heard, or record and let AI write it up…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={transcribing}
      />

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

      {micError && <div className="mic-error">{micError}</div>}

      <div className="note-compose-toolbar">
        <button
          className={`record-btn ${recording ? "recording" : ""}`}
          onClick={recording ? stopRecording : startRecording}
          disabled={transcribing}
        >
          <span className="record-dot" />
          {recording ? "Stop recording" : "Record & summarize with AI"}
        </button>
      </div>
    </div>
  );
}
