import {
	DEFAULT_MEAL_IMAGE,
	resolveMediaUrl,
} from '../utils/mediaPlaceholders.js';

/**
 * Vertical product summary card — image, title, servings, quantity, price.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.servings]
 * @param {number|string} [props.quantity]
 * @param {string} [props.price]
 * @param {string} [props.imageUrl]
 * @param {string} [props.imageAlt]
 * @param {string} [props.bodyClassName]
 * @param {import('react').ReactNode} [props.footer]
 * @param {string} [props.className]
 */
export function ProductSummaryCard( {
	title,
	servings,
	quantity,
	price,
	imageUrl,
	imageAlt = '',
	bodyClassName = 'p-4',
	footer,
	className = '',
} ) {
	const displayImageUrl = resolveMediaUrl( imageUrl, DEFAULT_MEAL_IMAGE );

	return (
		<article
			className={ [
				'portal-product-summary',
				className,
			].filter( Boolean ).join( ' ' ) }
		>
			<div className="portal-product-summary-media">
				<img
					src={ displayImageUrl }
					alt={ imageAlt || title }
					className="h-full w-full object-cover"
				/>
			</div>

			<div className={ bodyClassName }>
				<h3 className="m-0 text-base font-semibold leading-[100%] sm:text-lg sm:leading-[26px]">
					{ title }
				</h3>
				{ servings ? (
					<p className="mt-1.5 m-0 text-base leading-6 text-[#101010] opacity-80">
						{ servings }
					</p>
				) : null }
				{ quantity != null && quantity !== '' ? (
					<p className="mt-1.5 m-0 text-base font-medium leading-6 text-[#101010] opacity-80">
						Quantity : { quantity }
					</p>
				) : null }
				{ price ? (
					<p className="mt-1.5 m-0 text-base font-bold leading-6">
						{ price }
					</p>
				) : null }
				{ footer }
			</div>
		</article>
	);
}
