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
      d="M12 4a5 5 0 00-5 5v3.4c0 .6-.2 1.2-.6 1.7L5 16h14l-1.4-1.9c-.4-.5-.6-1.1-.6-1.7V9a5 5 0 00-5-5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M10 19a2 2 0 004 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
