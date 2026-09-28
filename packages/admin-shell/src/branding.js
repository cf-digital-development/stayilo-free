export const PORTAL_FONTS = [
	'DM Sans',
	'DM Serif Text',
	'Instrument Sans',
	'Roboto',
	'Epilogue',
	'Gloock',
];

/** Serif families. Everything else in the list is a sans. */
const PORTAL_SERIF_FONTS = [ 'DM Serif Text', 'Gloock' ];

export const PORTAL_FONT_SELECT = [
	'Inherit from theme',
	...PORTAL_FONTS,
];

export const DEFAULT_PORTAL_BRANDING = {
	brandName: '',
	logoUrl: '',
	brandColor: '#FFFFFF',
	accentColor: '#BCEF6A',
	buttonColor: '#101010',
	font: 'DM Sans',
	bannerEnabled: false,
	bannerText: '',
	bannerColor: '#0D1117',
	bannerLink: '',
	template: 'minimal',
	colors: {
		minimal: {
			brandColor: '#FFFFFF',
			accentColor: '#BCEF6A',
			buttonColor: '#101010',
		},
		classic: {
			brandColor: '#FFFFFF',
			accentColor: '#E33B12',
			buttonColor: '#007943',
		},
	},
};

export const TEMPLATE_COLOR_DEFAULTS = DEFAULT_PORTAL_BRANDING.colors;

/** Per-template surfaces. Button tint is derived in CSS, not stored. */
export const SURFACE_COLOR_DEFAULTS = {
	minimal: {
		primaryColor: '#BCEF6A',
		backgroundColor: '#FAF8F2',
		secondaryColor: '#101010',
		cardColor: '#FFFFFF',
		cardAccentColor: '#FFFFFF',
		bannerBackground: '#007943',
		inputColor: '#FFFFFF',
	},
	classic: {
		primaryColor: '#E33B12',
		backgroundColor: '#FEEFDE',
		secondaryColor: '#002515',
		cardColor: '#FFFFFF',
		cardAccentColor: '#FBF4EA',
		bannerBackground: 'rgba(255,255,255,0.5)',
		inputColor: '#F8F5F0',
	},
};

export const SURFACE_COLOR_ROWS = [
	{
		key: 'primaryColor',
		label: 'Primary color',
		hint: 'Classic nav text and underline. Minimal nav background.',
	},
	{
		key: 'buttonColor',
		label: 'Button color',
		hint: 'Primary CTA background. Selected states use a 10% tint of this.',
	},
	{
		key: 'backgroundColor',
		label: 'Background color',
		hint: 'Full-page background',
	},
	{
		key: 'secondaryColor',
		label: 'Secondary color',
		hint: 'Outline and secondary button border and text',
	},
	{
		key: 'cardColor',
		label: 'Card background',
		hint: 'Subscription card container',
	},
	{
		key: 'cardAccentColor',
		label: 'Card accent background',
		hint: 'Inset info box inside a card, such as Next delivery',
	},
	{
		key: 'bannerBackground',
		label: 'Banner background',
		hint: 'Overlay on the top welcome banner',
	},
	{
		key: 'inputColor',
		label: 'Input field background',
		hint: 'Text fields, including the cancellation reason box',
	},
];

export const PORTAL_ICON_FIELDS = [
	{ id: 'logo', label: 'Logo', file: 'Logo.svg' },
	{ id: 'bell', label: 'Notifications icon', file: 'Bell.svg' },
	{ id: 'truck', label: 'Delivery icon', file: 'Truck.svg' },
	{ id: 'cart', label: 'Cart icon', file: 'ShoppingCartSimple.svg' },
	{ id: 'card', label: 'Payment method icon', file: 'CreditCard.svg' },
	{ id: 'subscription', label: 'Subscription management image', file: 'subscription-management.png' },
	{ id: 'emptyBox', label: 'Empty box image', file: 'empty-cart.png' },
];

function emptyIconRow() {
	return PORTAL_ICON_FIELDS.reduce( ( row, field ) => {
		row[ field.id ] = '';
		return row;
	}, {} );
}

export function emptyPortalIcons() {
	return {
		minimal: emptyIconRow(),
		classic: emptyIconRow(),
	};
}

function iconUrl( value ) {
	return typeof value === 'string' && value && ! value.startsWith( 'blob:' ) ? value : '';
}

export function readPortalIcons( icons ) {
	const next = emptyPortalIcons();
	if ( ! icons || typeof icons !== 'object' ) {
		return next;
	}

	// Older saves stored one flat icon map. Keep those on Classic.
	const flat = emptyIconRow();
	let hasFlat = false;
	PORTAL_ICON_FIELDS.forEach( ( field ) => {
		if ( typeof icons[ field.id ] === 'string' ) {
			flat[ field.id ] = iconUrl( icons[ field.id ] );
			hasFlat = true;
		}
	} );

	[ 'minimal', 'classic' ].forEach( ( id ) => {
		const row = icons[ id ];
		if ( ! row || typeof row !== 'object' ) {
			if ( id === 'classic' && hasFlat ) {
				next.classic = flat;
			}
			return;
		}
		PORTAL_ICON_FIELDS.forEach( ( field ) => {
			next[ id ][ field.id ] = iconUrl( row[ field.id ] );
		} );
	} );

	return next;
}

/** Built-in colours for the Global colour rows of one template. */
export function templateColorDefaults( templateId = 'classic' ) {
	const id = SURFACE_COLOR_DEFAULTS[ templateId ] ? templateId : 'classic';
	const brand = TEMPLATE_COLOR_DEFAULTS[ id ] || TEMPLATE_COLOR_DEFAULTS.classic;
	return {
		...SURFACE_COLOR_DEFAULTS[ id ],
		buttonColor: brand.buttonColor,
	};
}

export function surfaceColorsFrom( source = {}, templateId = 'classic' ) {
	const defaults = SURFACE_COLOR_DEFAULTS[ templateId ] || SURFACE_COLOR_DEFAULTS.classic;
	const colors = {};
	Object.keys( defaults ).forEach( ( key ) => {
		colors[ key ] = normalizeColor( source[ key ], defaults[ key ] );
	} );
	return colors;
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeHex( value, fallback = '#000000' ) {
	if ( typeof value !== 'string' ) {
		return fallback;
	}

	const raw = value.trim();
	if ( ! HEX.test( raw ) ) {
		return fallback;
	}

	if ( raw.length === 4 ) {
		return (
			'#' +
			raw[ 1 ] +
			raw[ 1 ] +
			raw[ 2 ] +
			raw[ 2 ] +
			raw[ 3 ] +
			raw[ 3 ]
		).toUpperCase();
	}

	return raw.toUpperCase();
}

/** Hex, or rgba()/rgb() for the banner overlay. */
export function normalizeColor( value, fallback = '#000000' ) {
	if ( typeof value !== 'string' ) {
		return fallback;
	}

	const raw = value.trim();
	const rgba = raw.match(
		/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(0|1|0?\.\d+)\s*)?\)$/i
	);
	if ( rgba ) {
		const channels = [ rgba[ 1 ], rgba[ 2 ], rgba[ 3 ] ].map( ( part ) =>
			Math.min( 255, Number( part ) )
		);
		if ( rgba[ 4 ] === undefined ) {
			return `rgb(${ channels.join( ',' ) })`;
		}
		return `rgba(${ channels.join( ',' ) },${ rgba[ 4 ] })`;
	}

	return normalizeHex( raw, String( fallback ).startsWith( '#' ) ? fallback : fallback );
}

export function contrastColor( hex ) {
	const value = normalizeHex( hex, '#FFFFFF' ).slice( 1 );
	const r = parseInt( value.slice( 0, 2 ), 16 );
	const g = parseInt( value.slice( 2, 4 ), 16 );
	const b = parseInt( value.slice( 4, 6 ), 16 );
	const lum = ( 0.299 * r + 0.587 * g + 0.114 * b ) / 255;
	return lum > 0.55 ? '#101010' : '#FFFFFF';
}

export function fontStack( font ) {
	if ( ! font || font === 'inherit' || font === 'Inherit from theme' ) {
		return 'inherit';
	}

	const chosen = PORTAL_FONTS.includes( font ) ? font : 'DM Sans';
	const fallback = PORTAL_SERIF_FONTS.includes( chosen ) ? 'Georgia, serif' : 'sans-serif';
	return `"${ chosen }", ${ fallback }`;
}

export function readTemplateColors( branding = {} ) {
	const map = {
		minimal: { ...TEMPLATE_COLOR_DEFAULTS.minimal },
		classic: { ...TEMPLATE_COLOR_DEFAULTS.classic },
	};
	const saved = branding.colors && typeof branding.colors === 'object' ? branding.colors : null;

	if ( saved ) {
		[ 'minimal', 'classic' ].forEach( ( id ) => {
			const row = saved[ id ];
			if ( ! row || typeof row !== 'object' ) {
				return;
			}
			map[ id ] = {
				brandColor: normalizeHex( row.brandColor, map[ id ].brandColor ),
				accentColor: normalizeHex( row.accentColor, map[ id ].accentColor ),
				buttonColor: normalizeHex( row.buttonColor, map[ id ].buttonColor ),
				...surfaceColorsFrom( { ...SURFACE_COLOR_DEFAULTS[ id ], ...row }, id ),
			};
			// Nav accent used to live on accentColor before primaryColor existed.
			if ( ! row.primaryColor && row.accentColor ) {
				map[ id ].primaryColor = normalizeHex( row.accentColor, map[ id ].primaryColor );
			}
		} );
		return map;
	}

	if ( branding.brandColor || branding.accentColor || branding.buttonColor ) {
		map.minimal = {
			brandColor: normalizeHex( branding.brandColor, map.minimal.brandColor ),
			accentColor: normalizeHex( branding.accentColor, map.minimal.accentColor ),
			buttonColor: normalizeHex( branding.buttonColor, map.minimal.buttonColor ),
		};
	}

	return map;
}

export function colorsForTemplate( branding = {}, templateId = 'minimal' ) {
	const map = readTemplateColors( branding );
	return map[ templateId ] && TEMPLATE_COLOR_DEFAULTS[ templateId ]
		? map[ templateId ]
		: map.minimal;
}

export function brandingCssVars( branding = {}, templateId ) {
	const id = templateId || branding.template || 'minimal';
	const fromMap = colorsForTemplate( branding, id );
	const isEditing = ! branding.template || id === branding.template;
	const brandColor = normalizeHex(
		isEditing ? branding.brandColor || fromMap.brandColor : fromMap.brandColor,
		fromMap.brandColor
	);
	const accentColor = normalizeHex(
		isEditing ? branding.accentColor || fromMap.accentColor : fromMap.accentColor,
		fromMap.accentColor
	);
	const buttonColor = normalizeHex(
		isEditing ? branding.buttonColor || fromMap.buttonColor : fromMap.buttonColor,
		fromMap.buttonColor
	);

	const surfaces = surfaceColorsFrom( { ...fromMap, ...( isEditing ? branding : fromMap ) }, id );
	const primary = surfaces.primaryColor;

	const vars = {
		'--stayilo-primary': primary,
		'--stayilo-primary-contrast': contrastColor(
			String( primary ).startsWith( '#' ) ? primary : '#E33B12'
		),
		'--stayilo-accent': accentColor,
		'--stayilo-accent-contrast': contrastColor( accentColor ),
		'--stayilo-button': buttonColor,
		'--stayilo-button-contrast': contrastColor( buttonColor ),
		'--stayilo-background': surfaces.backgroundColor,
		'--stayilo-page': surfaces.backgroundColor,
		'--stayilo-secondary': surfaces.secondaryColor,
		'--stayilo-card-bg': surfaces.cardColor,
		'--stayilo-card-accent-bg': surfaces.cardAccentColor,
		'--stayilo-banner-bg': surfaces.bannerBackground,
		'--stayilo-input-bg': surfaces.inputColor,
		'--stayilo-font': fontStack( branding.font ),
		fontFamily: fontStack( branding.font ),
	};

	return vars;
}

export function readAdminBranding( admin = window.stayiloAdmin || {} ) {
	const saved = admin.branding || {};
	const colors = readTemplateColors( saved );
	const template =
		typeof saved.template === 'string' && saved.template
			? saved.template
			: 'classic';
	const active = colorsForTemplate( { colors }, template );

	return {
		...DEFAULT_PORTAL_BRANDING,
		brandName: admin.siteName || saved.brandName || '',
		logoUrl: saved.logoUrl || admin.siteLogoUrl || '',
		brandColor: active.brandColor,
		accentColor: active.accentColor,
		buttonColor: active.buttonColor,
		...surfaceColorsFrom( active, template ),
		icons: readPortalIcons( saved.icons ),
		colors,
		template,
		font:
			saved.font === 'inherit'
				? 'Inherit from theme'
				: PORTAL_FONTS.includes( saved.font )
					? saved.font
					: DEFAULT_PORTAL_BRANDING.font,
		bannerEnabled: Boolean( saved.bannerEnabled ),
		bannerText: typeof saved.bannerText === 'string' ? saved.bannerText : '',
		bannerColor: normalizeHex(
			saved.bannerColor,
			DEFAULT_PORTAL_BRANDING.bannerColor
		),
		bannerLink: typeof saved.bannerLink === 'string' ? saved.bannerLink : '',
	};
}

function definedSurfaceColors( branding = {} ) {
	const source = {};
	Object.keys( SURFACE_COLOR_DEFAULTS.minimal ).forEach( ( key ) => {
		if ( typeof branding[ key ] === 'string' && branding[ key ].trim() ) {
			source[ key ] = branding[ key ];
		}
	} );
	return source;
}

export function persistableBranding( branding = {}, templateId ) {
	const template =
		templateId ||
		( typeof branding.template === 'string' && branding.template
			? branding.template
			: DEFAULT_PORTAL_BRANDING.template );
	const colors = readTemplateColors( branding );
	const activeId = TEMPLATE_COLOR_DEFAULTS[ template ] ? template : 'minimal';
	// Preview stores this object and runs it through here again. Keep colours
	// already saved on the template row when the top-level fields are absent.
	const row = colors[ activeId ] || {};
	colors[ activeId ] = {
		brandColor: normalizeHex(
			branding.brandColor,
			row.brandColor
		),
		accentColor: normalizeHex(
			branding.accentColor,
			row.accentColor
		),
		buttonColor: normalizeHex(
			branding.buttonColor,
			row.buttonColor
		),
		...surfaceColorsFrom(
			{
				...row,
				...definedSurfaceColors( branding ),
			},
			activeId
		),
	};
	const active = colors[ activeId ];

	return {
		brandName: branding.brandName || '',
		logoUrl:
			typeof branding.logoUrl === 'string' &&
			! branding.logoUrl.startsWith( 'blob:' )
				? branding.logoUrl
				: '',
		brandColor: active.brandColor,
		accentColor: active.accentColor,
		buttonColor: active.buttonColor,
		colors,
		template: activeId,
		font:
			branding.font === 'Inherit from theme' ? 'inherit' : branding.font || 'DM Sans',
		bannerEnabled: Boolean( branding.bannerEnabled ),
		bannerText: typeof branding.bannerText === 'string' ? branding.bannerText : '',
		bannerColor: normalizeHex(
			branding.bannerColor,
			DEFAULT_PORTAL_BRANDING.bannerColor
		),
		bannerLink: typeof branding.bannerLink === 'string' ? branding.bannerLink : '',
		icons: readPortalIcons( branding.icons ),
	};
}

export const PORTAL_BRANDING_PREVIEW_KEY = 'stayilo_portal_branding_preview';
export const PORTAL_BRANDING_PREVIEW_PARAM = 'stayilo_preview';

export function writePortalBrandingPreview( branding = {} ) {
	if ( typeof window === 'undefined' ) {
		return;
	}

	try {
		window.localStorage.setItem(
			PORTAL_BRANDING_PREVIEW_KEY,
			JSON.stringify( persistableBranding( branding ) )
		);
	} catch {
		// Private mode / quota — Preview still opens the live portal.
	}
}

export function clearPortalBrandingPreview() {
	if ( typeof window === 'undefined' ) {
		return;
	}

	try {
		window.localStorage.removeItem( PORTAL_BRANDING_PREVIEW_KEY );
	} catch {
		// Ignore.
	}
}

export function portalPreviewUrl( portalUrl ) {
	if ( ! portalUrl || typeof window === 'undefined' ) {
		return portalUrl || '';
	}

	try {
		const url = new URL( portalUrl, window.location.origin );
		url.searchParams.set( PORTAL_BRANDING_PREVIEW_PARAM, '1' );
		return url.toString();
	} catch {
		const join = portalUrl.includes( '?' ) ? '&' : '?';
		return `${ portalUrl }${ join }${ PORTAL_BRANDING_PREVIEW_PARAM }=1`;
	}
}
