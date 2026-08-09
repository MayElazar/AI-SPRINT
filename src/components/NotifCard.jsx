import { useRef, useState } from "react";

const DISMISS_THRESHOLD = 64;

// One check-in styled as an iOS notification: tap to expand, swipe
// (a "nudge") to dismiss it. Pass ownsTap={false} when a parent owns
// the tap gesture and the card should handle swipe only.
export default function NotifCard({
  appLabel,
  time,
  text,
  tag,
  tagVariant = "neutral",
  onDismiss,
  style,
  ownsTap = true,
}) {
  const [dragX, setDragX] = useState(0);
  const [dismissing, setDismissing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  // Refs, not state: pointerdown and pointerup can land in the same tick,
  // before React re-renders, so a state flag would still read stale here
  // and swallow the tap.
  const dragging = useRef(false);
  const dragXRef = useRef(0);
  const startX = useRef(0);
  const moved = useRef(false);

  function onPointerDown(e) {
    startX.current = e.clientX;
    moved.current = false;
    dragging.current = true;
  }

  function onPointerMove(e) {
    if (!dragging.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 4) moved.current = true;
    dragXRef.current = dx;
    setDragX(dx);
  }

  function endDrag() {
    if (!dragging.current) return;
    dragging.current = false;
    const dx = dragXRef.current;
    if (Math.abs(dx) > DISMISS_THRESHOLD) {
      setDismissing(true);
      setDragX(dx > 0 ? 500 : -500);
      setTimeout(() => onDismiss(), 200);
      return;
    }
    dragXRef.current = 0;
    setDragX(0);
    if (!moved.current && ownsTap) setExpanded((v) => !v);
  }

  return (
    <div
      className={`ios-notif ${expanded ? "expanded" : ""} ${dismissing ? "dismissing" : ""}`}
      style={{
        ...style,
        "--drag-x": `${dragX}px`,
        opacity: dismissing ? 0 : 1 - Math.min(Math.abs(dragX) / 260, 0.6),
        transition: dragging.current ? "none" : "transform 0.25s cubic-bezier(0.23,1,0.32,1), opacity 0.2s",
        touchAction: "pan-y",
        cursor: "grab",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      role="button"
      tabIndex={0}
    >
      <div className="ios-notif-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 20.5s-7.5-4.6-9.7-9.1C.8 8 2.3 4.7 5.6 4c2-.4 3.9.4 5 2 1.1-1.6 3-2.4 5-2 3.3.7 4.8 4 3.3 7.4-2.2 4.5-9.7 9.1-9.7 9.1z"
            fill="#fff"
          />
        </svg>
      </div>
      <div className="ios-notif-body">
        <div className="ios-notif-top">
          <span className="ios-notif-app-row">
            <span className="ios-notif-app">{appLabel}</span>
            {tag && <span className={`entry-tag entry-tag-${tagVariant}`}>{tag}</span>}
          </span>
          <span className="ios-notif-time">{time}</span>
        </div>
        <div className="ios-notif-text">{text}</div>
        {expanded && (
          <div className="ios-notif-hint">Tap to collapse · Swipe to dismiss</div>
        )}
      </div>
    </div>
  );
}
