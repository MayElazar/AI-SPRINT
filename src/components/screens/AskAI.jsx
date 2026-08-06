import { useState, useRef, useEffect } from "react";
import { STAGES } from "../../data/stages.js";

// Chat presentation, scoped backend. The assistant only ever answers from
// the same logistics-only Q&A already in stages.js, it never generates a
// free-form medical answer. Same guardrail as the per-stage Quick Answers,
// see O-output/.../video-scripts/video-script-meta-prompt.md for why:
// Dr. Elanan was explicit that this is not a chatbot standing in for the
// care team, "ChatGPT explained it" is not the same as understanding.
const ALL_QA = STAGES.flatMap((s) => s.qa.map((qa) => ({ ...qa, stage: s.label })));

const FALLBACK =
  "I can only help with logistics here, timing, who to ask, what to bring. For anything about Noa's actual condition or care, that stays with her care team, not me.";

const GREETING =
  "Hi, ask me anything about today's logistics, timing, who to talk to, what to bring. I'll stay out of anything medical, that's for Noa's care team.";

function findAnswer(text) {
  const q = text.trim().toLowerCase();
  if (!q) return null;
  const hit = ALL_QA.find((qa) => qa.q.toLowerCase().includes(q) || q.includes(qa.q.toLowerCase().slice(0, 12)));
  if (hit) return hit.a;
  const words = q.split(/\s+/).filter((w) => w.length > 3);
  const loose = ALL_QA.find((qa) => words.some((w) => qa.q.toLowerCase().includes(w)));
  return loose ? loose.a : null;
}

function newThread() {
  return {
    id: crypto.randomUUID(),
    startedAt: new Date(),
    messages: [{ role: "assistant", text: GREETING }],
  };
}

function threadPreview(thread) {
  const firstUser = thread.messages.find((m) => m.role === "user");
  return firstUser ? firstUser.text : "New chat";
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AskAI({ onBack }) {
  const [threads, setThreads] = useState(() => []);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  // First time in, with no history yet, go straight into a fresh chat.
  useEffect(() => {
    if (threads.length === 0) {
      const t = newThread();
      setThreads([t]);
      setActiveThreadId(t.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeThread = threads.find((t) => t.id === activeThreadId) || null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages.length]);

  function startNewChat() {
    const t = newThread();
    setThreads((prev) => [t, ...prev]);
    setActiveThreadId(t.id);
  }

  function send(text) {
    const question = text.trim();
    if (!question || !activeThreadId) return;
    const answer = findAnswer(question) || FALLBACK;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? {
              ...t,
              messages: [
                ...t.messages,
                { role: "user", text: question },
                { role: "assistant", text: answer },
              ],
            }
          : t
      )
    );
    setInput("");
  }

  const showingList = activeThreadId === null;
  const suggestions = ALL_QA.slice(0, 3);

  return (
    <div className="screen ask-screen">
      <div className="statusbar">
        <span>9:41</span>
        <span>🔊 📶 🔋</span>
      </div>

      <div className="back-row">
        <button
          className="back-btn"
          onClick={showingList ? onBack : () => setActiveThreadId(null)}
          aria-label="Back"
        >
          ←
        </button>
        <div className="back-title">Ask, logistics only</div>
      </div>

      {showingList && (
        <>
          <button className="new-chat-row" onClick={startNewChat}>
            <span className="new-chat-plus">+</span>
            New chat
          </button>
          <div className="section-label" style={{ marginTop: 4 }}>
            Previous chats
          </div>
          <div className="path-list">
            {threads.map((t) => (
              <button key={t.id} className="path-item" onClick={() => setActiveThreadId(t.id)}>
                <div className="path-body">
                  <div className="path-name" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {threadPreview(t)}
                  </div>
                  <div className="story-label" style={{ textAlign: "left" }}>
                    {formatTime(t.startedAt)}
                  </div>
                </div>
                <div className="path-chev">›</div>
              </button>
            ))}
          </div>
        </>
      )}

      {!showingList && activeThread && (
        <>
          <div className="chat-thread">
            {activeThread.messages.map((m, i) => (
              <div key={i} className={`chat-bubble-row ${m.role}`}>
                <div className={`chat-bubble ${m.role}`}>{m.text}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {activeThread.messages.length === 1 && (
            <div className="chat-suggestions">
              {suggestions.map((s) => (
                <button key={s.q} className="chat-suggestion-chip" onClick={() => send(s.q)}>
                  {s.q}
                </button>
              ))}
            </div>
          )}

          <form
            className="chat-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              className="chat-input"
              type="text"
              placeholder="Ask a logistics question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="chat-send" type="submit" aria-label="Send">
              ↑
            </button>
          </form>
        </>
      )}
    </div>
  );
}
