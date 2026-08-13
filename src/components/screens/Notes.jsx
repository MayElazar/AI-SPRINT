import { useMemo, useState } from "react";
import NotifCard from "../NotifCard.jsx";

// "11:42 AM" -> 702, so check-ins (fixed fictional times from stages.js)
// and notes (real wall-clock times) can be merged into one true order
// rather than just concatenated as two separate lists.
function timeToMinutes(t) {
  const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(t || "");
  if (!m) return 0;
  let h = parseInt(m[1], 10) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + parseInt(m[2], 10);
}

// `checkins` arrives newest-first from App, which owns delivery timing.
// This screen merges them with the parent's own notes into a single
// feed, newest first, each entry tagged with where it came from. The
// composer itself renders at the App level (see App.jsx), not nested
// here, so its overlay isn't capped by this screen's own stacking
// context and doesn't end up underneath the tab bar.
const FILTERS = [
  { key: "all", label: "All" },
  { key: "checkin", label: "Check-ins" },
  { key: "note", label: "Notes" },
];

export default function Notes({ logEntries, checkins, onOpenComposer }) {
  const [dismissed, setDismissed] = useState(() => new Set());
  const [filter, setFilter] = useState("all");

  const feed = useMemo(() => {
    const fromCheckins = checkins.map((c) => ({
      kind: "checkin",
      key: c.key,
      time: c.time,
      appLabel: `${c.person} · ${c.roleShort}`,
      tag: "Check-in",
      tagVariant: "checkin",
      text: c.text,
    }));
    const fromNotes = logEntries.map((e, i) => ({
      kind: "note",
      key: e.id || `log-${i}`,
      time: e.time,
      appLabel: "You",
      tag: e.type === "transcript" ? "AI transcript" : "Note",
      tagVariant: e.type === "transcript" ? "transcript" : "note",
      text: e.text,
      audioUrl: e.audioUrl,
      stageLabel: e.stageLabel,
    }));
    return [...fromCheckins, ...fromNotes]
      .filter((e) => !dismissed.has(e.key))
      .filter((e) => filter === "all" || e.kind === filter)
      .sort((a, b) => timeToMinutes(b.time) - timeToMinutes(a.time));
  }, [checkins, logEntries, dismissed, filter]);

  const counts = useMemo(() => {
    const visible = [...checkins.map((c) => ({ kind: "checkin", key: c.key })), ...logEntries.map((e, i) => ({ kind: "note", key: e.id || `log-${i}` }))].filter(
      (e) => !dismissed.has(e.key)
    );
    return {
      all: visible.length,
      checkin: visible.filter((e) => e.kind === "checkin").length,
      note: visible.filter((e) => e.kind === "note").length,
    };
  }, [checkins, logEntries, dismissed]);

  return (
    <div className="screen">
      <div className="path-hero path-hero-plain">
        <div className="eyebrow">Updates &amp; notes</div>
        <div className="title headline">Everything from today</div>
        <div className="sub">Check-ins from the team, plus anything you write or record.</div>
      </div>

      <div className="updates-toolbar">
        <button className="pencil-btn" onClick={onOpenComposer}>
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M14.5 4.5l5 5L9 20H4v-5L14.5 4.5z"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinejoin="round"
            />
            <path d="M12.5 6.5l5 5" stroke="currentColor" strokeWidth="1.9" />
          </svg>
          Write
        </button>
      </div>

      <div className="feed-filter-row">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`feed-filter-chip ${filter === f.key ? "on" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="feed-filter-count">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {feed.length === 0 ? (
        filter === "note" ? (
          <div className="notes-empty-state">
            <div className="notes-empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M14.5 4.5l5 5L9 20H4v-5L14.5 4.5z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path d="M12.5 6.5l5 5" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </div>
            <div className="notes-empty-title">Nothing you've written yet</div>
            <div className="notes-empty-sub">Write it down, or record it and we'll type it up.</div>
            <button className="notes-empty-cta" onClick={onOpenComposer}>
              Write your first update
            </button>
          </div>
        ) : (
          <div className="qa-scope-note">
            {filter === "checkin"
              ? "No check-ins yet. They'll show up here as the team sends them."
              : "Nothing yet. Check-ins and anything you write will show up here."}
          </div>
        )
      ) : (
        <div className="notif-feed">
          {feed.map((e, i) => (
            <div key={e.key}>
              <NotifCard
                appLabel={e.appLabel}
                time={e.time}
                text={e.text}
                tag={e.tag}
                tagVariant={e.tagVariant}
                onDismiss={() => setDismissed((prev) => new Set(prev).add(e.key))}
                style={{ animationDelay: `${i * 60}ms` }}
              />
              {e.audioUrl && <audio className="note-audio" src={e.audioUrl} controls />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
