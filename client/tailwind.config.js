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
				DEFAULT: "#A5C0BF",
				light: "#CFDCD6",
			},
			white: colors.white,
			green: colors.green,
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
