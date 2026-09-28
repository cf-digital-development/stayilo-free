import { formatCartMoney } from '../utils/cartLines.js';
import { Button } from './Button.jsx';
import { ProductSummaryCard } from './ProductSummaryCard.jsx';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Catalog card for Add more items — image, details, price, add CTA.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.servings]
 * @param {number} [props.unitPrice]
 * @param {string} [props.currency='GBP']
 * @param {string} [props.imageUrl]
 * @param {string} [props.imageAlt]
 * @param {boolean} [props.inBox=false]
 * @param {() => void} [props.onAdd]
 * @param {string} [props.className]
 */
export function AddProductCard( {
	title,
	servings = '2 serv.',
	unitPrice = 0,
	currency = 'GBP',
	imageUrl,
	imageAlt = '',
	inBox = false,
	onAdd,
	className = '',
} ) {
	return (
		<ProductSummaryCard
			title={ title }
			servings={ servings }
			quantity={ null }
			price={ formatCartMoney( unitPrice, currency ) }
			imageUrl={ imageUrl }
			imageAlt={ imageAlt }
			className={ [ 'flex flex-col', className ].filter( Boolean ).join( ' ' ) }
			bodyClassName="flex flex-1 flex-col p-4"
			footer={
				<div className="mt-auto pt-4">
					<Button
						label={ inBox ? __( 'Add another', 'stayilo' ) : __( 'Add to subscription', 'stayilo' ) }
						variant="primary"
						onClick={ onAdd }
						className="portal-btn-block !py-3 !text-sm"
					/>
				</div>
			}
		/>
	);
}
