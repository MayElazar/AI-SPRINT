export default function Notes({ logEntries }) {
  return (
    <div className="screen">
      <div className="statusbar">
        <span>9:41</span>
        <span>🔊 📶 🔋</span>
      </div>
      <div className="path-hero">
        <div className="eyebrow">Your notes</div>
        <div className="title headline">Everything you've logged</div>
        <div className="sub">
          Kept here across every stage, so nothing said in passing gets lost.
        </div>
      </div>
      {logEntries.length === 0 ? (
        <div className="qa-scope-note">
          Nothing logged yet. Notes you save on any stage will show up here, in
          order, across the whole day.
        </div>
      ) : (
        logEntries.map((e, i) => (
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
