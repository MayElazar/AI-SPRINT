const HomeIcon = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 11.5L12 4l8 7.5V20a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-8.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const UpdatesIcon = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15.5 4.5l4 4L8 20H4v-4l11.5-11.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <path d="M13.5 6.5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const AskAiIcon = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M18 15l0.9 2.1L21 18l-2.1 0.9L18 21l-0.9-2.1L15 18l2.1-0.9L18 15z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

const YouIcon = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="2" />
    <path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const TABS = [
  { key: "home", label: "Home", icon: HomeIcon },
  { key: "updates", label: "Updates", icon: UpdatesIcon },
  { key: "ask", label: "Ask AI", icon: AskAiIcon },
  { key: "you", label: "You", icon: YouIcon },
];

export default function TabBar({ active, onNavigate }) {
  return (
    <div className="tab-bar">
      {TABS.map((t) => (
        <button
          key={t.key}
          className={`tab-btn ${active === t.key ? "on" : ""}`}
          aria-label={t.label}
          onClick={() => onNavigate(t.key)}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}
