import { portalIconUrl } from '../utils/branding.js';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';

/** Template icon upload. Falls back to the built-in graphic when none is set. */
export function BrandedIcon( { name, width, height, className, children } ) {
	const { id } = useTemplateRecipe();
	const url = portalIconUrl( name, id );

	if ( ! url ) {
		return children;
	}

	return (
		<img
			src={ url }
			alt=""
			width={ width }
			height={ height }
			className={ className }
		/>
	);
}
