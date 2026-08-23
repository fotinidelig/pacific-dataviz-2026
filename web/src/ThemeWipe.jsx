import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

/**
 * Live light/dark wipe (same idea as daisyUI Diff, without the dependency).
 * `split` = 1 → fully light (handle on the right)
 * `split` = 0 → fully dark (handle on the left)
 * Dark is underneath; dragging the handle left reveals dark on the right.
 */
export default function ThemeWipe({ light, dark, onSplitChange }) {
  const containerRef = useRef(null);
  // 1 = light only (default). Drag left to reveal dark on the right.
  const [split, setSplit] = useState(1);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const draggingRef = useRef(false);

  useEffect(() => {
    onSplitChange?.(split);
  }, [split, onSplitChange]);

  const updateSplit = (clientX) => {
    const el = containerRef.current;
    if (!el) return;
    const { left, width } = el.getBoundingClientRect();
    if (width <= 0) return;
    const next = (clientX - left) / width;
    setSplit(Math.min(1, Math.max(0, next)));
  };

  const onPointerDown = (event) => {
    draggingRef.current = true;
    setShowSwipeHint(false);
    event.currentTarget.setPointerCapture(event.pointerId);
    updateSplit(event.clientX);
  };

  const onPointerMove = (event) => {
    if (!draggingRef.current) return;
    updateSplit(event.clientX);
  };

  const onPointerUp = (event) => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const clipRight = `${(1 - split) * 100}%`;
  // Right side → pull left. Left side → pull right.
  const pointsLeft = "14.5 9.5 10 14 14.5 18.5";
  const pointsRight = "13.5 9.5 18 14 13.5 18.5";
  const showLeftArrow = split >= 0.5;
  // Keep the control inside the frame: park + breathe toward the center
  // (floating_content uses overflow:hidden, so outward motion gets clipped).
  const inward = showLeftArrow ? -1 : 1;
  const rest = inward * 36;
  const peak = inward * 48;

  return (
    <div ref={containerRef} className="theme-wipe">
      <div className="theme-wipe__layer theme-wipe__layer--dark">{dark}</div>
      <div
        className="theme-wipe__layer theme-wipe__layer--light"
        style={{ clipPath: `inset(0 ${clipRight} 0 0)` }}
      >
        {light}
      </div>

      <div
        className="theme-wipe__handle"
        style={{ left: `${split * 100}%` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="slider"
        aria-label="Reveal dark theme"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(split * 100)}
        aria-orientation="horizontal"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            setShowSwipeHint(false);
            setSplit((s) => Math.max(0, s - 0.05));
          } else if (event.key === "ArrowRight") {
            setShowSwipeHint(false);
            setSplit((s) => Math.min(1, s + 0.05));
          } else if (event.key === "Home") {
            setShowSwipeHint(false);
            setSplit(0);
          } else if (event.key === "End") {
            setShowSwipeHint(false);
            setSplit(1);
          }
        }}
      >
        <motion.div
          className={`theme-wipe__control${showLeftArrow ? " theme-wipe__control--left" : " theme-wipe__control--right"}`}
          animate={{ x: [rest, peak, rest] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <span
            className={`theme-wipe__swipe-hint${showSwipeHint ? " theme-wipe__swipe-hint--visible" : ""}`}
            aria-hidden={!showSwipeHint}
          >
            swipe
          </span>
          <svg
            className="theme-wipe__arrow"
            viewBox="0 0 28 28"
            width="40"
            height="40"
            aria-hidden="true"
            style={{ "--color": "var(--color-navy)" }}
          >
            <polyline
              points={showLeftArrow ? pointsLeft : pointsRight}
              fill="none"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
