import { useState, useEffect, useMemo } from "react";
import LogoLoader from "./components/LogoLoader.jsx";
import NotifBanner from "./components/NotifBanner.jsx";
import Welcome from "./components/screens/Welcome.jsx";
import Home from "./components/screens/Home.jsx";
import StageDetail from "./components/screens/StageDetail.jsx";
import Notes from "./components/screens/Notes.jsx";
import AskAI from "./components/screens/AskAI.jsx";
import You from "./components/screens/You.jsx";
import TabBar from "./components/TabBar.jsx";
import StageStory from "./components/StageStory.jsx";
import { STAGES } from "./data/stages.js";

// phase: "welcome" | "home" | "stage" | "updates" | "ask" | "you"
const TAB_PHASES = ["home", "updates", "ask", "you"];

const BOOT_WORDS = ["Connecting", "Gathering", "Preparing", "Assembling"];
const PUSH_INTERVAL_MS = 6000;

export default function App() {
  const [phase, setPhase] = useState("welcome");
  const [booting, setBooting] = useState(true);
  const [bootWordIndex, setBootWordIndex] = useState(0);
  const [currentStage, setCurrentStage] = useState(4); // demo default: Procedure
  const [openStageIndex, setOpenStageIndex] = useState(null);
  const [storyIndex, setStoryIndex] = useState(null); // non-null while the story overlay is open
  const [logEntries, setLogEntries] = useState([]);

  const showTabBar = (TAB_PHASES.includes(phase) && phase !== "ask") || phase === "stage";
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
          stageLabel: st.label,
          stageTitle: st.title,
          key: `${st.key}-${c.time}`,
        }))
      ),
    [currentStage]
  );

  const [deliveredCount, setDeliveredCount] = useState(0);
  const [bannerQueue, setBannerQueue] = useState([]);

  useEffect(() => {
    if (booting) return;
    if (deliveredCount >= checkinsChrono.length) return;
    const t = setTimeout(() => {
      const next = checkinsChrono[deliveredCount];
      setBannerQueue((q) => [...q, next]);
      setDeliveredCount((n) => n + 1);
    }, deliveredCount === 0 ? 900 : PUSH_INTERVAL_MS);
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
  }

  if (booting) {
    return (
      <div className="app-shell">
        <div className="boot-splash">
          <LogoLoader size={104} />
          <div className="boot-label">Alongside</div>
          <div className="boot-word" key={bootWordIndex}>
            {BOOT_WORDS[bootWordIndex]}&hellip;
          </div>
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
          onOpenStory={(i) => setStoryIndex(i)}
          checkins={deliveredCheckins}
          onSeeAllCheckins={() => setPhase("updates")}
        />
      )}

      {phase === "stage" && openStageIndex !== null && (
        <StageDetail
          stageIndex={openStageIndex}
          onBack={() => setPhase("home")}
          logEntries={logEntries}
          onAddLog={(entry) => setLogEntries((prev) => [...prev, entry])}
        />
      )}

      {phase === "updates" && (
        <Notes
          logEntries={logEntries}
          currentStage={currentStage}
          checkins={deliveredCheckins}
          onAddLog={(entry) => setLogEntries((prev) => [...prev, entry])}
        />
      )}

      {phase === "ask" && <AskAI onBack={() => setPhase("home")} />}

      {phase === "you" && <You />}

      {showTabBar && <TabBar active={activeTab} onNavigate={(dest) => setPhase(dest)} />}

      {storyIndex !== null && (
        <StageStory
          stageIndex={storyIndex}
          currentStage={currentStage}
          onClose={() => setStoryIndex(null)}
          onNavigate={(i) => {
            if (i >= 0 && i < STAGES.length) setStoryIndex(i);
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
