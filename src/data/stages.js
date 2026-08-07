// Real content, grounded in the interview with Dr. Elanan (2026-07-30) and
// the actual Schneider discharge instructions Dr. Bruckheimer sent (2026-08-06).
// See O-output/01-research-report-pediatric-communication/ for sources.

export const STAGES = [
  {
    key: "meetteam",
    label: "Meet the team",
    person: "Your care team",
    role: "Dr. Cohen, Yael, and Galit",
    avatar: "team",
    color: "purple",
    title: "Meet your care team",
    sub: "Before today starts, a quick introduction to who's with you.",
    offers: ["Checklist"],
    resource: null,
    checklist: [
      "Dr. Cohen, pediatric cardiologist, leads today's procedure",
      "Yael, unit nurse, your point of contact for the whole day",
      "Galit, discharge nurse, walks you through going home at the end",
    ],
    checkins: [],
    qa: [
      {
        q: "Will the doctor I meet today be the one doing the procedure?",
        a: "Yes, Dr. Cohen leads Naya's procedure and is who you'll see throughout.",
      },
      {
        q: "Who do I go to if I have a question about today's plan?",
        a: "Yael, she's your point of contact for the whole day.",
      },
    ],
  },
  {
    key: "tour",
    label: "Hospital tour",
    person: "Yael",
    role: "Unit nurse, your point of contact today",
    avatar: "tour",
    color: "cyan",
    title: "A quick tour",
    sub: "Where everything is before today gets moving: the unit, the waiting area, the cafeteria.",
    offers: ["Checklist"],
    resource: null,
    checklist: [
      "Cath Lab unit, 3rd floor, where you'll check in and wait",
      "Family waiting area, right outside the unit, with charging points and a TV",
      "Cafeteria, ground floor, open from 7am",
      "Quiet room, past reception on the same floor, if you need a few minutes alone",
    ],
    checkins: [],
    qa: [
      {
        q: "Where do I wait during the procedure itself?",
        a: "The family waiting area right outside the unit, Yael will point it out.",
      },
      {
        q: "Is there somewhere to get food nearby?",
        a: "The cafeteria on the ground floor, open from 7am.",
      },
    ],
  },
  {
    key: "checkedin",
    label: "Checked in",
    person: "Yael",
    role: "Unit nurse, your point of contact today",
    avatar: "nurse",
    color: "gold",
    title: "Checked in",
    sub: "Getting oriented for today, before things get moving.",
    offers: ["Video", "Checklist"],
    resource: {
      type: "video",
      label: "A video from Yael",
      body: "Getting oriented for today",
    },
    videoUrl: "/videos/checkedin.mp4",
    transcript:
      "Hi, I'm Yael. I'll be with you throughout today. Right now our team is confirming your child's details and getting everything ready before the procedure begins.",
    checklist: [
      "Bring Naya's insurance card and ID",
      "Fasting since midnight, water only until 6am",
      "Arrive 30 minutes before your scheduled time",
    ],
    checkins: [],
    qa: [
      {
        q: "Who do I ask if something changes before we start?",
        a: "Yael, she's your point of contact for the whole day.",
      },
      {
        q: "Where do I go if I need a few minutes alone?",
        a: "The family quiet room is past reception, on the same floor.",
      },
    ],
  },
  {
    key: "prep",
    label: "Prep",
    person: "Dr. Cohen",
    role: "Pediatric cardiologist, Naya's procedure",
    avatar: "doctor",
    color: "coral",
    title: "In prep",
    sub: "IV line, final checks, a word with the anesthesia team.",
    offers: ["Video"],
    resource: {
      type: "video",
      label: "A video from Dr. Cohen",
      body: "What prep involves",
    },
    transcript:
      "I will explain what we are planning to do and what you can expect during the procedure. Our team will be with your child throughout every step.",
    checklist: [],
    checkins: [],
    qa: [
      { q: "How long does prep usually take?", a: "Usually 30 to 45 minutes." },
      {
        q: "Will I be able to stay with her for this part?",
        a: "Yes, until she's taken back for the procedure itself.",
      },
    ],
  },
  {
    key: "procedure",
    label: "Procedure",
    person: "Dr. Cohen",
    role: "Pediatric cardiologist, Naya's procedure",
    avatar: "doctor",
    color: "pink",
    title: "In procedure",
    sub: "Typically 2 to 3 hours. This is where periodic check-ins replace a live feed.",
    offers: ["Video", "Check-ins"],
    resource: {
      type: "video",
      label: "A video from Dr. Cohen",
      body: "What's normal to feel right now",
    },
    transcript:
      "Your child is in the procedure room now. We're threading a small catheter through a blood vessel to the heart, guided by imaging the whole time, and she is fully monitored and asleep. Most parents say this wait is harder than the procedure itself, and that's completely normal. There's nothing you need to do right now except wait, and you'll know the moment there's an update.",
    checklist: [],
    checkins: [
      { time: "11:42 AM", text: "Naya is settled and the procedure has started, on schedule." },
      { time: "12:35 PM", text: "Still on track. No news is expected news right now." },
      {
        time: "1:20 PM",
        text: "Running about 20 minutes past the typical window, this happens and isn't a concern on its own.",
      },
    ],
    qa: [
      {
        q: "Will someone find me the moment it's done, or should I go looking?",
        a: "Someone will come find you, no need to go looking.",
      },
      {
        q: "Is it normal for this to run longer than expected?",
        a: "Yes, timing varies and a longer wait alone isn't a signal of a problem.",
      },
    ],
  },
  {
    key: "recovery",
    label: "Recovery",
    person: "Yael",
    role: "Unit nurse, your point of contact today",
    avatar: "nurse",
    color: "green",
    title: "In recovery",
    sub: "Out of the procedure, being watched as she wakes.",
    offers: ["Video", "Check-ins"],
    resource: {
      type: "video",
      label: "A video from Yael",
      body: "What waking up looks like",
    },
    transcript:
      "Your child is out of the procedure now, and we're watching closely as she wakes up. Some grogginess or fussiness at first is completely normal, and we'll let you know as soon as you can come in and see her.",
    checklist: [],
    checkins: [
      { time: "1:52 PM", text: "Naya is out of the procedure and in recovery, vitals being monitored." },
    ],
    qa: [
      {
        q: "When can I actually see her?",
        a: "As soon as she's settled in recovery, usually within 15 to 20 minutes.",
      },
      {
        q: "Is it normal for her to seem confused right after waking?",
        a: "Yes, grogginess and brief confusion are both expected.",
      },
    ],
  },
  {
    key: "ready",
    label: "Ready",
    person: "Galit",
    role: "Discharge nurse",
    avatar: "nurse",
    color: "gold",
    title: "Ready for home",
    sub: "The last stage. Instructions get written down as Galit covers them.",
    offers: ["Checklist"],
    resource: null,
    checklist: [
      "Rest today, no running, contact sports, or biking for a week",
      "Check the puncture site daily for 3 days, change the dressing once a day",
      "No bath or pool for 24 hours, no swimming for a week",
      "Mild leg discomfort for a few days is normal",
      "Call the unit if: bleeding, spreading redness, worsening pain, a cold limb, or fever above 38C",
      "Follow-up echo, about 6 months out",
    ],
    checkins: [],
    qa: [
      {
        q: "What if I forget something they told me at home?",
        a: "It's saved in your notes for this stage, you don't have to remember it alone.",
      },
      {
        q: "Who do I call if something comes up after we leave?",
        a: "The unit's after-hours line, printed on your discharge paperwork.",
      },
    ],
  },
];
