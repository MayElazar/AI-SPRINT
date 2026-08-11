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

// A WhatsApp-style composer: a single pill input at the bottom that
// grows as you type, native keyboard included, with a mic button that
// swaps for a send button the moment there's text, same as a chat app.
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
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!transcribing) return;
    const t = setInterval(() => {
      setWordIndex((i) => (i + 1) % TRANSCRIBING_WORDS.length);
    }, 900);
    return () => clearInterval(t);
  }, [transcribing]);

  function autoGrow(el) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  function handleTextChange(e) {
    setText(e.target.value);
    autoGrow(e.target);
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
        const url = URL.createObjectURL(blob);
        stream.getTracks().forEach((t) => t.stop());
        setAudioUrl(url);
        setTranscribing(true);
        setWordIndex(0);
        setTimeout(() => {
          setTranscribing(false);
          setUsedVoice(true);
          setText((prev) => (prev.trim() ? `${prev.trim()}\n\n${FAKE_TRANSCRIPT}` : FAKE_TRANSCRIPT));
          requestAnimationFrame(() => autoGrow(inputRef.current));
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

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
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
        <div className="note-compose-spacer" aria-hidden="true" />
      </div>

      <div className="wa-compose-body">
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

        {recording && (
          <div className="wa-recording-hint">
            <span className="record-dot" /> Recording&hellip; tap the mic again to stop
          </div>
        )}

        {micError && <div className="mic-error">{micError}</div>}
      </div>

      <div className="wa-input-bar">
        <textarea
          ref={inputRef}
          className="wa-input"
          rows={1}
          placeholder="Write what you heard, or tap the mic…"
          value={text}
          onChange={handleTextChange}
          disabled={transcribing}
        />
        {text.trim() ? (
          <button className="wa-send-btn" onClick={handleSend} disabled={transcribing} aria-label="Send">
            <svg viewBox="0 0 24 24" fill="none" className="wa-send-icon">
              <path
                d="M21.9785 12.0033C21.9714 11.275 21.5613 10.6244 20.8966 10.3274L5.16347 2.99475C4.48465 2.68362 3.7139 2.78968 3.15528 3.27759C2.5896 3.75842 2.37041 4.5009 2.57547 5.21508L4.16646 10.6386C4.26545 10.9638 4.55536 11.183 4.89477 11.183L6.04029 11.1972L13.0689 11.2679C13.479 11.282 13.8114 11.6144 13.8043 12.0316C13.8043 12.4417 13.4649 12.7811 13.0477 12.774L5.94129 12.6963L4.9867 12.6892C4.64022 12.6821 4.33616 12.9155 4.24423 13.2478L2.6886 18.9612C2.53304 19.6118 2.71688 20.2623 3.1765 20.7219C3.226 20.7714 3.26843 20.8138 3.325 20.8563C3.88362 21.3159 4.64728 21.4007 5.30489 21.0967L20.9108 13.7074C21.5684 13.3892 21.9785 12.7387 21.9785 12.0033Z"
                fill="#fff"
              />
            </svg>
          </button>
        ) : (
          <button
            className={`wa-mic-btn ${recording ? "recording" : ""}`}
            onClick={recording ? stopRecording : startRecording}
            disabled={transcribing}
            aria-label={recording ? "Stop recording" : "Record a note"}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="9" y="3" width="6" height="11" rx="3" fill="#fff" />
              <path
                d="M6 11a6 6 0 0 0 12 0M12 17v3"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
