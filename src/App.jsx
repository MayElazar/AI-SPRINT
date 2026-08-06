import { useState } from "react";
import Onboarding from "./components/screens/Onboarding.jsx";
import Arrival from "./components/screens/Arrival.jsx";
import Welcome from "./components/screens/Welcome.jsx";
import Home from "./components/screens/Home.jsx";
import StageDetail from "./components/screens/StageDetail.jsx";
import Notes from "./components/screens/Notes.jsx";
import AskAI from "./components/screens/AskAI.jsx";
import You from "./components/screens/You.jsx";
import TabBar from "./components/TabBar.jsx";
import StageStory from "./components/StageStory.jsx";
import { STAGES } from "./data/stages.js";

// phase: "onboarding" | "arrival" | "welcome" | "home" | "stage" | "updates" | "ask" | "you"
const TAB_PHASES = ["home", "updates", "ask", "you"];

export default function App() {
  const [phase, setPhase] = useState("onboarding");
  const [currentStage, setCurrentStage] = useState(3); // demo default: Procedure
  const [openStageIndex, setOpenStageIndex] = useState(null);
  const [storyIndex, setStoryIndex] = useState(null); // non-null while the story overlay is open
  const [logEntries, setLogEntries] = useState([]);

  const showTabBar = (TAB_PHASES.includes(phase) && phase !== "ask") || phase === "stage";
  const activeTab = phase === "stage" ? "home" : phase;

  function openStage(i) {
    setOpenStageIndex(i);
    setPhase("stage");
  }

  return (
    <div className="app-shell">
      {phase === "onboarding" && <Onboarding onDone={() => setPhase("arrival")} />}

      {phase === "arrival" && <Arrival onCheckIn={() => setPhase("welcome")} />}

      {phase === "welcome" && <Welcome onViewPath={() => setPhase("home")} />}

      {phase === "home" && (
        <Home
          currentStage={currentStage}
          onOpenStory={(i) => setStoryIndex(i)}
          onOpenStage={openStage}
          logEntries={logEntries}
          onAddLog={(entry) => setLogEntries((prev) => [...prev, entry])}
          onSeeAllNotes={() => setPhase("updates")}
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
    </div>
  );
}
