import { __ } from '@stayilo/design-system/i18n';
/** Fallback stats when a card has no meal meta. */
const DEFAULT_CARD_STATS = [
	{ icon: 'timer', label: __( '20 min', 'stayilo' ) },
	{ icon: 'flame', label: __( '680 cal', 'stayilo' ) },
	{ icon: 'protein', label: __( '18g protein', 'stayilo' ) },
];

/** Default meal cards for the Your Order slider. */
export const DEFAULT_ORDER_CARDS = [
	{
		id: 'pesto-cavatappi',
		title: __( 'Pesto & Walnut Panko Cavatappi', 'stayilo' ),
		description: __( 'with Zucchini and Parmesan', 'stayilo' ),
		imageUrl:
			'',
		imageAlt: __( 'Pesto and walnut panko cavatappi', 'stayilo' ),
		stats: DEFAULT_CARD_STATS,
		boxStatus: __( '1 in your subscription', 'stayilo' ),
	},
	{
		id: 'thai-coconut',
		title: __( 'Thai Coconut Curry Chicken', 'stayilo' ),
		description: __( 'with Jasmine Rice and Broccoli', 'stayilo' ),
		imageUrl:
			'',
		imageAlt: __( 'Thai coconut curry chicken', 'stayilo' ),
		stats: [
			{ icon: 'timer', label: __( '30 min', 'stayilo' ) },
			{ icon: 'flame', label: __( '720 cal', 'stayilo' ) },
			{ icon: 'protein', label: __( '34g protein', 'stayilo' ) },
		],
		boxStatus: __( '1 in your subscription', 'stayilo' ),
	},
	{
		id: 'steak-fries',
		title: __( 'Seared Steak & Herb Butter', 'stayilo' ),
		description: __( 'with Crispy Potatoes and Green Beans', 'stayilo' ),
		imageUrl:
			'',
		imageAlt: __( 'Seared steak with herb butter', 'stayilo' ),
		stats: [
			{ icon: 'timer', label: __( '35 min', 'stayilo' ) },
			{ icon: 'flame', label: __( '810 cal', 'stayilo' ) },
			{ icon: 'protein', label: __( '42g protein', 'stayilo' ) },
		],
		boxStatus: __( '1 in your subscription', 'stayilo' ),
	},
	{
		id: 'salmon-bowl',
		title: __( 'Miso Glazed Salmon Bowl', 'stayilo' ),
		description: __( 'with Sesame Greens and Rice', 'stayilo' ),
		imageUrl:
			'',
		imageAlt: __( 'Miso glazed salmon bowl', 'stayilo' ),
		stats: [
			{ icon: 'timer', label: __( '25 min', 'stayilo' ) },
			{ icon: 'flame', label: __( '640 cal', 'stayilo' ) },
			{ icon: 'protein', label: __( '38g protein', 'stayilo' ) },
		],
		boxStatus: __( '1 in your subscription', 'stayilo' ),
	},
	{
		id: 'mushroom-risotto',
		title: __( 'Creamy Mushroom Risotto', 'stayilo' ),
		description: __( 'with Truffle Oil and Chives', 'stayilo' ),
		imageUrl:
			'',
		imageAlt: __( 'Creamy mushroom risotto', 'stayilo' ),
		stats: [
			{ icon: 'timer', label: __( '40 min', 'stayilo' ) },
			{ icon: 'flame', label: __( '590 cal', 'stayilo' ) },
			{ icon: 'protein', label: __( '16g protein', 'stayilo' ) },
		],
		boxStatus: __( '1 in your subscription', 'stayilo' ),
	},
];
