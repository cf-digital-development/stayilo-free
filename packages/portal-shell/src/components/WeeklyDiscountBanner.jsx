import { ReactComponent as StarOffIcon } from '@stayilo/design-system/assets/svg/star-off.svg';

/**
 * Weekly discount strip — lime bar aligned with portal content.
 *
 * @param {object} props
 * @param {string} [props.prefix='Your discounts this week:']
 * @param {string} [props.highlight='Free item']
 * @param {string} [props.linkLabel='View All']
 * @param {boolean} [props.showViewAllLink=false] - When true (e.g. 2+ offers), show the link.
 * @param {() => void} [props.onViewAll]
 * @param {string} [props.stripBackgroundColor]
 * @param {import('react').ReactNode} [props.decoration]
 * @param {string} [props.className]
 */
export function WeeklyDiscountBanner( {
	prefix = 'Your discounts this week:',
	linkLabel = 'View All',
	showViewAllLink = false,
	onViewAll,
	stripBackgroundColor,
	className = '',
} ) {
	return (
		<section
			className={ [
				'portal-full-bleed pt-5',
				className,
			].filter( Boolean ).join( ' ' ) }
			aria-label={ prefix }
		>
			<div className="w-full px-6">
				<div className="flex w-full items-center justify-center">
					<div
						className={ [
							'portal-discount-strip',
							! stripBackgroundColor ? 'portal-accent-bg' : '',
						].filter( Boolean ).join( ' ' ) }
						style={ stripBackgroundColor ? { backgroundColor: stripBackgroundColor } : undefined }
					>
						<StarOffIcon
							width={ 20}
							height={ 20}
							className="shrink-0 text-[#101010] [&_path]:stroke-current"
							aria-hidden="true"
						/>
						<span className="font-normal">{ prefix }</span>

						{ showViewAllLink && onViewAll ? (
							<button
								type="button"
								className="ml-1 shrink-0 cursor-pointer border-0 bg-transparent p-0 font-normal text-[#101010] underline decoration-[#101010] underline-offset-2 transition-opacity hover:opacity-70"
								onClick={ onViewAll }
							>
								{ linkLabel }
							</button>
						) : null }
					</div>
				</div>
			</div>
		</section>
	);
}
