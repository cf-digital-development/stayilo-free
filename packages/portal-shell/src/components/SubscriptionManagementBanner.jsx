import { ReactComponent as TruckDeliveryIcon } from '@stayilo/design-system/assets/svg/Delivery-account.svg';
import classicIcon from '@stayilo/design-system/assets/images/subscription-management-classic.png';
import { BrandedIcon } from './BrandedIcon.jsx';
import { Button } from './Button.jsx';
import { NavArrowIcon } from './NavArrowIcon.jsx';
import { SUBSCRIPTION_MANAGEMENT } from '../data/accountInfo.js';
import { useAccount } from '../store/useAccount.js';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Account page strip — subscription management CTA.
 *
 * @param {object} props
 * @param {() => void} [props.onManage]
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.className]
 */
export function SubscriptionManagementBanner( {
	onManage,
	disabled = false,
	className = '',
	avatarUrl = '',
	avatarAlt = '',
} ) {
	const { title, headline, body, actionLabel } = SUBSCRIPTION_MANAGEMENT;
	const { id } = useTemplateRecipe();
	const { account } = useAccount();
	const user = account?.user || {};
	const initial = ( user.fullName || user.email || '?' ).charAt( 0 ).toUpperCase();
	const photoUrl = avatarUrl || user.avatarUrl || '';
	const photoAlt = avatarAlt || user.avatarAlt || user.fullName || __( 'Account', 'stayilo' );

	return (
		<section
			className={ [
				'portal-subscription-manage',
				className,
			].filter( Boolean ).join( ' ' ) }
			aria-label={ title }
		>
			<div className="portal-subscription-manage__copy min-w-0 flex-1 max-w-xl z-10">
				<div className="portal-subscription-manage__heading">
					<p className="portal-subscription-manage__title m-0 text-xl font-semibold leading-[100%] sm:text-2xl sm:leading-8">{ title }</p>
				</div>
				<h2 className="portal-subscription-manage__headline mt-2 m-0 text-sm font-semibold leading-[100%] sm:text-base sm:leading-6 text-[#101010] opacity-80">
					{ headline }
				</h2>
				<p className="portal-subscription-manage__body mt-1 text-sm sm:text-base leading-[100%] font-normal  leading-6 text-[#101010] opacity-80">
					{ body }
				</p>
				<div className="portal-subscription-manage__action mt-7">
					<Button
						label={ id === 'classic' ? __( 'Manage subscription', 'stayilo' ) : actionLabel }
						variant="primary"
						icon={ <NavArrowIcon width={ 24 } height={ 24 } className="text-white" /> }
						className="portal-subscription-manage__btn !w-[331px] "
						onClick={ onManage }
						disabled={ disabled || typeof onManage !== 'function' }
					/>
				</div>
			</div>

			<div
				className="portal-subscription-manage__art pointer-events-none  relative  -mb-4 sm:mb-0  -z-1 left:0 mt-6 sm:mt-0 sm:absolute sm:right-0 sm:bottom-0 shrink-0 items-end justify-center sm:flex"
				aria-hidden="true"
			>
				<div className="flex h-[234px] w-[213px] items-center justify-center rounded-full">
					<BrandedIcon name="subscription" className="portal-subscription-manage__image">
						{ id === 'classic' ? (
							<img src={ classicIcon } alt="" className="portal-subscription-manage__image" />
						) : (
							<TruckDeliveryIcon width={ 213 } height={ 234 } />
						) }
					</BrandedIcon>
				</div>
			</div>
		</section>
	);
}
