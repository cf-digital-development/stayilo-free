import { createContext, useContext } from 'react';
import {
	readPortalBranding,
	readPreviewBranding,
} from '../utils/branding.js';
import { getPortal } from '../api/portal.js';
import { getRecipe } from './recipes.js';

const TEMPLATE_PARAM = 'stayilo_template';

function merchantTier() {
	return String( getPortal().tier || 'free' ).toLowerCase();
}

export function readTemplateId() {
	const branding = readPortalBranding();
	const preview = readPreviewBranding();
	if ( typeof window !== 'undefined' ) {
		const fromUrl = new URLSearchParams( window.location.search ).get(
			TEMPLATE_PARAM
		);
		if ( fromUrl ) {
			return fromUrl;
		}
	}

	// Free merchants always use Classic — ignore sticky DOM / leftover branding.
	if ( merchantTier() === 'free' ) {
		return 'classic';
	}

	if ( typeof document !== 'undefined' ) {
		const fromDom = document
			.querySelector( '.portal-shell' )
			?.getAttribute( 'data-template' );
		if ( fromDom ) {
			return fromDom;
		}
	}
	if ( preview?.template ) {
		return preview.template;
	}
	if ( branding.template ) {
		return branding.template;
	}
	return 'classic';
}

const TemplateContext = createContext( getRecipe( 'classic' ) );

/**
 * Exposes the active portal recipe.
 *
 * @param {{ children: import('react').ReactNode }} props
 */
export function TemplateProvider( { children } ) {
	const recipe = getRecipe( readTemplateId() );

	return (
		<TemplateContext.Provider value={ recipe }>
			{ children }
		</TemplateContext.Provider>
	);
}

/**
 * @returns {{ id: string, chrome: string, home: string, card: string, view: string }}
 */
export function useTemplateRecipe() {
	const fromContext = useContext( TemplateContext );
	const liveId = readTemplateId();
	return liveId ? getRecipe( liveId ) : fromContext;
}
