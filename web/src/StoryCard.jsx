import { motion } from "motion/react";
import "./StoryCard.css";

/**
 * Bottom-left story beat for map context.
 * Sits under InfoCard (lower z-index) so a country card covers it.
 *
 * Wrap in <AnimatePresence> so exit opacity can play when the card unmounts.
 */
export default function StoryCard({ title, children, dark = false, onClose }) {
  if (!children) return null;

  return (
    <motion.aside
      className={`story-card${dark ? " story-card--dark" : ""}`}
      aria-label={title ?? "Story"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
      transition={{ type: "spring", stiffness: 80, damping: 40 }}
    >
      {onClose && (
        <button
          type="button"
          className="story-card__close"
          onClick={onClose}
          aria-label="Close story"
        >
          ×
        </button>
      )}

      {title && (
        <h3 className="story-card__title text-subheader">{title}</h3>
      )}

      <div className="story-card__body text-body_small">{children}</div>
    </motion.aside>
  );
}
