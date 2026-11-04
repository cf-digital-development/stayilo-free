import { portalFontStylesheets } from '@stayilo/design-system/portal-fonts';
import { getPortal } from '../api/portal.js';
import { __ } from '@stayilo/design-system/i18n';

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const PREVIEW_KEY = 'stayilo_portal_branding_preview';
const PREVIEW_PARAM = 'stayilo_preview';

const PORTAL_FONT_NAMES = [
	'DM Sans',
	'DM Serif Text',
	'Instrument Sans',
	'Roboto',
	'Epilogue',
	'Gloock',
];

const SERIF_FONTS = [ 'DM Serif Text', 'Gloock' ];

export function readPreviewBranding() {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	const params = new URLSearchParams( window.location.search );
	let previewTab = false;

	try {
		if ( params.get( PREVIEW_PARAM ) === '1' ) {
			window.sessionStorage.setItem( 'stayilo_preview_active', '1' );
			previewTab = true;
		} else {
			previewTab = window.sessionStorage.getItem( 'stayilo_preview_active' ) === '1';
		}
	} catch {
		previewTab = params.get( PREVIEW_PARAM ) === '1';
	}

	if ( ! previewTab ) {
		return null;
	}

	try {
		const raw = window.localStorage.getItem( PREVIEW_KEY );
		if ( ! raw ) {
			return null;
		}
		const draft = JSON.parse( raw );
		return draft && typeof draft === 'object' ? draft : null;
	} catch {
		return null;
	}
}

export function ensurePreviewFont( font ) {
	if ( typeof document === 'undefined' || ! font || font === 'inherit' ) {
		return;
	}

	const href = portalFontStylesheets()[ font ];
	if ( ! href ) {
		return;
	}

	let link = document.getElementById( 'stayilo-preview-font' );
	if ( ! link ) {
		link = document.createElement( 'link' );
		link.id = 'stayilo-preview-font';
		link.rel = 'stylesheet';
		document.head.appendChild( link );
	}
	link.href = href;
}

function contrastColor( hex ) {
	const value = hex.replace( '#', '' );
	const full =
		value.length === 3
			? value[ 0 ] + value[ 0 ] + value[ 1 ] + value[ 1 ] + value[ 2 ] + value[ 2 ]
			: value;
	const r = parseInt( full.slice( 0, 2 ), 16 );
	const g = parseInt( full.slice( 2, 4 ), 16 );
	const b = parseInt( full.slice( 4, 6 ), 16 );
	const lum = ( 0.299 * r + 0.587 * g + 0.114 * b ) / 255;
	return lum > 0.55 ? '#101010' : '#FFFFFF';
}

function fontStack( font ) {
	if ( ! font || font === 'inherit' || font === 'Inherit from theme' ) {
		return 'inherit';
	}
	const chosen = PORTAL_FONT_NAMES.includes( font ) ? font : 'DM Sans';
	const fallback = SERIF_FONTS.includes( chosen ) ? 'Georgia, serif' : 'sans-serif';
	return `"${ chosen }", ${ fallback }`;
}

export const SURFACE_COLOR_DEFAULTS = {
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

export const TEMPLATE_COLOR_DEFAULTS = {
	classic: {
		brandColor: '#FFFFFF',
		accentColor: '#E33B12',
		buttonColor: '#007943',
		...SURFACE_COLOR_DEFAULTS.classic,
	},
};

const PORTAL_ICON_IDS = [ 'logo', 'bell', 'truck', 'cart', 'card', 'subscription', 'emptyBox' ];

function pickHex( value, fallback ) {
	return HEX.test( value || '' ) ? value : fallback;
}

function pickColor( value, fallback ) {
	if ( typeof value === 'string' && /^rgba?\(/i.test( value.trim() ) ) {
		return value.trim();
	}
	return pickHex( value, fallback );
}

export function readTemplateColors( branding = {} ) {
	const map = {
		classic: { ...TEMPLATE_COLOR_DEFAULTS.classic },
	};
	const saved = branding.colors && typeof branding.colors === 'object' ? branding.colors : null;

	if ( saved ) {
		[ 'classic' ].forEach( ( id ) => {
			const row = saved[ id ];
			if ( ! row || typeof row !== 'object' ) {
				return;
			}
			map[ id ] = {
				brandColor: pickHex( row.brandColor, map[ id ].brandColor ),
				accentColor: pickHex( row.accentColor, map[ id ].accentColor ),
				buttonColor: pickHex( row.buttonColor, map[ id ].buttonColor ),
			};
			Object.keys( SURFACE_COLOR_DEFAULTS[ id ] ).forEach( ( key ) => {
				map[ id ][ key ] = pickColor( row[ key ], SURFACE_COLOR_DEFAULTS[ id ][ key ] );
			} );
			if ( ! row.primaryColor && row.accentColor ) {
				map[ id ].primaryColor = pickHex( row.accentColor, map[ id ].primaryColor );
			}
		} );
		return map;
	}

	if ( HEX.test( branding.brandColor || '' ) || HEX.test( branding.accentColor || '' ) ) {
		map.classic = {
			...map.classic,
			brandColor: pickHex( branding.brandColor, map.classic.brandColor ),
			accentColor: pickHex( branding.accentColor, map.classic.accentColor ),
			buttonColor: pickHex( branding.buttonColor, map.classic.buttonColor ),
		};
	}

	return map;
}

export function colorsForTemplate( branding = {}, templateId = 'classic' ) {
	const map = readTemplateColors( branding );
	return map[ templateId ] || map.classic;
}

export function readPortalBranding( source ) {
	const portal = source || getPortal();
	const saved = portal.branding || {};
	const preview = readPreviewBranding();
	return preview ? { ...saved, ...preview } : saved;
}

function sameHex( value, fallback ) {
	return String( value || '' ).toUpperCase() === String( fallback || '' ).toUpperCase();
}

export function brandingStyle( branding = {}, templateId ) {
	const style = {};
	const defaults =
		TEMPLATE_COLOR_DEFAULTS[ templateId ] || TEMPLATE_COLOR_DEFAULTS.classic;
	const colors = colorsForTemplate( branding, templateId );

	const surfaces = SURFACE_COLOR_DEFAULTS[ templateId ] || SURFACE_COLOR_DEFAULTS.classic;
	const primary = pickHex( colors.primaryColor, surfaces.primaryColor );
	// Primary is the nav accent. Banner washes use --stayilo-banner-bg instead.
	style[ '--stayilo-primary' ] = primary;
	style[ '--stayilo-primary-contrast' ] = contrastColor( primary );

	if (
		HEX.test( colors.accentColor || '' ) &&
		! sameHex( colors.accentColor, defaults.accentColor )
	) {
		style[ '--stayilo-accent' ] = colors.accentColor;
		style[ '--stayilo-accent-contrast' ] = contrastColor( colors.accentColor );
	}

	if (
		HEX.test( colors.buttonColor || '' ) &&
		! sameHex( colors.buttonColor, defaults.buttonColor ) &&
		! ( templateId === 'classic' && sameHex( colors.buttonColor, '#101010' ) )
	) {
		style[ '--stayilo-button' ] = colors.buttonColor;
		style[ '--stayilo-button-contrast' ] = contrastColor( colors.buttonColor );
	}

	if ( branding.font ) {
		style[ '--stayilo-font' ] = fontStack( branding.font );
		style.fontFamily = fontStack( branding.font );
	}

	style[ '--stayilo-background' ] = pickHex( colors.backgroundColor, surfaces.backgroundColor );
	style[ '--stayilo-page' ] = style[ '--stayilo-background' ];
	style[ '--stayilo-secondary' ] = pickHex( colors.secondaryColor, surfaces.secondaryColor );
	style[ '--stayilo-card-bg' ] = pickHex( colors.cardColor, surfaces.cardColor );
	style[ '--stayilo-card-accent-bg' ] = pickHex( colors.cardAccentColor, surfaces.cardAccentColor );
	style[ '--stayilo-banner-bg' ] = pickColor( colors.bannerBackground, surfaces.bannerBackground );
	style[ '--stayilo-input-bg' ] = pickHex( colors.inputColor, surfaces.inputColor );

	// Uploaded assets only. Empty values keep the built-in SVG.
	const iconVars = {
		logo: '--stayilo-icon-logo',
		search: '--stayilo-icon-search',
		bell: '--stayilo-icon-bell',
		truck: '--stayilo-icon-truck',
		cart: '--stayilo-icon-cart',
		card: '--stayilo-icon-card',
		subscription: '--stayilo-icon-subscription',
		emptyBox: '--stayilo-icon-empty-box',
	};
	Object.keys( iconVars ).forEach( ( name ) => {
		const url = portalIconUrl( name, templateId, branding );
		if ( url ) {
			style[ iconVars[ name ] ] = `url("${ url }")`;
		}
	} );

	return style;
}

/** Uploaded icon for this template, or empty when the built-in asset should show. */
export function portalIconUrl( name, templateId, branding ) {
	if ( ! PORTAL_ICON_IDS.includes( name ) ) {
		return '';
	}
	const source = branding || readPortalBranding();
	const icons = source?.icons;
	if ( ! icons || typeof icons !== 'object' ) {
		return name === 'logo' ? source?.logoUrl || '' : '';
	}
	const row = icons[ templateId ];
	const fromRow = row && typeof row === 'object' ? row[ name ] : '';
	const fromFlat = typeof icons[ name ] === 'string' ? icons[ name ] : '';
	const url = ( typeof fromRow === 'string' && fromRow ) || ( templateId === 'classic' ? fromFlat : '' );
	if ( typeof url === 'string' && url && ! url.startsWith( 'blob:' ) ) {
		return url;
	}
	return name === 'logo' ? source?.logoUrl || '' : '';
}
