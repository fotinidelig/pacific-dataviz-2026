import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { useDimensions } from "./use-dimensions";


/**
 * Live light/dark wipe (same idea as daisyUI Diff, without the dependency).
 * `split` = 1 → fully light (handle on the right)
 * `split` = 0 → fully dark (handle on the left)
 * Dark is underneath; dragging the handle left reveals dark on the right.
 */

const HANDLE_WIDTH_PX = 90; // must match .theme-wipe__handle width
const HANDLE_HALF = HANDLE_WIDTH_PX / 2;

export default function ThemeWipe({ light, dark, onSplitChange }) {
  const containerRef = useRef(null);
  const { width } = useDimensions(containerRef);
  const startSplitRef = useRef(1);
  const x = useMotionValue(0);

  // 1 = light only (default). Drag left to reveal dark on the right.
  const [split, setSplit] = useState(1);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  useEffect(() => {
    onSplitChange?.(split);
  }, [split, onSplitChange]);

  // Keep x in sync when width first becomes known / on keyboard snaps
  useEffect(() => {
    if (width <= 0) return;
    x.set(split * width - HANDLE_HALF);
  }, [width]);


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

      <motion.div
        className="theme-wipe__handle"
        drag="x"
        dragElastic={0}
        dragMomentum={false}
        dragConstraints={{ left: -HANDLE_HALF, right: width - HANDLE_HALF }}
        onDrag={() => {
          if (width <= 0) return;
          const nextSplit = Math.min(1, Math.max(0, (x.get() + HANDLE_HALF) / width));
          setSplit(nextSplit);
        }}
        onDragStart={() => {
          startSplitRef.current = split;
          setShowSwipeHint(false);
        }}
        onDragEnd={() => {
          if (width <= 0) return;
          const currentSplit = Math.min(1, Math.max(0, (x.get() + HANDLE_HALF) / width));
          const start = startSplitRef.current;
          const traveled = Math.abs(currentSplit - start);
          const targetSplit = traveled >= 0.1 ? (start === 1 ? 0 : 1) : start;
          setSplit(targetSplit);
          animate(x, targetSplit * width - HANDLE_HALF, {
            type: "spring",
            stiffness: 300,
            damping: 40,
          });
        }}
        style={{ x }}
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
      </motion.div>
    </div>
  );
}
