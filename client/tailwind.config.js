const colors = require("tailwindcss/colors");
module.exports = {
	future: {
		// removeDeprecatedGapUtilities: true,
		// purgeLayersByDefault: true,
	},
	purge: {
		enabled: process.env.NODE_ENV === "production",
		content: ["./src/**/*.tsx"],
	},
	theme: {
		fontFamily: {
			display: "Vollkorn",
			body: "Lato",
		},
		colors: {
			red: {
				DEFAULT: "#E8505B",
				dark: "#C6535B",
			},
			yellow: {
				DEFAULT: "#F9D56E",
				dark: "#F0C038",
			},
			red: {
				DEFAULT: "#E8505B",
				dark: "#C6535B",
			},
			gray: colors.warmGray,
			blue: {
				DEFAULT: "#14B1AB",
				light1: "#45BDB8",
				light2: "#77C9C6",
				light3: "#A9D6D4",
			},
			blueGray: {
				DEFAULT: "#88B8B6",
				light: "#B4CBCA",
			},
			white: colors.white,
		},
		extend: {
			spacing: {
				xs: ".08rem",
				"-screen": "-100vw",
			},
			transitionProperty: {
				spacing: "margin",
				height: "height",
			},
			// colors: {
			// 	"theme-red": "#E8505B",
			// 	"theme-dark-red": "#C6535B",
			// 	"theme-yellow": "#F9D56E",
			// 	"theme-dark-yellow": "#F0C038",
			// 	"theme-blue": "#14B1AB",
			// 	"theme-light": "#F3EFDA",
			// 	"theme-dark-gray": "#2C2921",
			// 	"theme-med-gray": "#625D50",
			// 	"theme-light-gray": "#878378",
			// 	"theme-extra-light-gray": "#CCC5B3",
			// 	"theme-blue-l-1": "#45BDB8",
			// 	"theme-blue-l-2": "#77C9C6",
			// 	"theme-blue-l-3": "#A9D6D4",
			// },
			width: {
				"min-content": "min-content",
				"max-content": "max-content",
			},
		},
	},
	variants: {
		margin: ["responsive", "hover", "group-hover"],
		borderColor: ["focus", "focus-within", "hover"],
	},
	plugins: [require("postcss-focus-visible"), require("@tailwindcss/forms")],
};
