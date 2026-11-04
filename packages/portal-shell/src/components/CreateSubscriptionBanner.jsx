import { Button } from './Button.jsx';
import { NavArrowIcon } from './NavArrowIcon.jsx';

/**
 * Green promo strip — subscribe CTA with pattern watermark.
 *
 * @param {object} props
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {string} [props.actionLabel='Create Subscription']
 * @param {() => void} [props.onAction]
 * @param {string} [props.backgroundColor]
 * @param {string} [props.className]
 */
export function CreateSubscriptionBanner( {
	title = 'Subscribe now and enjoy 10% off every subscription!',
	subtitle = "Set up a subscription for your current order, and we'll send your food on the same date.",
	actionLabel = 'Create Subscription',
	onAction,
	backgroundColor = 'var(--stayilo-banner-bg)',
	className = '',
} ) {
	return (
		<section
			className={ [
				'portal-subscribe-promo',
				className,
			].filter( Boolean ).join( ' ' ) }
			style={ { backgroundColor } }
			aria-label={ title }
		>
			<div className="relative z-[1] min-w-0 flex-1 max-w-[544px]">
				<h2 className="portal-banner-on-brand m-0 text-xl font-bold leading-[100%] sm:text-2xl sm:leading-8">
					{ title }
				</h2>
				{ subtitle ? (
					<p className="portal-banner-on-brand mt-2 m-0 text-base font-normal leading-6 opacity-80">
						{ subtitle }
					</p>
				) : null }
			</div>

			<div className="relative z-[1] min-w-0">
				<Button
					label={ actionLabel }
					variant="secondary"
					className="portal-btn--on-dark !pl-[32px] !pr-[20px] !px-0"
					icon={ <NavArrowIcon width={ 24 } height={ 24 } className="text-[#101010]" /> }
					onClick={ onAction }
				/>
			</div>
		</section>
	);
}
