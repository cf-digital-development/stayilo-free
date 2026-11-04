import { getStayiloRegistry } from '@stayilo/extension-sdk';
import { TopNav } from './TopNav.jsx';

/**
 * Chrome switch. Looks up `chrome:<id>` in the registry, then falls back to
 * Classic TopNav.
 *
 * @param {object} props
 * @param {{ chrome?: string }} [props.recipe]
 */
export function Chrome( { recipe, ...chromeProps } ) {
	const chromeKey = recipe?.chrome || 'topnav';
	const ChromeComp =
		getStayiloRegistry().getPortalTemplate?.( `chrome:${ chromeKey }` ) ||
		TopNav;
	return <ChromeComp { ...chromeProps } />;
}
