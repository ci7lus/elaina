module.exports = {
  purge: {
    // workaround for parcel bug
    enabled: process.env.IS_BUILD === "yes",
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
