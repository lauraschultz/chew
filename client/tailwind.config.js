module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: [],
  theme: {
    fontFamily: {
      'display': 'Vollkorn',
      'body': 'Lato'
    },
    extend: {
      colors: {
        "theme-red" : "#f95738",
        "theme-orange" : "#ee964b",
        "theme-yellow" : "#f4d35e",
        "theme-light" : "#f1eee4",
        "theme-navy" : "#0d3b66",
      },
      width: {
        "min-content": "min-content",
        "max-content": "max-content",
      },
    },
  },
  variants: {},
  plugins: [],
}
