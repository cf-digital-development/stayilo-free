import { __ } from '@stayilo/design-system/i18n';
import { EmptyState } from './EmptyState.jsx';
import { decodeMoney } from '../utils/decodeMoney.js';

function paymentStatusClass( status ) {
	if ( status === 'failed' ) {
		return 'portal-payment-status--failed';
	}
	if ( status === 'pending' ) {
		return 'portal-payment-status--pending';
	}
	return 'portal-payment-status--success';
}

/**
 * Payment history table.
 *
 * @param {object} props
 * @param {string} [props.title='Payment history']
 * @param {Array<{ id: string, dateLabel: string, cardLast4?: string, paymentMethodLabel?: string, amount: string, status: string, statusLabel?: string }>} [props.items]
 * @param {string} [props.className]
 */
export function PaymentHistory( {
	title = __( 'Payment history', 'stayilo' ),
	items = [],
	className = '',
	id,
} ) {
	return (
		<section
			className={ [ 'portal-payment-history', className ].filter( Boolean ).join( ' ' ) }
			aria-label={ title }
		>
			<h2 className="portal-payment-history__title">{ title }</h2>

			<div className="portal-payment-history__table-wrap">
				<table className="portal-payment-history__table">
					<thead>
						<tr>
							<th scope="col">{ __( 'Payment Date', 'stayilo' ) }</th>
							<th scope="col">{ __( 'Payment method', 'stayilo' ) }</th>
							<th scope="col">{ __( 'Amount', 'stayilo' ) }</th>
							<th scope="col">{ __( 'Status', 'stayilo' ) }</th>
						</tr>
					</thead>
					<tbody>
						{ items.length === 0 ? (
							<tr>
								<td colSpan={ 4 } className="!p-0">
									<EmptyState message={ __( 'No payment history yet.', 'stayilo' ) } />
								</td>
							</tr>
						) : (
							items.map( ( item ) => (
								<tr key={ item.id }>
									<td data-label={ __( 'Payment Date', 'stayilo' ) }>{ item.dateLabel }</td>
									<td data-label={ __( 'Payment method', 'stayilo' ) }>
										{ formatPaymentMethodCell( item ) }
									</td>
									<td data-label={ __( 'Amount', 'stayilo' ) }>
										{ decodeMoney( item.amount ) }
									</td>
									<td data-label={ __( 'Status', 'stayilo' ) }>
										<span
											className={ [
												'portal-payment-status',
												paymentStatusClass( item.status ),
											].join( ' ' ) }
										>
											{ item.statusLabel || item.status }
										</span>
									</td>
								</tr>
							) )
						) }
					</tbody>
				</table>
			</div>
		</section>
	);
}

/**
 * @param {{ cardLast4?: string, paymentMethodLabel?: string }} item
 * @returns {string}
 */
function formatPaymentMethodCell( item ) {
	const last4 = String( item?.cardLast4 || '' ).replace( /\D/g, '' );
	if ( last4.length === 4 ) {
		return `•••• ${ last4 }`;
	}
	return item?.paymentMethodLabel || '—';
}
