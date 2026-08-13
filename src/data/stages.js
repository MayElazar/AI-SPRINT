// Real content, grounded in the interview with Dr. Elanan (2026-07-30) and
// the actual Schneider discharge instructions Dr. Bruckheimer sent (2026-08-06).
// See O-output/01-research-report-pediatric-communication/ for sources.

import drBruckheimerPhoto from "../assets/dr-cohen.png";
import yaelPhoto from "../assets/yael.png";
import galitPhoto from "../assets/galit.png";

export const STAGES = [
  {
    key: "daybefore",
    label: "Preparation",
    game: true,
    person: "Your care team",
    role: "Getting everything ready for tomorrow",
    avatar: "team",
    color: "cyan",
    title: "Preparation",
    sub: "A few things to take care of tonight before tomorrow.",
    offers: ["Checklist"],
    resource: null,
    instructions: [
      "Maya should fast, no food, starting at 8:00 PM tonight",
      "Give clear liquids only after that, and nothing at all after 6:00 AM tomorrow",
      "Bring Maya's insurance card and a photo ID",
      "Bring a written list of Maya's current medications",
      "Confirm tomorrow's arrival time and where to check in",
    ],
    recommendations: [
      "Pack a comfort item, like a favorite stuffed animal",
      "Dress Maya in comfortable clothing that's easy to change out of",
      "Try to get a good night's sleep, yours matters too",
    ],
    checkins: [],
    qa: [],
    resources: [
      {
        type: "guide",
        title: "Talking to Maya about tomorrow",
        body: "What to say tonight, and what not to promise.",
        full: [
          "Keep it simple: \"the doctors are fixing a small part of your heart.\"",
          "It's okay if Maya asks the same question more than once.",
          "Avoid words like \"cut\" or \"needle\" right before bed.",
          "Answer honestly. \"I don't know, let's ask tomorrow\" is a fine answer.",
          "Remind her you'll be there the whole time.",
          "Let her pack her own comfort item.",
        ],
      },
      {
        type: "article",
        title: "Fasting and arrival rules",
        body: "When Maya can eat, drink, and when to arrive.",
        full: [
          "Maya can eat and drink normally until midnight the night before.",
          "After that, water only, and nothing at all starting 6 hours before her scheduled time.",
          "Arrive 30 minutes early for check-in.",
        ],
      },
    ],
  },
  {
    key: "arrival",
    label: "Arrival & admission",
    person: "Yael",
    role: "Unit nurse, your point of contact today",
    avatar: "yael",
    videoAvatar: "doctor",
    color: "gold",
    team: [
      {
        photo: drBruckheimerPhoto,
        name: "Dr. Bruckheimer",
        role: "Pediatric cardiologist",
        caption: "Leads Maya's procedure today, and is who you'll see throughout.",
      },
      {
        photo: yaelPhoto,
        name: "Yael",
        role: "Unit nurse",
        caption: "Your point of contact for the whole day, from check-in through the wait.",
      },
      {
        photo: galitPhoto,
        name: "Galit",
        role: "Discharge nurse",
        caption: "Walks you through going home at the end, so nothing gets missed.",
      },
    ],
    title: "Arrival & admission",
    sub: "Meet your team, tour the unit, and check in.",
    offers: ["Video", "Checklist"],
    resource: {
      type: "video",
      label: "A video from Dr. Bruckheimer",
      body: "Getting oriented for today",
    },
    videoUrl: "/videos/checkedin.mp4",
    transcript:
      "Hi, I'm Dr. Bruckheimer. I'll be leading Maya's procedure today. Right now our team is confirming her details and getting everything ready before we begin.",
    checklistLabel: "What to bring",
    instructions: [
      "Bring Maya's insurance card and ID",
      "Bring a list of Maya's current medications",
    ],
    recommendations: [
      "Bring her favorite toy or blanket",
      "Bring something for you too: a book, headphones, whatever helps",
    ],
    checkins: [],
    qa: [
      {
        q: "Will the doctor I meet today be the one doing the procedure?",
        a: "Yes, Dr. Bruckheimer leads Maya's procedure and is who you'll see throughout.",
      },
      {
        q: "Where do I wait during the procedure itself?",
        a: "The family waiting area right outside the unit, Yael will point it out.",
      },
      {
        q: "Who do I ask if something changes before we start?",
        a: "Yael, she's your point of contact for the whole day.",
      },
      {
        q: "Where do I go if I need a few minutes alone?",
        a: "The family quiet room is past reception, on the same floor.",
      },
    ],
    resources: [
      {
        type: "map",
        title: "Hospital map",
        body: "Cath Lab, waiting area, cafeteria, and quiet room.",
      },
      {
        type: "guide",
        title: "If Maya gets anxious waiting",
        body: "What helps kids her age in a waiting room.",
        full: [
          "A familiar comfort item helps more than a new toy.",
          "Short simple games work better than a long video.",
          "Stay calm and matter-of-fact, kids pick up on anxiety fast.",
          "The quiet room is open anytime you need a few minutes away.",
        ],
      },
    ],
  },
  {
    key: "preprocedure",
    label: "Pre Procedure",
    person: "Pre-op nurse",
    role: "Getting Maya ready for the procedure room",
    avatar: "nurse",
    color: "purple",
    title: "Pre Procedure",
    sub: "Changing, monitors, and meeting the anesthesia team.",
    offers: ["Checklist"],
    resource: null,
    checklist: [],
    checkins: [
      {
        time: "10:50 AM",
        text: "Maya's in her gown. The anesthesia team is meeting with you both now.",
        person: "Pre-op nurse",
        role: "Getting Maya ready for the procedure room",
      },
    ],
    qa: [
      {
        q: "Can I stay with Maya until she's asleep?",
        a: "Yes, one parent can stay right up until she's under anesthesia, then a nurse walks you out to the waiting area.",
      },
      {
        q: "Why does the anesthesia team ask the same questions Yael already asked?",
        a: "It's a deliberate double-check, not a sign anything was missed the first time.",
      },
      {
        q: "Will Maya be awake when they place the IV?",
        a: "Usually not, the anesthesia team times sedation so the IV goes in once she's already calm or asleep.",
      },
    ],
    resources: [
      {
        type: "guide",
        title: "What happens in pre-op",
        body: "What happens, in order.",
        full: [
          "Maya changes into a gown. A nurse attaches monitors for her heart rate and oxygen.",
          "The anesthesia team introduces themselves and reviews her history. Some questions repeat Yael's, that's a safety check.",
          "A light sedative, often a flavored liquid, helps her relax first.",
          "You stay with her until she's fully asleep.",
          "A nurse then walks you to the waiting area. The procedure starts shortly after.",
        ],
      },
      {
        type: "guide",
        title: "Helping Maya through this part",
        body: "What helps in the last few minutes before anesthesia.",
        full: [
          "\"Sleepy medicine\" lands better than technical words.",
          "Bringing her comfort item into pre-op is usually fine, ask the nurse to confirm.",
          "A calm, steady voice from you matters more than what you say.",
          "Grogginess or silliness as the sedative kicks in is normal.",
        ],
      },
    ],
  },
  {
    key: "procedure",
    label: "Procedure",
    person: "Dr. Bruckheimer",
    role: "Pediatric cardiologist, Maya's procedure",
    avatar: "doctor",
    color: "pink",
    title: "In procedure",
    sub: "Typically 2 to 3 hours.",
    offers: ["Video", "Check-ins"],
    resource: {
      type: "video",
      label: "A video from Dr. Bruckheimer",
      body: "What's normal to feel right now",
    },
    videoUrl: "/videos/procedure.mp4",
    transcript:
      "Your child is in the procedure room now. We're threading a small catheter through a blood vessel to the heart, guided by imaging the whole time, and she is fully monitored and asleep. Most parents say this wait is harder than the procedure itself, and that's completely normal. There's nothing you need to do right now except wait, and you'll know the moment there's an update.",
    checklist: [],
    checkins: [
      {
        time: "11:42 AM",
        text: "Procedure started on schedule. Maya is settled.",
        person: "Noa K.",
        role: "Care coordinator, covering check-ins during the procedure",
      },
      {
        time: "1:20 PM",
        text: "Running about 20 minutes behind schedule. This is normal, not a concern.",
        person: "Noa K.",
        role: "Care coordinator, covering check-ins during the procedure",
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
    resources: [
      {
        type: "article",
        title: "What to expect during the wait",
        body: "Typical timing and what's normal.",
        full: [
          "Most procedures run 2 to 3 hours.",
          "It's normal for the wait to feel longer than the procedure itself.",
          "Timing can vary by 20 minutes or more without anything being wrong.",
          "Someone will come find you the moment there's an update.",
        ],
      },
      {
        type: "map",
        title: "Family waiting area",
        body: "Right outside the unit, with charging points and a TV.",
      },
    ],
  },
  {
    key: "recovery",
    label: "Recovery",
    person: "Yael",
    role: "Unit nurse, your point of contact today",
    avatar: "yael",
    color: "green",
    title: "In recovery",
    sub: "Out of the procedure, being watched as she wakes.",
    offers: ["Check-ins"],
    resource: null,
    checklist: [],
    checkins: [
      {
        time: "1:52 PM",
        text: "Maya's out of the procedure and in recovery. Vitals are being monitored.",
        person: "Yael",
        role: "Unit nurse, your point of contact today",
      },
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
    resources: [
      {
        type: "article",
        title: "What's happening right now",
        body: "What the team's doing, where to go, and how long it takes.",
        full: [
          "Maya's in the recovery bay while the sedation wears off. Vitals are checked regularly.",
          "This usually takes 15 to 20 minutes from when she arrives in recovery.",
          "Yael or another team member will come get you from the waiting area once she's ready.",
          "The recovery bay is just past the Cath Lab unit, marked on the hospital map.",
        ],
      },
      {
        type: "guide",
        title: "What waking up looks like",
        body: "Grogginess and fussiness are normal, here's what helps.",
        full: [
          "Grogginess, fussiness, or brief confusion right after waking up is normal.",
          "It usually passes within the first 15 to 20 minutes.",
          "You'll be brought in as soon as she's settled. Seeing you helps more than anything else.",
        ],
      },
    ],
  },
  {
    key: "ready",
    label: "Discharge",
    person: "Galit",
    role: "Discharge nurse",
    avatar: "galit",
    color: "coral",
    title: "Discharge",
    sub: "The last stage. Instructions get written down as Galit covers them.",
    offers: ["Video", "Checklist"],
    resource: {
      type: "video",
      label: "A video from Galit",
      body: "Getting ready to head home",
    },
    videoUrl: "/videos/ready.mp4",
    instructions: [
      "Keep Maya resting today, no running, contact sports, or biking for one week",
      "Check the puncture site once a day for 3 days, change the dressing once a day",
      "No bath or pool for 24 hours, no swimming for one week",
      "Call the unit right away if you see: bleeding, spreading redness, worsening pain, a cold limb, or a fever above 38C",
      "Schedule the follow-up echo for about 6 months from today",
    ],
    recommendations: ["Mild leg discomfort for a few days is normal, no action needed unless it gets worse"],
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
    resources: [
      {
        type: "guide",
        title: "Explaining recovery at home to Maya",
        body: "Why she needs to rest, explained simply.",
        full: [
          "Her body worked hard today and needs a few quiet days to recover.",
          "Name the specific things she can't do yet, like running or swimming.",
          "That works better than a vague \"take it easy.\"",
        ],
      },
    ],
  },
];
