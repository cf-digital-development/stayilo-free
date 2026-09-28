import { Sidebar } from './Sidebar.jsx';
import { TopNav } from './TopNav.jsx';

/**
 * Chrome switch. Unknown chrome ids fall back to TopNav (Minimal).
 *
 * @param {object} props
 * @param {{ chrome?: string }} [props.recipe]
 */
export function Chrome( { recipe, ...chromeProps } ) {
	if ( recipe?.chrome === 'sidebar' ) {
		return <Sidebar { ...chromeProps } />;
	}
	return <TopNav { ...chromeProps } />;
}
