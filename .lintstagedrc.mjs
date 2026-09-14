export default {
  "*.{ts,tsx,js,jsx,css,json,md}": () => "prettier --write .",
  "src/**/*.{ts,tsx}": () => "node scripts/check-tokens.mjs",
};
