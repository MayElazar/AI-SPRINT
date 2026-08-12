import { useState, useEffect, useMemo } from "react";
import alongsideLogo from "./assets/alongside-logo.svg";
import schneiderLogoMarkup from "./assets/schneider-logo.svg?raw";
import NotifBanner from "./components/NotifBanner.jsx";
import Welcome from "./components/screens/Welcome.jsx";
import Home from "./components/screens/Home.jsx";
import StageDetail from "./components/screens/StageDetail.jsx";
import ResourceDetail from "./components/screens/ResourceDetail.jsx";
import Notes from "./components/screens/Notes.jsx";
import You from "./components/screens/You.jsx";
import TabBar from "./components/TabBar.jsx";
import StageStory from "./components/StageStory.jsx";
import HospitalMap3D from "./components/HospitalMap3D.jsx";
import NoteComposer from "./components/NoteComposer.jsx";
import HeartGame from "./components/HeartGame.jsx";
import { STAGES } from "./data/stages.js";

// phase: "welcome" | "home" | "stage" | "updates" | "you"
const TAB_PHASES = ["home", "updates", "you"];

const BOOT_WORDS = ["Connecting", "Gathering", "Preparing", "Assembling"];
// First check-in lands 3s after the procedure stage starts, every one
// after that is 20s apart, this is prototype pacing for a demo, not a
// real estimate of how often updates would actually arrive.
const FIRST_PUSH_DELAY_MS = 3000;
const PUSH_INTERVAL_MS = 20000;

export default function App() {
  const [phase, setPhase] = useState("welcome");
  const [booting, setBooting] = useState(true);
  const [bootWordIndex, setBootWordIndex] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [openStageIndex, setOpenStageIndex] = useState(null);
  const [openResource, setOpenResource] = useState(null); // { resource, color }
  const [storyIndex, setStoryIndex] = useState(null); // non-null while the story overlay is open
  const [logEntries, setLogEntries] = useState([]);
  const [mapOpen, setMapOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);

  const showTabBar = TAB_PHASES.includes(phase) || phase === "stage";
  const activeTab = phase === "stage" ? "home" : phase;

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

  // Check-in delivery lives here, not in Home, so a banner can slide in
  // over whichever screen you happen to be on, the way a phone does.
  const checkinsChrono = useMemo(
    () =>
      STAGES.slice(0, currentStage + 1).flatMap((st) =>
        st.checkins.map((c) => ({
          ...c,
          stageKey: st.key,
          stageLabel: st.label,
          stageTitle: st.title,
          person: c.person || st.person,
          roleShort: (c.role || st.role).split(",")[0],
          key: `${st.key}-${c.time}`,
        }))
      ),
    [currentStage]
  );

  const [deliveredCount, setDeliveredCount] = useState(0);
  const [bannerQueue, setBannerQueue] = useState([]);
  // How many check-ins the user has actually seen in Updates, so the tab's
  // bell can carry a red dot for ones that arrived while they were elsewhere.
  const [seenCount, setSeenCount] = useState(0);
  const hasUnseenUpdates = deliveredCount > seenCount;

  useEffect(() => {
    if (phase === "updates") setSeenCount(deliveredCount);
  }, [phase, deliveredCount]);

  useEffect(() => {
    if (booting) return;
    if (deliveredCount >= checkinsChrono.length) return;
    // First check-in arrives quickly (3s), so a demo doesn't sit and
    // wait, every one after that is spaced further apart (20s).
    const delay = deliveredCount === 0 ? FIRST_PUSH_DELAY_MS : PUSH_INTERVAL_MS;
    const t = setTimeout(() => {
      const next = checkinsChrono[deliveredCount];
      setBannerQueue((q) => [...q, next]);
      setDeliveredCount((n) => n + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [booting, deliveredCount, checkinsChrono]);

  // Newest first, for the persistent stack on Home.
  const deliveredCheckins = useMemo(
    () => checkinsChrono.slice(0, deliveredCount).slice().reverse(),
    [checkinsChrono, deliveredCount]
  );

  function openStage(i) {
    setOpenStageIndex(i);
    setPhase("stage");
    setCurrentStage((prev) => Math.max(prev, i));
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
          onOpenStory={openStage}
          checkins={deliveredCheckins}
          onSeeAllCheckins={() => setPhase("updates")}
          onOpenMap={() => setMapOpen(true)}
        />
      )}

      {phase === "stage" && openStageIndex !== null && (
        <StageDetail
          stageIndex={openStageIndex}
          onBack={() => setPhase("home")}
          onOpenStory={(i) => setStoryIndex(i)}
          onOpenResource={(resource, color) => setOpenResource({ resource, color })}
          onOpenGame={() => setGameOpen(true)}
          onNavigate={(i) => {
            if (i < 0 || i >= STAGES.length) return;
            setOpenStageIndex(i);
            // Prototype behaviour: browsing forward to a stage counts as
            // reaching it, so its check-ins start arriving, browsing back
            // to look at something earlier doesn't undo progress.
            setCurrentStage((prev) => Math.max(prev, i));
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

      {phase === "you" && <You />}

      {showTabBar && (
        <TabBar active={activeTab} onNavigate={(dest) => setPhase(dest)} hasUnseenUpdates={hasUnseenUpdates} />
      )}

      {storyIndex !== null && (
        <StageStory stageIndex={storyIndex} onClose={() => setStoryIndex(null)} />
      )}

      {mapOpen && <HospitalMap3D onClose={() => setMapOpen(false)} />}

      {gameOpen && <HeartGame onClose={() => setGameOpen(false)} />}

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
