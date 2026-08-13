import { STAGES } from "../data/stages.js";

// A scoped, logistics-only assistant: it never generates a clinical
// answer. Anything that reads as being about Maya's diagnosis, the
// procedure, or her care routes to "ask your care team" instead, with a
// pointer to that stage's own staff-vetted Quick answers if one already
// covers it. Keyword match, not NLP, deliberately errs toward
// over-refusing rather than ever improvising something medical.
//
// Prototype stub: rule-based, no model call behind it. The constraint
// itself (never answer procedure questions) is the part any real
// backend would still need to keep.
const PROCEDURE_KEYWORDS = [
  "procedure", "surgery", "surgical", "operation", "catheter",
  "anesthesi", "anaesthesi", "sedat", "heart", "cardiac", "cardiolog",
  "diagnos", "symptom", "medication", "medicine", "dose", "dosage",
  "drug", "bleed", "infect", "fever", "risk", "complicat", "pain",
  "hurt", "wound", "incision", "stitch", "suture", "vitals",
  "blood pressure", "pulse", "x-ray", "xray", "scan", "mri", "echo",
  "prognosis", "condition", "treatment", "antibiotic", "allerg",
  "side effect", "puncture", "discharge instructions", "wake up",
  "asleep", "sedated", "is it normal", "is that normal",
  "how long will", "when will she", "will she be okay",
  "will she be ok", "is she okay", "is she ok", "is it safe",
  "will it hurt",
];

const PROCEDURE_DECLINE =
  "That one's about Maya's medical care, and I'm kept from guessing at those on purpose, her care team knows her case and I don't. Please ask whoever's with you right now.";

// Curated answers for a handful of specific, known questions, checked
// before the general classifiers below so a logistics question that
// happens to contain a procedure-ish word (like "bring... for the
// procedure") doesn't get misrouted into a medical decline. Matched on
// a few distinctive words rather than the whole phrase, since a live
// demo won't always type the exact wording.
const CURATED_ANSWERS = [
  {
    test: (q) => q.includes("l203") || (q.includes("room") && q.includes("where")),
    a: "Room L203 is the Cath Lab, the procedure room itself, just past the family waiting area. Tap below and I'll show you the route on the map.",
    link: { label: "Open hospital map", action: "map" },
  },
  {
    test: (q) => q.includes("bring") && (q.includes("tomorrow") || q.includes("procedure")),
    a: "Bring Maya's insurance card and photo ID, a written list of her current medications, and if you'd like, a comfort item like a favorite stuffed animal, dressed in something comfortable to change out of.",
  },
  {
    test: (q) => q.includes("discharge") && q.includes("nurse"),
    a: "Galit is Maya's discharge nurse. She'll walk you through going home at the end, so nothing gets missed.",
  },
];

// Small, hand-written FAQ, the kind of thing safe to answer without a
// real backend: about the hospital or the app, never about a patient.
const LOGISTICS_FAQ = [
  { keywords: ["wifi", "wi-fi", "internet", "password"], a: "Guest wifi is \"Schneider-Guest\", no password needed, just accept the terms page." },
  { keywords: ["park", "parking", "car"], a: "The visitor garage is across from the main entrance, the first 30 minutes are free and a parent's badge covers the rest for today." },
  { keywords: ["coffee", "food", "eat", "cafeteria", "hungry", "snack"], a: "The cafeteria is on the ground floor and open until 8pm, there are also vending machines near the family waiting area." },
  { keywords: ["charge", "charger", "outlet", "plug"], a: "The family waiting area has charging points built into the arm of most chairs." },
  { keywords: ["bathroom", "restroom", "toilet"], a: "There's a restroom just past reception, and another inside the family waiting area." },
  { keywords: ["quiet room", "alone", "pray", "break"], a: "The family quiet room is past reception, on the same floor, it's open any time either of you needs a few minutes away." },
  { keywords: ["notification", "notif", "alert", "mute"], a: "You can change how often we reach out under You → Notification preferences." },
  { keywords: ["update", "check-in", "checkin"], a: "Every check-in from the team lands in Updates, tap the bell in the tab bar to see the full history." },
  { keywords: ["note", "record", "write down"], a: "You can add your own note anytime, tap the pencil on the Updates tab, typed or voice." },
  { keywords: ["map", "where is", "how do i get", "direction"], a: "Tap the map icon on Home for a layout of the unit, waiting area, cafeteria, and quiet room." },
  { keywords: ["language"], a: "Language options are under You → Language." },
  { keywords: ["who built", "who made", "about this app", "what is this app"], a: "Alongside is a companion app from Schneider Children's Medical Center, built to keep your family in the loop on a hospital day like today." },
];

const STOPWORDS = new Set([
  "is", "it", "the", "a", "an", "to", "for", "do", "does", "did", "i", "my",
  "will", "be", "are", "of", "on", "in", "and", "or", "that", "this",
  "what", "when", "where", "who", "how", "should", "can", "could", "would",
  "me", "we", "you", "your", "if", "so", "not", "no", "yes", "was", "were",
  "been", "have", "has", "had", "get", "got", "with", "about",
]);

function normalize(s) {
  return s.toLowerCase();
}

function meaningfulWords(text) {
  return (normalize(text).match(/[a-z']+/g) || []).filter(
    (w) => w.length > 2 && !STOPWORDS.has(w)
  );
}

// Looks only at stages reached so far, same rule the rest of the app
// follows: nothing about a stage that hasn't happened yet shows up early.
function findQaMatch(text, reachedStages) {
  const words = new Set(meaningfulWords(text));
  if (words.size === 0) return null;
  let best = null;
  let bestScore = 0;
  for (const stage of reachedStages) {
    for (const item of stage.qa) {
      const overlap = meaningfulWords(item.q).filter((w) => words.has(w)).length;
      if (overlap > bestScore) {
        bestScore = overlap;
        best = item;
      }
    }
  }
  // Require at least two shared meaningful words, one alone is too easy
  // to hit by coincidence and would surface an unrelated "vetted" answer.
  return bestScore >= 2 ? best : null;
}

export function answerQuestion(text, currentStageIndex = 0) {
  const q = normalize(text);

  const curated = CURATED_ANSWERS.find((entry) => entry.test(q));
  if (curated) {
    return { scope: "general", reply: curated.a, link: curated.link };
  }

  const isProcedure = PROCEDURE_KEYWORDS.some((k) => q.includes(k));

  if (isProcedure) {
    const reached = STAGES.slice(0, currentStageIndex + 1);
    const match = findQaMatch(text, reached);
    if (match) {
      return {
        scope: "procedure",
        reply: `That's already been covered by the team: "${match.a}" If that doesn't fully answer it, please ask your care team directly, I'm kept from going further than what they've already told you.`,
      };
    }
    return { scope: "procedure", reply: PROCEDURE_DECLINE };
  }

  const hit = LOGISTICS_FAQ.find((entry) => entry.keywords.some((k) => q.includes(k)));
  if (hit) {
    return { scope: "general", reply: hit.a };
  }

  return {
    scope: "general",
    reply:
      "I don't have a set answer for that one yet. I can help with things like the hospital, using this app, or getting around today, anything about Maya's care itself is best asked directly to her care team.",
  };
}

export const SUGGESTED_QUESTIONS = [
  "Where is room L203?",
  "What do I need to bring tomorrow for the procedure?",
  "Who is the discharge nurse?",
];

// The current stage's own staff-vetted "Quick answers" (see StageDetail),
// surfaced as tappable questions inside the chat too. These already went
// through a person, so tapping one answers straight from that content
// instead of through the keyword classifier above.
export function getStageQuickQuestions(currentStageIndex = 0) {
  const stage = STAGES[currentStageIndex];
  return stage && stage.qa && stage.qa.length > 0 ? stage.qa : null;
}
