// Real content, grounded in the interview with Dr. Elanan (2026-07-30) and
// the actual Schneider discharge instructions Dr. Bruckheimer sent (2026-08-06).
// See O-output/01-research-report-pediatric-communication/ for sources.

import drBruckheimerPhoto from "../assets/dr-cohen.png";
import yaelPhoto from "../assets/yael.png";
import galitPhoto from "../assets/galit.png";

export const STAGES = [
  {
    key: "daybefore",
    label: "The day before",
    game: true,
    person: "Your care team",
    role: "Getting everything ready for tomorrow",
    avatar: "team",
    color: "cyan",
    title: "The day before",
    sub: "A few things to sort out tonight, so tomorrow morning is one less thing to think about.",
    offers: ["Checklist"],
    resource: null,
    checklist: [
      "Fasting after 8:00 PM tonight",
      "Clear liquids only until 6:00 AM",
      "Bring insurance card and ID",
      "Bring a list of current medications",
      "Bring a comfort item, like a favorite stuffed animal",
      "Wear comfortable clothing, easy to change out of",
      "Confirm tomorrow's arrival time and where to check in",
      "Try to get a good night's sleep, yours matters too",
    ],
    checkins: [],
    qa: [],
    resources: [
      {
        type: "guide",
        title: "Talking to Maya about tomorrow",
        body: "Age-appropriate words for a 4-year-old, and what not to promise her.",
        full: [
          "Keep it simple: \"the doctors are fixing a small part of your heart.\"",
          "It's okay if Maya asks the same question more than once.",
          "Avoid words like \"cut\" or \"needle\" right before bed.",
          "Answer honestly, even \"I don't know, let's ask tomorrow\" is a fine answer.",
          "Remind her that you'll be there the whole time, that's the part kids worry about most.",
          "Let her pack her own comfort item, having a job to do helps her feel in control.",
        ],
      },
      {
        type: "article",
        title: "Fasting and arrival rules",
        body: "What Maya can eat or drink, and exactly when to arrive.",
        full: [
          "Maya can eat and drink normally until midnight the night before.",
          "After that, water only, and nothing at all starting 6 hours before her scheduled time.",
          "Arrive 30 minutes early to allow time for check-in, that buffer is built in on purpose, even if traffic and parking go smoothly.",
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
    sub: "Meeting your team, a quick tour of the unit, and getting checked in, all before things get moving.",
    offers: ["Video", "Checklist"],
    resource: {
      type: "video",
      label: "A video from Yael",
      body: "Getting oriented for today",
    },
    videoUrl: "/videos/checkedin.mp4",
    transcript:
      "Hi, I'm Yael. I'll be with you throughout today. Right now our team is confirming your child's details and getting everything ready before the procedure begins.",
    checklistLabel: "What to bring",
    checklist: [
      "Insurance card and ID",
      "List of Maya's current medications",
      "Favorite toy or blanket",
      "Something for you: a book, headphones, whatever helps",
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
        body: "Cath Lab unit, waiting area, cafeteria, and the quiet room, all on one map.",
      },
      {
        type: "guide",
        title: "Talking to Maya about today",
        body: "Age-appropriate words for a 4-year-old, and what not to promise her.",
        full: [
          "The same honest, simple approach that worked last night still applies now that you're here.",
          "Name what's happening in plain words, and let her meet the people helping her before anything starts.",
          "If she asks a question you don't know the answer to, it's fine to say \"let's ask,\" the team would rather answer her directly than have you guess.",
        ],
      },
      {
        type: "article",
        title: "Fasting and arrival rules",
        body: "What Maya can eat or drink, and exactly when to arrive.",
        full: [
          "Maya can eat and drink normally until midnight the night before.",
          "After that, water only, and nothing at all starting 6 hours before her scheduled time.",
          "Arrive 30 minutes early to allow time for check-in, that buffer is built in on purpose, even if traffic and parking go smoothly.",
        ],
      },
      {
        type: "guide",
        title: "If Maya gets anxious waiting",
        body: "A few things that actually help kids her age in a waiting room.",
        full: [
          "A familiar comfort item from home helps more than most toys bought for the occasion.",
          "Short simple games work better than a long video.",
          "Keep a calm, matter-of-fact tone, kids pick up on parental anxiety fast.",
          "The quiet room is available anytime either of you needs a few minutes away from the main waiting area.",
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
        text: "Maya is settled and the procedure has started, on schedule.",
        person: "Noa K.",
        role: "Care coordinator, covering check-ins during the procedure",
      },
      {
        time: "12:35 PM",
        text: "Still on track. No news is expected news right now.",
        person: "Noa K.",
        role: "Care coordinator, covering check-ins during the procedure",
      },
      {
        time: "1:20 PM",
        text: "Running about 20 minutes past the typical window, this happens and isn't a concern on its own.",
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
        body: "Typical timing, what's normal, and when a delay is actually worth asking about.",
        full: [
          "Most procedures run 2 to 3 hours.",
          "It's normal, even expected, for that to feel longer than the procedure itself does for your child.",
          "Timing can vary by 20 minutes or more without anything being wrong.",
          "Someone will always come find you the moment there's an update, so there's no need to go looking.",
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
    offers: ["Video", "Check-ins"],
    resource: {
      type: "video",
      label: "A video from Yael",
      body: "What waking up looks like",
    },
    videoUrl: "/videos/recovery.mp4",
    transcript:
      "Your child is out of the procedure now, and we're watching closely as she wakes up. Some grogginess or fussiness at first is completely normal, and we'll let you know as soon as you can come in and see her.",
    checklist: [],
    checkins: [
      {
        time: "1:52 PM",
        text: "Maya is out of the procedure and in recovery, vitals being monitored.",
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
        type: "guide",
        title: "What waking up looks like",
        body: "Grogginess and fussiness are normal, here's what actually helps.",
        full: [
          "Some grogginess, fussiness, or brief confusion right after waking up is completely normal.",
          "It usually passes within the first 15 to 20 minutes.",
          "You'll be brought in to see her as soon as she's settled, seeing a familiar face tends to help more than anything else at that point.",
        ],
      },
    ],
  },
  {
    key: "ready",
    label: "Ready",
    person: "Galit",
    role: "Discharge nurse",
    avatar: "galit",
    color: "gold",
    title: "Ready for home",
    sub: "The last stage. Instructions get written down as Galit covers them.",
    offers: ["Video", "Checklist"],
    resource: {
      type: "video",
      label: "A video from Galit",
      body: "Getting ready to head home",
    },
    videoUrl: "/videos/ready.mp4",
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
    resources: [
      {
        type: "guide",
        title: "Explaining recovery at home to Maya",
        body: "Why she has to rest for a few days, in words a 4-year-old will accept.",
        full: [
          "Her body did some hard work today and now needs a few quiet days to feel strong again, like resting after being really tired.",
          "Name the specific things she can't do yet, like running or swimming.",
          "That tends to land better and cause fewer arguments than a vague \"take it easy.\"",
        ],
      },
    ],
  },
];
