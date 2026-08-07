import { useEffect, useRef, useState } from "react";

const VISIBLE_MS = 5000;
const SLIDE_MS = 420;
const SWIPE_UP_THRESHOLD = 30;

// A real iOS-style push banner: slides down over whatever screen you're
// on, sits for 5s, then slides back up. Swipe up dismisses it early.
//
// Dismissing only hides the banner. The check-in itself stays in the
// stack on Home and in the Updates tab, an auto-hiding banner must not
// be the only place a message from the care team ever appears.
export default function NotifBanner({ item, onDone }) {
  const [shown, setShown] = useState(false);
  const [dragY, setDragY] = useState(0);
  const dragging = useRef(false);
  const dragYRef = useRef(0);
  const startY = useRef(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!item) return;

    setDragY(0);
    dragYRef.current = 0;
    // Next frame, so the element mounts off-screen first and the
    // transition actually runs instead of snapping into place.
    const raf = requestAnimationFrame(() => setShown(true));

    const hide = setTimeout(() => setShown(false), VISIBLE_MS);
    const clear = setTimeout(() => doneRef.current(), VISIBLE_MS + SLIDE_MS);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hide);
      clearTimeout(clear);
      setShown(false);
    };
  }, [item]);

  function dismissNow() {
    setShown(false);
    setTimeout(() => doneRef.current(), SLIDE_MS);
  }

  function onPointerDown(e) {
    startY.current = e.clientY;
    dragging.current = true;
  }

  function onPointerMove(e) {
    if (!dragging.current) return;
    // Only track upward drags, this banner dismisses upward.
    const dy = Math.min(0, e.clientY - startY.current);
    dragYRef.current = dy;
    setDragY(dy);
  }

  function endDrag() {
    if (!dragging.current) return;
    dragging.current = false;
    if (Math.abs(dragYRef.current) > SWIPE_UP_THRESHOLD) {
      dismissNow();
      return;
    }
    dragYRef.current = 0;
    setDragY(0);
  }

  if (!item) return null;

  return (
    <div className="notif-banner-layer" aria-live="polite">
      <div
        className={`notif-banner ${shown ? "shown" : ""}`}
        style={{
          "--drag-y": `${dragY}px`,
          transition: dragging.current
            ? "none"
            : `transform ${SLIDE_MS}ms cubic-bezier(0.23, 1, 0.32, 1), opacity ${SLIDE_MS}ms ease`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <div className="notif-banner-grip" aria-hidden="true" />
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
            <span className="ios-notif-app">Alongside · {item.stageLabel}</span>
            <span className="ios-notif-time">now</span>
          </div>
          <div className="ios-notif-text">{item.text}</div>
        </div>
      </div>
    </div>
  );
}
