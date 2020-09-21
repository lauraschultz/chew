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
        "theme-red": "#E8505B",
        "theme-yellow": "#F9D56E",
        "theme-blue" : "#14B1AB",
        "theme-light" : "#F4F0D7",
        "theme-dark-gray": "#2C2921",
        "theme-med-gray" : "#625D50",
        "theme-light-gray": "#878378",
        "theme-blue-l-1": "#45BDB8",
        "theme-blue-l-2": "#77C9C6",
        "theme-blue-l-3": "#A9D6D4",
        // "theme-red" : "#f95738",
        // "theme-orange" : "#ee964b",
        // "theme-yellow" : "#f4d35e",
        // "theme-light" : "#f1eee4",
        // "theme-navy" : "#0d3b66",
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
