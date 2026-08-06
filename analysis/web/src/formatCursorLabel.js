const formatPopulation = (value) =>
  new Intl.NumberFormat("en").format(Math.round(value));

/** Single country — e.g. { country: "Fiji", rest: " in 2023: 924,145" } */
export const buildCursorLabelShort = (year, value, country) => ({
  country,
  rest: ` in ${year}: ${formatPopulation(value)}`,
});
