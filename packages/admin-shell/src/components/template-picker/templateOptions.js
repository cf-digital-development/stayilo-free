export const PORTAL_TEMPLATE_OPTIONS = [
	{
		value: 'classic',
		title: 'Classic',
		description:
			'Structured layout with clear hierarchy. Full-width actions, easy to scan.',
	},
	{
		value: 'minimal',
		title: 'Minimal',
		description:
			'Clean, lightweight. Fewer elements, more whitespace — great for premium brands.',
	},
	{
		value: 'split',
		title: 'Split',
		description:
			'Two-pane view for managing several subscriptions. List on the left, actions on the right.',
	},
	{
		value: 'card',
		title: 'Card',
		description:
			'Visual grid built for strong product photography. Each subscription shown as its own card.',
	},
	{
		value: 'compact',
		title: 'Compact',
		description: 'Everything on one scrolling page. No sidebar or top-nav frame.',
	},
	{
		value: 'focus',
		title: 'Focus',
		description:
			'One step at a time, guided and calm. Built for simple subscriptions, not dashboards.',
	},
];

export function getTemplateDemoUrl( template ) {
	const admin = typeof window !== 'undefined' ? window.stayiloAdmin || {} : {};
	return (
		admin.templateDemoUrls?.[ template ] ||
		`https://stayilo.com/demo/${ template }`
	);
}
