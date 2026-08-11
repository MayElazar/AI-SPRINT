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
      d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
