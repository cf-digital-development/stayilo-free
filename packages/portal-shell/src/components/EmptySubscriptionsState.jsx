import { __ } from '@stayilo/design-system/i18n';
import { BrandedIcon } from './BrandedIcon.jsx';
import { Button } from './Button.jsx';
import { startCreateSubscription } from '../utils/createSubscription.js';
import { ReactComponent as EmptyBoxIllustration } from '@stayilo/design-system/assets/svg/emptycart.svg';
import classicEmptyCart from '@stayilo/design-system/assets/images/empty-cart-classic.png';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';

export function EmptySubscriptionsState( {
	title = __( 'No subscription found', 'stayilo' ),
	description = __( 'You don’t have an active subscription yet. Create one and manage upcoming orders from here.', 'stayilo' ),
	actionLabel = __( 'Create your subscription', 'stayilo' ),
	onAction = startCreateSubscription,
	className = '',
} ) {
	const { id } = useTemplateRecipe();

	return (
		<div
			className={ [ 'portal-empty-subscriptions', className ]
				.filter( Boolean )
				.join( ' ' ) }
			role="status"
			aria-label={ title }
		>
			<div className="portal-empty-subscriptions__art" aria-hidden="true">
				<BrandedIcon name="emptyBox" className="portal-empty-subscriptions__image">
					{ id === 'classic' ? (
						<img
							src={ classicEmptyCart }
							alt=""
							className="portal-empty-subscriptions__image"
						/>
					) : (
						<EmptyBoxIllustration />
					) }
				</BrandedIcon>
			</div>

			<h2 className="portal-empty-subscriptions__title">{ title }</h2>

			{ description ? (
				<p className="portal-empty-subscriptions__description">{ description }</p>
			) : null }

			<div className="portal-empty-subscriptions__actions">
				<Button
					label={ actionLabel }
					variant="primary"
					onClick={ onAction }
					className="portal-empty-subscriptions__action"
				/>
			</div>
		</div>
	);
}
