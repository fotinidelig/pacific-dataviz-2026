import { useSpring, animated } from "react-spring";
import { CursorLabel } from "./CursorLabel.jsx";

const LABEL_FONT_SIZE = 14;

/**
 * Shared SVG cursor used across charts.
 * Renders an animated vertical line + optional dot and value label at (x, y).
 */
export const Cursor = ({
  x,
  y,
  height,
  color = "#737270",
  circle = true,
  label,
  countryColors,
}) => {
  if (x == null || y == null) return null;

  const springProps = useSpring({
    to: { x, y },
  });

  return (
    <>
      <animated.line
        x1={springProps.x}
        x2={springProps.x}
        y1={0}
        y2={height}
        stroke={color}
        strokeWidth={1}
        pointerEvents="none"
      />
      {circle && (
        <circle cx={x} cy={y} r={5} fill={color} pointerEvents="none" />
      )}
      {label ? (
        <CursorLabel
          x={x + 10}
          y={y - 10}
          label={label}
          countryColors={countryColors}
          fontSize={LABEL_FONT_SIZE}
        />
      ) : null}
    </>
  );
};

export default Cursor;
