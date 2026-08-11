/*
  Stage icons for Maya's path.

  NOTE ON PROVENANCE: these are hand-drawn to match the Streamline
  "Ultimate Regular" style the user referenced (24px grid, ~1.5px
  stroke, round caps and joins, outline only, no fill). They are NOT
  the actual Streamline files, their site rate-limited every attempt
  to fetch the real SVGs. Because nothing of theirs is redistributed
  here, the CC BY 4.0 attribution requirement is not triggered.

  To swap in the genuine set: download Ultimate Regular Free from
  streamlinehq.com, drop the SVGs in src/assets/icons/, import them
  here, and add the CC BY 4.0 credit to the You screen or a licenses
  page.
*/

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// Calendar page with a check, the night-before prep.
const DayBeforeIcon = (
  <svg viewBox="0 0 24 24">
    <rect x="3.25" y="4.75" width="17.5" height="15.5" rx="1.75" {...S} />
    <path d="M3.25 9.25h17.5" {...S} />
    <path d="M7.5 2.75v3.5" {...S} />
    <path d="M16.5 2.75v3.5" {...S} />
    <path d="m8.5 14.5 2 2 4-4" {...S} />
  </svg>
);

// Clipboard with a check, arrival and admission.
const ArrivalIcon = (
  <svg viewBox="0 0 24 24">
    <path d="M9 4.25H6.75a1.5 1.5 0 0 0-1.5 1.5v13.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V5.75a1.5 1.5 0 0 0-1.5-1.5H15" {...S} />
    <rect x="9" y="2.25" width="6" height="4" rx="1.25" {...S} />
    <path d="m9 13.5 2.1 2.1 4.2-4.2" {...S} />
  </svg>
);

// Heart with a pulse line through it.
const ProcedureIcon = (
  <svg viewBox="0 0 24 24">
    <path
      d="M12 20.5S3.25 15.4 3.25 9.4a4.65 4.65 0 0 1 8.75-2.2 4.65 4.65 0 0 1 8.75 2.2c0 6-8.75 11.1-8.75 11.1Z"
      {...S}
    />
    <path d="M4.9 11.75h3l1.5-3 2.4 6 1.6-3h5.7" {...S} />
  </svg>
);

// Hospital bed with a monitor.
const RecoveryIcon = (
  <svg viewBox="0 0 24 24">
    <path d="M2.75 10.25v9" {...S} />
    <path d="M2.75 16.25h18.5v3" {...S} />
    <path d="M21.25 16.25v-3a2.5 2.5 0 0 0-2.5-2.5H10.5v5.5" {...S} />
    <circle cx="6.6" cy="12.4" r="1.85" {...S} />
    <path d="M14.25 2.75h6a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-3.5a1 1 0 0 1 1-1Z" {...S} />
    <path d="M14.9 5.6h1.35l.7-1.35 1.1 2.7.75-1.35h1.05" {...S} />
  </svg>
);

// House, going home.
const ReadyIcon = (
  <svg viewBox="0 0 24 24">
    <path d="M2.75 10.6 12 3.25l9.25 7.35" {...S} />
    <path d="M4.9 12.3v7.45a1 1 0 0 0 1 1h12.2a1 1 0 0 0 1-1V12.3" {...S} />
    <path d="M9.5 20.75v-5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5.5" {...S} />
  </svg>
);

const ICONS = {
  daybefore: DayBeforeIcon,
  arrival: ArrivalIcon,
  procedure: ProcedureIcon,
  recovery: RecoveryIcon,
  ready: ReadyIcon,
};

export default function StageIcon({ stageKey }) {
  return ICONS[stageKey] || ICONS.arrival;
}
