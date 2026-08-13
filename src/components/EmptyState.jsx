// A light, low-weight placeholder for "nothing here yet", shared by
// Home's Updates card and the Updates tab's own feed, so the same
// visual language is used everywhere content is simply absent rather
// than broken.
export default function EmptyState({ text }) {
  return (
    <div className="home-empty-now">
      <span className="home-empty-now-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {text}
    </div>
  );
}
