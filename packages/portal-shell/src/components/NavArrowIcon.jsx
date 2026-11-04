import { ReactComponent as NavArrowRightSvg } from '@stayilo/design-system/assets/svg/nav-arrow-right.svg';
import { BrandedIcon } from './BrandedIcon.jsx';

/**
 * Design-system nav-arrow-right with dynamic stroke via `currentColor` / text-* classes.
 *
 * `[&_path]:stroke-current` overrides any hardcoded stroke on the SVG path so
 * classes like `text-white` or `text-portal-danger` control the arrow color.
 *
 * @param {object} props
 * @param {number} [props.width=24]
 * @param {number} [props.height=24]
 * @param {string} [props.className] - Use text-* for stroke color.
 */
export function NavArrowIcon( {
	width = 24,
	height = 24,
	className = '',
	...props
} ) {
	return (
		<BrandedIcon name="caret" width={ width } height={ height } className={ className }>
			<NavArrowRightSvg
				width={ width }
				height={ height }
				className={ [
					'shrink-0 [&_path]:stroke-current',
					className,
				].filter( Boolean ).join( ' ' ) }
				aria-hidden="true"
				{ ...props }
			/>
		</BrandedIcon>
	);
}
