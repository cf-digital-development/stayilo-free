import { useTemplateRecipe } from '../../templates/TemplateProvider.jsx';
import { __ } from '@stayilo/design-system/i18n';

export function CardStatusBadge( {
	paymentFailed,
	isCanceled,
	isPaused,
	placement = 'overlay',
} ) {
	const extra = placement === 'inline' ? 'portal-badge--inline' : '';
	const { id } = useTemplateRecipe();

	if ( paymentFailed ) {
		return (
			<span className={ [ 'portal-badge-payment-failed', extra ].filter( Boolean ).join( ' ' ) }>
				{ __( 'Payment failed', 'stayilo' ) }
			</span>
		);
	}
	if ( isCanceled ) {
		return (
			<span className={ [ 'portal-badge-canceled', extra ].filter( Boolean ).join( ' ' ) }>
				{ id === 'classic' ? __( 'Canceled', 'stayilo' ) : __( 'Cancelled', 'stayilo' ) }
			</span>
		);
	}
	if ( isPaused ) {
		return (
			<span className={ [ 'portal-badge-paused', extra ].filter( Boolean ).join( ' ' ) }>
				{ __( 'Paused', 'stayilo' ) }
			</span>
		);
	}
	return null;
}
