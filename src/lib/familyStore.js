// Shared "database" for the staff app and the family app: just
// localStorage, since this is a same-origin prototype (staff view lives
// at /staff in this same app, family view at /). A real deployment would
// swap this module for actual API calls without touching either app's
// components, they only ever call these functions.
const STORAGE_KEY = "alongside_families_v1";
const CHANGED_EVENT = "alongside:families-changed";

// Mirrors STAGES in ../data/stages.js by index, kept as a small local
// copy instead of importing the full stage content (transcripts,
// checklists, resources) into the staff app, which never needs any of
// that.
export const STAGE_LABELS = ["The day before", "Arrival & admission", "Procedure", "Recovery", "Discharge"];

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // The native `storage` event only fires in OTHER tabs, never the tab
  // that made the write, so the staff app's own screen wouldn't see its
  // own update without this.
  window.dispatchEvent(new CustomEvent(CHANGED_EVENT));
}

function slugify(name) {
  const base = (name || "family")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return (base || "family") + "-" + Math.random().toString(36).slice(2, 6);
}

export function getFamilies() {
  return readAll();
}

export function getFamily(id) {
  if (!id) return null;
  return readAll()[id] || null;
}

export function createFamily({ patientName, age, procedure, parentNames }) {
  const all = readAll();
  const id = slugify(patientName);
  const now = Date.now();
  all[id] = {
    id,
    patientName: patientName || "Patient",
    age: age || "",
    procedure: procedure || "",
    parentNames: parentNames || "",
    currentStageIndex: 0,
    checkins: [],
    createdAt: now,
    updatedAt: now,
  };
  writeAll(all);
  return id;
}

export function setStage(id, stageIndex) {
  const all = readAll();
  if (!all[id]) return;
  all[id].currentStageIndex = stageIndex;
  all[id].updatedAt = Date.now();
  writeAll(all);
}

export function addCheckin(id, { text, person, role, stageIndex }) {
  const all = readAll();
  if (!all[id] || !text || !text.trim()) return;
  const now = new Date();
  all[id].checkins.push({
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    text: text.trim(),
    person: person && person.trim() ? person.trim() : "Care team",
    role: role && role.trim() ? role.trim() : "Update",
    stageIndex: typeof stageIndex === "number" ? stageIndex : all[id].currentStageIndex,
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    ts: now.getTime(),
  });
  all[id].updatedAt = Date.now();
  writeAll(all);
}

export function deleteFamily(id) {
  const all = readAll();
  delete all[id];
  writeAll(all);
}

// Fires cb() whenever any family record changes, in this tab or another.
export function subscribe(cb) {
  const handler = () => cb();
  window.addEventListener("storage", handler);
  window.addEventListener(CHANGED_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(CHANGED_EVENT, handler);
  };
}

export function familyLink(id) {
  const url = new URL(window.location.href);
  url.pathname = "/";
  url.search = `?family=${encodeURIComponent(id)}`;
  url.hash = "";
  return url.toString();
}
