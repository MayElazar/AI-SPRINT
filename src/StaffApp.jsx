import { useEffect, useMemo, useState } from "react";
import * as familyStore from "./lib/familyStore.js";

// Staff-facing dashboard: same design tokens and stylesheet as the
// family app (see global.css's .staff-* rules), but its own layout,
// full-width rather than squeezed into the phone-frame mockup, since
// this is meant for a nurse or coordinator at a desk or a tablet, not
// a parent's phone. Lives at /staff, see main.jsx for the routing.
//
// "view" is a tiny in-memory router: "list" | "new" | family id. No
// history/back-button integration, this is a prototype dashboard, not
// a production admin tool.
export default function StaffApp() {
  const [families, setFamilies] = useState(() => familyStore.getFamilies());
  const [view, setView] = useState("list");

  useEffect(() => familyStore.subscribe(() => setFamilies(familyStore.getFamilies())), []);

  const familyList = useMemo(
    () => Object.values(families).sort((a, b) => b.updatedAt - a.updatedAt),
    [families]
  );

  const openFamily = view !== "list" && view !== "new" ? families[view] : null;

  return (
    <div className="staff-shell">
      <header className="staff-topbar">
        <div className="staff-brand">
          <span className="staff-brand-mark">alongside</span>
          <span className="staff-brand-tag">Care team</span>
        </div>
        {view !== "list" && (
          <button className="staff-link-btn" onClick={() => setView("list")}>
            ← All families
          </button>
        )}
      </header>

      <main className="staff-main">
        {view === "list" && <FamilyList families={familyList} onOpen={setView} onNew={() => setView("new")} />}
        {view === "new" && (
          <NewFamilyForm
            onCancel={() => setView("list")}
            onCreate={(data) => {
              const id = familyStore.createFamily(data);
              setFamilies(familyStore.getFamilies());
              setView(id);
            }}
          />
        )}
        {openFamily && <FamilyDetail family={openFamily} />}
        {view !== "list" && view !== "new" && !openFamily && (
          <div className="staff-empty">That family record isn't there anymore.</div>
        )}
      </main>
    </div>
  );
}

function FamilyList({ families, onOpen, onNew }) {
  return (
    <div className="staff-panel">
      <div className="staff-panel-head">
        <div>
          <h1 className="staff-h1">Families</h1>
          <p className="staff-sub">Update a family's stage or post a check-in, then send them their link.</p>
        </div>
        <button className="staff-btn" onClick={onNew}>
          + New family
        </button>
      </div>

      {families.length === 0 ? (
        <div className="staff-empty">No families yet. Add one to get started.</div>
      ) : (
        <div className="staff-family-list">
          {families.map((f) => (
            <button className="staff-family-card" key={f.id} onClick={() => onOpen(f.id)}>
              <div className="staff-family-card-main">
                <div className="staff-family-name">{f.patientName}</div>
                <div className="staff-family-meta">
                  {f.procedure || "No procedure set"} {f.age ? `· age ${f.age}` : ""}
                </div>
              </div>
              <div className="staff-stage-chip">{familyStore.STAGE_LABELS[f.currentStageIndex] || "—"}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NewFamilyForm({ onCancel, onCreate }) {
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [procedure, setProcedure] = useState("");
  const [parentNames, setParentNames] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!patientName.trim()) return;
    onCreate({ patientName, age, procedure, parentNames });
  }

  return (
    <div className="staff-panel">
      <h1 className="staff-h1">New family</h1>
      <form className="staff-form" onSubmit={submit}>
        <label className="staff-field">
          <span>Patient name</span>
          <input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Maya Cohen" autoFocus />
        </label>
        <label className="staff-field">
          <span>Age</span>
          <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="4" />
        </label>
        <label className="staff-field">
          <span>Procedure</span>
          <input value={procedure} onChange={(e) => setProcedure(e.target.value)} placeholder="Cardiac catheterization" />
        </label>
        <label className="staff-field">
          <span>Parents / guardians</span>
          <input value={parentNames} onChange={(e) => setParentNames(e.target.value)} placeholder="Michal and David" />
        </label>
        <div className="staff-form-actions">
          <button type="button" className="staff-btn staff-btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="staff-btn">
            Create family
          </button>
        </div>
      </form>
    </div>
  );
}

function FamilyDetail({ family }) {
  const [text, setText] = useState("");
  const [person, setPerson] = useState("");
  const [role, setRole] = useState("");
  const [copied, setCopied] = useState(false);
  const link = familyStore.familyLink(family.id);
  const checkins = (family.checkins || []).slice().reverse();

  function postUpdate(e) {
    e.preventDefault();
    if (!text.trim()) return;
    familyStore.addCheckin(family.id, { text, person, role, stageIndex: family.currentStageIndex });
    setText("");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can be blocked (permissions, non-secure context);
      // the link is still shown and selectable, so this is a soft-fail.
    }
  }

  return (
    <div className="staff-panel">
      <div className="staff-panel-head">
        <div>
          <h1 className="staff-h1">{family.patientName}</h1>
          <p className="staff-sub">
            {family.procedure || "No procedure set"} {family.age ? `· age ${family.age}` : ""}
            {family.parentNames ? ` · ${family.parentNames}` : ""}
          </p>
        </div>
      </div>

      <div className="staff-card">
        <div className="staff-card-label">Family link</div>
        <p className="staff-card-hint">Send this to {family.parentNames || "the family"}, it opens the app already following this case.</p>
        <div className="staff-link-row">
          <input className="staff-link-input" readOnly value={link} onFocus={(e) => e.target.select()} />
          <button className="staff-btn" onClick={copyLink}>
            {copied ? "Copied ✓" : "Copy link"}
          </button>
        </div>
      </div>

      <div className="staff-card">
        <div className="staff-card-label">Current stage</div>
        <div className="staff-stage-row">
          {familyStore.STAGE_LABELS.map((label, i) => (
            <button
              key={label}
              className={`staff-stage-btn ${i === family.currentStageIndex ? "on" : ""}`}
              onClick={() => familyStore.setStage(family.id, i)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="staff-card">
        <div className="staff-card-label">Post an update</div>
        <form className="staff-form" onSubmit={postUpdate}>
          <textarea
            className="staff-textarea"
            rows={2}
            placeholder="e.g. Maya is settled and the procedure has started, on schedule."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="staff-form-row">
            <input
              className="staff-input-inline"
              placeholder="Your name (optional)"
              value={person}
              onChange={(e) => setPerson(e.target.value)}
            />
            <input
              className="staff-input-inline"
              placeholder="Your role (optional)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <div className="staff-form-actions">
            <button type="submit" className="staff-btn">
              Send update
            </button>
          </div>
        </form>
      </div>

      <div className="staff-card">
        <div className="staff-card-label">Updates sent ({checkins.length})</div>
        {checkins.length === 0 ? (
          <div className="staff-empty">Nothing sent yet.</div>
        ) : (
          <div className="staff-feed">
            {checkins.map((c) => (
              <div className="staff-feed-item" key={c.id}>
                <div className="staff-feed-meta">
                  <b>{c.person}</b> · {c.role} · {c.time}
                </div>
                <div className="staff-feed-text">{c.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
