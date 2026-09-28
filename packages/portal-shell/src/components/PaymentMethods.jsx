import { Button } from './Button.jsx';
import { EmptyState } from './EmptyState.jsx';
import { PaymentMethodCard } from './PaymentMethodCard.jsx';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Saved payment methods list + optional add-card CTA.
 *
 * @param {object} props
 * @param {Array<object>} [props.methods]
 * @param {(methodId: string) => void} [props.onMakeDefault]
 * @param {(methodId: string) => void} [props.onRemove]
 * @param {() => void} [props.onAddCard]
 * @param {string} [props.className]
 */
export function PaymentMethods( {
	methods = [],
	onMakeDefault,
	onRemove,
	onAddCard,
	className = '',
} ) {
	return (
		<section
			className={ [ 'portal-payment-methods', className ].filter( Boolean ).join( ' ' ) }
			aria-label={ __( 'Saved payment methods', 'stayilo' ) }
		>
			<div className="portal-payment-methods__list">
				{ methods.length === 0 ? (
					<EmptyState message={ __( 'No saved payment methods.', 'stayilo' ) } />
				) : (
					methods.map( ( method ) => (
						<PaymentMethodCard
							key={ method.id }
							label={ method.label }
							last4={ method.last4 }
							isDefault={ method.isDefault }
							onMakeDefault={
								! onMakeDefault || method.isDefault
									? undefined
									: () => onMakeDefault( method.id )
							}
							onRemove={
								onRemove
									? () => onRemove( method.id )
									: undefined
							}
						/>
					) )
				) }
			</div>

			<Button
				label={ __( 'Add New Card', 'stayilo' ) }
				variant="primary"
				onClick={ onAddCard }
				disabled={ typeof onAddCard !== 'function' }
				className="portal-payment-methods__add"
			/>
		</section>
	);
}
