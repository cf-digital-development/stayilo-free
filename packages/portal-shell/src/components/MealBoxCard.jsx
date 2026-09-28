import { __ } from '@stayilo/design-system/i18n';
import { Button } from './Button.jsx';
import { NavArrowIcon } from './NavArrowIcon.jsx';
import { CARD_LAYOUTS } from './meal-card/layouts.js';
import {
	DEFAULT_MEAL_IMAGE,
	resolveMediaUrl,
} from '../utils/mediaPlaceholders.js';
import { isSubscriptionCanceled, isSubscriptionPaused } from '../utils/subscriptionOverview.js';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';

function CardActions( {
	isClassic,
	isCanceled,
	isPaused,
	actionLabel,
	reactivateLabel,
	loadingLabel,
	resumeLabel,
	onManage,
	onReactivate,
	onResume,
	actionLoading,
} ) {
	const inactiveLabel = isClassic ? __( 'Reactivate subscription', 'stayilo' ) : null;

	if ( isCanceled ) {
		if ( onReactivate ) {
			return (
				<Button
					label={
						actionLoading
							? loadingLabel || __( 'Starting checkout…', 'stayilo' )
							: inactiveLabel || reactivateLabel
					}
					variant="secondary"
					icon={
						<NavArrowIcon
							width={ 24 }
							height={ 24 }
							className={ isClassic ? 'text-current' : 'text-portal-danger' }
						/>
					}
					onClick={ onReactivate }
					loading={ actionLoading }
					className={ isClassic ? 'portal-btn-block' : 'portal-btn-reactivate' }
				/>
			);
		}
		return (
			<Button
				label={ __( 'Cancelled', 'stayilo' ) }
				variant="secondary"
				icon={ <NavArrowIcon width={ 24 } height={ 24 } className="text-portal-danger" /> }
				disabled
				showIcon
				className="portal-btn-reactivate portal-btn-canceled-status"
			/>
		);
	}

	if ( isPaused ) {
		return (
			<Button
				label={ actionLoading ? __( 'Resuming…', 'stayilo' ) : inactiveLabel || resumeLabel }
				variant="secondary"
				icon={ <NavArrowIcon width={ 24 } height={ 24 } className="text-current" /> }
				onClick={ onResume }
				loading={ actionLoading }
				disabled={ ! onResume }
				className="portal-btn-block"
			/>
		);
	}

	return (
		<Button
			label={ actionLabel }
			variant="primary"
			showIcon
			onClick={ onManage }
			disabled={ ! onManage }
			className="portal-btn-block"
		/>
	);
}

/**
 * Meal subscription card — image, title, next-order strip, manage CTA.
 * Layout (media vs chip) comes from the active template recipe.
 *
 * @param {object} props
 * @param {string} [props.title='Meal subscription']
 * @param {string} [props.description]
 * @param {string} [props.category]
 * @param {string} [props.imageUrl]
 * @param {string} [props.imageAlt='']
 * @param {'active'|'canceled'|'paused'} [props.status='active']
 * @param {boolean} [props.paymentFailed=false]
 * @param {object} [props.nextDelivery] - Props forwarded to NextDeliveryBanner (embedded).
 * @param {string} [props.actionLabel='Manage Subscription']
 * @param {string} [props.reactivateLabel='Reactivate Subscription']
 * @param {string} [props.loadingLabel]
 * @param {string} [props.resumeLabel='Resume Subscription']
 * @param {() => void} [props.onManage]
 * @param {() => void} [props.onReactivate]
 * @param {() => void} [props.onResume]
 * @param {() => void} [props.onOpenDelivery]
 * @param {boolean} [props.actionLoading=false]
 * @param {string} [props.className]
 */
export function MealBoxCard( {
	title = __( 'Meal subscription', 'stayilo' ),
	description = __( 'Your recurring subscription.', 'stayilo' ),
	category,
	imageUrl,
	imageAlt = '',
	status = 'active',
	paymentFailed = false,
	nextDelivery = {},
	actionLabel = __( 'Manage Subscription', 'stayilo' ),
	reactivateLabel = __( 'Reactivate Subscription', 'stayilo' ),
	loadingLabel,
	resumeLabel = __( 'Resume Subscription', 'stayilo' ),
	onManage,
	onReactivate,
	onResume,
	onOpenDelivery,
	actionLoading = false,
	className = '',
} ) {
	const recipe = useTemplateRecipe();
	const layout = recipe?.card && CARD_LAYOUTS[ recipe.card ]
		? recipe.card
		: 'media';
	const Body = CARD_LAYOUTS[ layout ];
	const isCanceled = isSubscriptionCanceled( status );
	const isPaused = isSubscriptionPaused( status );
	const isClassic = recipe?.id === 'classic';
	const displayImageUrl = resolveMediaUrl( imageUrl, DEFAULT_MEAL_IMAGE );
	const isPlaceholder = displayImageUrl === DEFAULT_MEAL_IMAGE;
	const actions = (
		<CardActions
			isClassic={ isClassic }
			isCanceled={ isCanceled }
			isPaused={ isPaused }
			actionLabel={ actionLabel }
			reactivateLabel={ reactivateLabel }
			loadingLabel={ loadingLabel }
			resumeLabel={ resumeLabel }
			onManage={ onManage }
			onReactivate={ onReactivate }
			onResume={ onResume }
			actionLoading={ actionLoading }
		/>
	);

	return (
		<article
			className={ [
				'portal-card',
				layout === 'chip' ? 'portal-card--chip' : 'portal-card--media',
				isCanceled ? 'portal-card--canceled' : '',
				isPaused ? 'portal-card--paused' : '',
				className,
			].filter( Boolean ).join( ' ' ) }
		>
			<Body
				title={ title }
				description={ description }
				category={ category }
				imageAlt={ imageAlt }
				displayImageUrl={ displayImageUrl }
				isPlaceholder={ isPlaceholder }
				paymentFailed={ paymentFailed }
				isCanceled={ isCanceled }
				isPaused={ isPaused }
				nextDelivery={ nextDelivery }
				onOpenDelivery={ onOpenDelivery }
				actions={ actions }
			/>
		</article>
	);
}
