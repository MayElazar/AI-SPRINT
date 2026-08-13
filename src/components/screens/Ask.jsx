import { useLayoutEffect, useRef, useState } from "react";
import { answerQuestion, SUGGESTED_QUESTIONS } from "../../lib/askAssistant.js";

const GREETING =
  "Hi, I'm your AI assistant for questions that come up during today's visit. For anything about Maya's care, her care team is always the best answer, I'll point you to them for that.";

function makeMessage(role, text, link) {
  return { id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`, role, text, link };
}

// Deliberately scoped: this chat answers app/hospital logistics only.
// Anything that reads as being about Maya's care routes to the care
// team instead, see askAssistant.js for the actual constraint.
export default function Ask({ onBack, currentStage, onOpenMap }) {
  const [messages, setMessages] = useState(() => [makeMessage("assistant", GREETING)]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const threadEndRef = useRef(null);

  useLayoutEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, thinking]);

  function send(text) {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    setMessages((prev) => [...prev, makeMessage("user", trimmed)]);
    setInput("");
    setThinking(true);
    // Prototype stub: no model call behind this, a short delay stands in
    // for one so the reply doesn't just snap in.
    setTimeout(() => {
      const { reply, link } = answerQuestion(trimmed, currentStage);
      setMessages((prev) => [...prev, makeMessage("assistant", reply, link)]);
      setThinking(false);
    }, 650);
  }

  // A reply can carry a follow-up action, like opening the hospital
  // map, rather than only ever being plain text.
  function handleLink(link) {
    if (link.action === "map") onOpenMap();
  }

  function handleSubmit(e) {
    e.preventDefault();
    send(input);
  }

  const showSuggestions = messages.length === 1 && !thinking;

  return (
    <div className="screen ask-screen">
      <div className="back-row">
        <button className="back-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="back-title">Ask AI</div>
      </div>

      <div className="path-hero path-hero-plain" style={{ marginTop: 0 }}>
        <div className="title headline">Ask AI</div>
        <div className="sub">
          Answers logistics and app questions. Anything about Maya's care goes to her team.
        </div>
      </div>

      <div className="chat-thread">
        {messages.map((m) => (
          <div className={`chat-bubble-row ${m.role}`} key={m.id}>
            <div className={`chat-bubble ${m.role}`}>
              {m.text}
              {m.link && (
                <button className="chat-bubble-link" onClick={() => handleLink(m.link)}>
                  {m.link.label} ›
                </button>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="chat-bubble-row assistant">
            <div className="chat-bubble assistant chat-typing" role="status" aria-label="Thinking">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={threadEndRef} />
      </div>

      {showSuggestions && (
        <div className="chat-suggestions">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button key={q} className="chat-suggestion-chip" onClick={() => send(q)}>
              {q}
            </button>
          ))}
        </div>
      )}

      <form className="chat-input-row" onSubmit={handleSubmit}>
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about today…"
          aria-label="Ask a question"
        />
        <button className="chat-send" type="submit" aria-label="Send" disabled={!input.trim() || thinking}>
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M21.9785 12.0033C21.9714 11.275 21.5613 10.6244 20.8966 10.3274L5.16347 2.99475C4.48465 2.68362 3.7139 2.78968 3.15528 3.27759C2.5896 3.75842 2.37041 4.5009 2.57547 5.21508L4.16646 10.6386C4.26545 10.9638 4.55536 11.183 4.89477 11.183L6.04029 11.1972L13.0689 11.2679C13.479 11.282 13.8114 11.6144 13.8043 12.0316C13.8043 12.4417 13.4649 12.7811 13.0477 12.774L5.94129 12.6963L4.9867 12.6892C4.64022 12.6821 4.33616 12.9155 4.24423 13.2478L2.6886 18.9612C2.53304 19.6118 2.71688 20.2623 3.1765 20.7219C3.226 20.7714 3.26843 20.8138 3.325 20.8563C3.88362 21.3159 4.64728 21.4007 5.30489 21.0967L20.9108 13.7074C21.5684 13.3892 21.9785 12.7387 21.9785 12.0033Z"
              fill="#fff"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
