import { useState, useEffect, useMemo, useRef } from "react";
import alongsideLogo from "./assets/alongside-logo.svg";
import schneiderLogoMarkup from "./assets/schneider-logo.svg?raw";
import NotifBanner from "./components/NotifBanner.jsx";
import Welcome from "./components/screens/Welcome.jsx";
import Home from "./components/screens/Home.jsx";
import StageDetail from "./components/screens/StageDetail.jsx";
import ResourceDetail from "./components/screens/ResourceDetail.jsx";
import Notes from "./components/screens/Notes.jsx";
import Ask from "./components/screens/Ask.jsx";
import You from "./components/screens/You.jsx";
import TabBar from "./components/TabBar.jsx";
import StageStory from "./components/StageStory.jsx";
import HospitalMap3D from "./components/HospitalMap3D.jsx";
import NoteComposer from "./components/NoteComposer.jsx";
import HeartRunner from "./components/HeartRunner.jsx";
import { STAGES } from "./data/stages.js";
import * as familyStore from "./lib/familyStore.js";

// phase: "welcome" | "home" | "stage" | "updates" | "ask" | "you"
// "ask" has no tab bar of its own, same as "welcome", it's reached via
// the Ask tab button and uses its own back arrow + input bar instead.
const TAB_PHASES = ["home", "updates", "you"];

const BOOT_WORDS = ["Connecting", "Gathering", "Preparing", "Assembling"];

// A curated two-check-in beat for a live product demo: both from Yael,
// triggered together (see the effect below) the moment Arrival &
// admission is marked complete, 10s apart, rather than simulating a
// real arrival cadence. Deliberately not pushed as a NotifBanner, they
// only ever show up in Home's "Right now" card and the Updates feed.
const ARRIVAL_TRIGGER_CHECKIN_1 = {
  key: "arrival-trigger-1",
  time: "10:45 AM",
  text: "Procedure is running 20 minutes behind schedule. Normal, not a concern.",
  person: "Yael",
  role: "Unit nurse, your point of contact today",
  roleShort: "Unit nurse",
  stageKey: "procedure",
  stageLabel: "Procedure",
  stageTitle: "In procedure",
};
const ARRIVAL_TRIGGER_CHECKIN_2 = {
  key: "arrival-trigger-2",
  time: "11:25 AM",
  text: "Maya's out of the procedure and in recovery. Vitals are being monitored.",
  person: "Yael",
  role: "Unit nurse, your point of contact today",
  roleShort: "Unit nurse",
  stageKey: "recovery",
  stageLabel: "Recovery",
  stageTitle: "In recovery",
};
const ARRIVAL_TRIGGER_DELAY_MS = 10000;

// A ?family=<id> link (generated from the staff app) switches this app
// from the scripted demo timeline to following that family's real
// record in familyStore: staff-set stage, staff-posted check-ins, live.
const familyId = new URLSearchParams(window.location.search).get("family");

export default function App() {
  const [phase, setPhase] = useState("welcome");
  const [booting, setBooting] = useState(true);
  const [bootWordIndex, setBootWordIndex] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  // Separate from currentStage on purpose: currentStage tracks how far
  // the timeline has progressed, completion is a family-controlled
  // checkbox that doesn't move just from opening a stage, so it needs
  // its own state. Marking Arrival & admission complete is also what
  // triggers the demo check-in beat below.
  const [completedStages, setCompletedStages] = useState(() => new Set());
  const [openStageIndex, setOpenStageIndex] = useState(null);
  const [openResource, setOpenResource] = useState(null); // { resource, color }
  const [storyIndex, setStoryIndex] = useState(null); // non-null while the story overlay is open
  const [logEntries, setLogEntries] = useState([]);
  const [mapOpen, setMapOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [liveFamily, setLiveFamily] = useState(() => (familyId ? familyStore.getFamily(familyId) : null));

  const showTabBar = TAB_PHASES.includes(phase) || phase === "stage";
  const activeTab = phase === "stage" ? "home" : phase;

  // Live mode: re-read the family record whenever the staff app changes
  // it, in another tab (the normal case) or, thanks to familyStore's own
  // change event, this same tab too.
  useEffect(() => {
    if (!familyId) return;
    return familyStore.subscribe(() => setLiveFamily(familyStore.getFamily(familyId)));
  }, []);

  // Staff is the source of truth for the stage in live mode, so this
  // follows their record directly instead of the "only ever moves
  // forward as you browse" rule the scripted demo uses below.
  useEffect(() => {
    if (familyId && liveFamily) setCurrentStage(liveFamily.currentStageIndex || 0);
  }, [liveFamily]);

  function bumpStage(i) {
    // In live mode the stage is staff-authoritative, browsing a stage
    // locally shouldn't also silently fast-forward the shared record.
    if (familyId) return;
    setCurrentStage((prev) => Math.max(prev, i));
  }

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 3200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!booting) return;
    const interval = setInterval(() => {
      setBootWordIndex((i) => (i + 1) % BOOT_WORDS.length);
    }, 800);
    return () => clearInterval(interval);
  }, [booting]);

  // Live mode: staff-authored check-ins from familyStore, chronological.
  const liveCheckins = useMemo(() => {
    if (!familyId) return [];
    return (liveFamily?.checkins || []).map((c) => {
      const st = STAGES[c.stageIndex] || STAGES[0];
      return {
        ...c,
        stageKey: st.key,
        stageLabel: st.label,
        stageTitle: st.title,
        roleShort: (c.role || st.role || "").split(",")[0],
        key: c.id,
      };
    });
  }, [liveFamily]);

  // Demo mode: a curated two-check-in beat (see the constants above),
  // triggered once by marking Arrival & admission complete, not a
  // timer or currentStage. Resets if that box gets unchecked, so the
  // beat can be replayed for another walkthrough.
  const [triggeredCheckins, setTriggeredCheckins] = useState([]);
  const arrivalIndex = useMemo(() => STAGES.findIndex((s) => s.key === "arrival"), []);
  const arrivalDoneRef = useRef(false);
  const triggerTimeoutRef = useRef(null);

  useEffect(() => {
    if (familyId) return;
    const arrivalDone = completedStages.has(arrivalIndex);
    if (arrivalDone && !arrivalDoneRef.current) {
      arrivalDoneRef.current = true;
      clearTimeout(triggerTimeoutRef.current);
      setTriggeredCheckins([ARRIVAL_TRIGGER_CHECKIN_1]);
      triggerTimeoutRef.current = setTimeout(() => {
        setTriggeredCheckins([ARRIVAL_TRIGGER_CHECKIN_1, ARRIVAL_TRIGGER_CHECKIN_2]);
      }, ARRIVAL_TRIGGER_DELAY_MS);
    } else if (!arrivalDone && arrivalDoneRef.current) {
      arrivalDoneRef.current = false;
      clearTimeout(triggerTimeoutRef.current);
      setTriggeredCheckins([]);
    }
  }, [completedStages, familyId, arrivalIndex]);

  useEffect(() => () => clearTimeout(triggerTimeoutRef.current), []);

  const checkinsChrono = familyId ? liveCheckins : triggeredCheckins;

  const [bannerQueue, setBannerQueue] = useState([]);
  // How many check-ins the user has actually seen in Updates, so the tab's
  // bell can carry a red dot for ones that arrived while they were elsewhere.
  const [seenCount, setSeenCount] = useState(0);
  const hasUnseenUpdates = checkinsChrono.length > seenCount;

  useEffect(() => {
    if (phase === "updates") setSeenCount(checkinsChrono.length);
  }, [phase, checkinsChrono.length]);

  // Only live mode ever pushes a NotifBanner, a staff update is a real
  // push. The demo beat above is deliberately not one, see its own
  // comment, it only ever shows up in Home and Updates.
  const bannerDeliveredCountRef = useRef(0);
  useEffect(() => {
    if (booting || !familyId) return;
    if (liveCheckins.length <= bannerDeliveredCountRef.current) return;
    const next = liveCheckins[liveCheckins.length - 1];
    setBannerQueue((q) => [...q, next]);
    bannerDeliveredCountRef.current = liveCheckins.length;
  }, [booting, familyId, liveCheckins]);

  // Newest first, for the persistent stack on Home.
  const deliveredCheckins = useMemo(() => checkinsChrono.slice().reverse(), [checkinsChrono]);

  function toggleStageComplete(i) {
    setCompletedStages((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function openStage(i) {
    setOpenStageIndex(i);
    setPhase("stage");
    bumpStage(i);
  }

  if (booting) {
    return (
      <div className="app-shell">
        <div className="boot-splash">
          <img className="boot-logo-wordmark" src={alongsideLogo} alt="Alongside" />
          <div className="boot-word" key={bootWordIndex}>
            {BOOT_WORDS[bootWordIndex]}&hellip;
          </div>
          <div
            className="boot-schneider-logo"
            role="img"
            aria-label="Schneider Children's Medical Center"
            dangerouslySetInnerHTML={{ __html: schneiderLogoMarkup }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {phase === "welcome" && <Welcome onViewPath={() => setPhase("home")} />}

      {phase === "home" && (
        <Home
          currentStage={currentStage}
          completedStages={completedStages}
          onToggleComplete={toggleStageComplete}
          onOpenStory={openStage}
          checkins={deliveredCheckins}
          onSeeAllCheckins={() => setPhase("updates")}
          onOpenMap={() => setMapOpen(true)}
          liveLabel={liveFamily ? `Connected to ${liveFamily.patientName}'s care team` : null}
        />
      )}

      {phase === "stage" && openStageIndex !== null && (
        <StageDetail
          stageIndex={openStageIndex}
          completed={completedStages.has(openStageIndex)}
          onToggleComplete={() => toggleStageComplete(openStageIndex)}
          onBack={() => setPhase("home")}
          onOpenStory={(i) => setStoryIndex(i)}
          onOpenResource={(resource, color) => setOpenResource({ resource, color })}
          onOpenMap={() => setMapOpen(true)}
          onOpenGame={() => setGameOpen(true)}
          onNavigate={(i) => {
            if (i < 0 || i >= STAGES.length) return;
            setOpenStageIndex(i);
            // Prototype behaviour: browsing forward to a stage counts as
            // reaching it, so its check-ins start arriving, browsing back
            // to look at something earlier doesn't undo progress. (Live
            // mode skips this, the staff record is authoritative there.)
            bumpStage(i);
          }}
          checkins={deliveredCheckins}
          onSeeAllCheckins={() => setPhase("updates")}
        />
      )}

      {phase === "updates" && (
        <Notes
          logEntries={logEntries}
          currentStage={currentStage}
          checkins={deliveredCheckins}
          onOpenComposer={() => setComposerOpen(true)}
        />
      )}

      {phase === "ask" && (
        <Ask onBack={() => setPhase("home")} currentStage={currentStage} onOpenMap={() => setMapOpen(true)} />
      )}

      {phase === "you" && <You />}

      {showTabBar && (
        <TabBar active={activeTab} onNavigate={(dest) => setPhase(dest)} hasUnseenUpdates={hasUnseenUpdates} />
      )}

      {storyIndex !== null && (
        <StageStory stageIndex={storyIndex} onClose={() => setStoryIndex(null)} />
      )}

      {mapOpen && <HospitalMap3D onClose={() => setMapOpen(false)} />}

      {gameOpen && <HeartRunner onClose={() => setGameOpen(false)} />}

      {openResource && (
        <ResourceDetail
          resource={openResource.resource}
          color={openResource.color}
          onBack={() => setOpenResource(null)}
        />
      )}

      {composerOpen && (
        <NoteComposer
          onClose={() => setComposerOpen(false)}
          onSave={(note) => {
            const s = STAGES[currentStage];
            setLogEntries((prev) => [
              ...prev,
              {
                id: `note-${Date.now()}`,
                stageKey: s.key,
                stageLabel: s.label,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                ...note,
              },
            ]);
            setComposerOpen(false);
          }}
        />
      )}

      <NotifBanner
        item={bannerQueue[0] || null}
        onDone={() => setBannerQueue((q) => q.slice(1))}
      />
    </div>
  );
}
