module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: [],
  theme: {
    fontFamily: {
      display: "Vollkorn",
      body: "Lato",
    },
    extend: {
      transitionProperty: {
        spacing: "margin",
        height: "height",
      },
      colors: {
        "theme-red": "#E8505B",
        "theme-dark-red": "#C6535B",
        "theme-yellow": "#F9D56E",
        "theme-dark-yellow": "#F0C038",
        "theme-blue": "#14B1AB",
        "theme-light": "#F3EFDA",
        "theme-dark-gray": "#2C2921",
        "theme-med-gray": "#625D50",
        "theme-light-gray": "#878378",
        "theme-extra-light-gray": "#CCC5B3",
        "theme-blue-l-1": "#45BDB8",
        "theme-blue-l-2": "#77C9C6",
        "theme-blue-l-3": "#A9D6D4",
      },
      width: {
        "min-content": "min-content",
        "max-content": "max-content",
      },
    },
  },
  variants: {
    margin: ["responsive", "hover", "group-hover"],
    borderColor: ['focus', 'focus-within'],
  },
  plugins: [],
};
