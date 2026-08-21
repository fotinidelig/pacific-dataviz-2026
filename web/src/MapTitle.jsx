import { motion } from "motion/react";

/**
 * Simple entrance: fade in + slide from the left, with a spring.
 *
 * Motion basics used here:
 * - initial  → starting state (before animation)
 * - animate  → ending state (Motion tweens toward this)
 * - transition → how to get there (here: a spring, optional delay)
 */
export default function MapTitle({ title, subtitle, dark = false }) {
  return (
    <div className={`map-title-container${dark ? " dark" : ""}`}>
      <motion.h2
        className="map-title-header text-header"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 18, mass: 1.2 }}
      >
        {title}
      </motion.h2>

      <motion.p
        className="map-title-subheader text-subheader"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        // Same spring, but starts a bit later so it follows the title
        transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.2 }}
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
