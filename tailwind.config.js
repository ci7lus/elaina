module.exports = {
  purge: {
    enabled: process.env.NODE_ENV === "production",
    mode: "all",
    content: ["./src/**/*.html", "./src/**/*.ts", "./src/**/*.tsx"],
    whitelist: ["body", "html", "svg"],
    whitelistPatterns: [],
  },
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  darkMode: "media",
}
