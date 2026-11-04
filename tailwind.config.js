/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./packages/**/*.{js,jsx,ts,tsx,html,css}',
	],
	theme: {
		extend: {
			colors: {
				stayilo: {
					ink: '#0D1117',
					sidebar: '#111827',
					muted: '#474C57',
					border: '#E5E7EB',
					surface: '#F8FAFC',
					'surface-soft': '#F7F8FA',
					chip: '#F0F1F5',
					accent: '#16A34A',
					'accent-soft': '#16A34A1A',
					core: '#2B7FFF',
					'core-soft': '#2B7FFF33',
					growth: '#C27AFF',
					'growth-soft': '#AD46FF33',
					'ink-alpha': '#0D111714',
					'ink-alpha-strong': '#0D11171A',
					'ink-alpha-soft': '#0D11170A',
					'ink-alpha-muted': '#0D11170D',
					'ink-alpha-selected': '#0D111708',
				},
				portal: {
					ink: '#101010',
					lime: '#C4F07A',
					'lime-nav': '#BCEF6A',
					delivery: '#EFEADA',
					green: '#0A703E',
					cream: '#F7F4EE',
					warm: '#FAF8F2',
					muted: '#A8A8A8',
					danger: '#EC6E47',
					'danger-soft': '#FEF2F2',
				},
			},
			fontFamily: {
				sans: [ 'DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif' ],
				inter: [ 'DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif' ],
				'inter-display': [ 'DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif' ],
				mono: [ 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace' ],
			},
			boxShadow: {
				'stayilo-xs': '0px 1px 2px -1px #0000001A',
				'stayilo-sm': '0px 2px 4px -2px #0000001A',
			},
		},
	},
	plugins: [],
};
