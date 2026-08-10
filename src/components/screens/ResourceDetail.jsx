const RESOURCE_ICON = {
  map: (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M9 4L3 6.5v13L9 17l6 3 6-2.5v-13L15 7 9 4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 4v13M15 7v13" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  guide: (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s-7-4.35-9.5-8.5C.7 8.9 2.4 5 6 4.3c2.1-.4 4 .5 6 2.3 2-1.8 3.9-2.7 6-2.3 3.6.7 5.3 4.6 3.5 8.2C19 16.65 12 21 12 21z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  ),
  article: (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="5" y="3.5" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 8h7M8.5 12h7M8.5 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};

export default function ResourceDetail({ resource, color, onBack }) {
  return (
    <div className="screen">
      <div className="back-row">
        <button className="back-btn" onClick={onBack}>
          ←
        </button>
        <div className="back-title">Resource</div>
      </div>

      <div className={`resource-detail-icon tint-${color}`}>{RESOURCE_ICON[resource.type]}</div>
      <div className="resource-detail-title headline">{resource.title}</div>
      <div className="resource-detail-body">{resource.full || resource.body}</div>
    </div>
  );
}
