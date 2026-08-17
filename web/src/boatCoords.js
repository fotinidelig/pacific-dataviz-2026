/** Fleet sector center angle (degrees) by country. Only the sector mid-angle is fixed. */
const BOAT_ANGLE_DEG = {
  PG: 135,
  MP: -35,
  GU: -130,
  PW: 90,
  FM: -135,
  MH: -30,
  NR: -170,
  KI: -90,
  TK: -110,
  TV: -80,
  WS: -170,
  AS: -20,
  PF: 30,
  PN: 130,
  CK: -100,
  TO: 70,
  FJ: 100,
  NC: -160,
  VU: 60,
  SB: -20,
  WF: -150,
  NU: 0,
};

export function boatCoords({ x, y, r1, r2, num_boats, maxBoats, refArea }) {
  if (num_boats < 1) return [];

  const angleDeg = BOAT_ANGLE_DEG[refArea] ?? 0;
  const centerAngle = (angleDeg * Math.PI) / 180;

  const maxRange = Math.PI;
  const minRange = (2 * Math.PI) / 5;
  const currRange = ((maxRange - minRange) * num_boats) / maxBoats;
  const angleRange = [centerAngle - currRange / 2, centerAngle + currRange / 2];

  const coords = [];
  // One arc radius between land and EEZ; boats spaced evenly across the angle range.
  const r = r1 + (r2 * 0.6 - r1);
  for (let i = 0; i < num_boats; i++) {
    const t = num_boats === 1 ? 0.5 : i / (num_boats - 1);
    const angle = angleRange[0] + (angleRange[1] - angleRange[0]) * t;
    coords.push({
      x: x + r * Math.cos(angle),
      y: y + r * Math.sin(angle),
      rotation: (angle * 180) / Math.PI,
    });
  }
  return coords;
}
