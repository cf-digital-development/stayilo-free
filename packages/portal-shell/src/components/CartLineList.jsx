import { cartLineKey, formatCartMoney, lineTotal } from '../utils/cartLines.js';
import { CartLineItem } from './CartLineItem.jsx';
import { EmptyState } from './EmptyState.jsx';

function LineItem( {
	line,
	index,
	total,
	currency,
	onQuantityChange,
	onRemove,
	layout,
	showUnitPrice,
	showQuantity,
	compactMeta,
	minQuantity,
} ) {
	const meta = line.subscriptionId
		? { subscriptionId: line.subscriptionId }
		: undefined;
	const editable = line.recurring !== false && Boolean( onQuantityChange || onRemove );
	const hasCompare =
		Number( line.regularPrice ) > Number( line.price ) ||
		Number( line.regularUnitPrice ) > Number( line.unitPrice );
	const unitMatchesTotal =
		Number( line.unitPrice ) === Number( line.price );
	return (
		<CartLineItem
			title={ line.title }
			servings={
				compactMeta ? '' : line.description || line.servings
			}
			subtitle={ compactMeta ? line.servings : '' }
			tags={ compactMeta ? line.tags : undefined }
			quantity={ line.quantity }
			minQuantity={ minQuantity }
			price={ formatCartMoney( line.price, currency ) }
			unitPrice={
				showUnitPrice &&
				line.unitPrice != null &&
				! unitMatchesTotal
					? formatCartMoney( line.unitPrice, currency )
					: undefined
			}
			compareAtPrice={
				hasCompare
					? formatCartMoney(
							line.regularPrice ??
								lineTotal( line.regularUnitPrice, line.quantity ),
							currency
					  )
					: undefined
			}
			savingsLabel={ line.savingsLabel }
			imageUrl={ line.imageUrl }
			layout={ layout }
			showDivider={ index < total - 1 }
			showQuantity={ showQuantity }
			onQuantityChange={
				editable && onQuantityChange
					? ( quantity ) => onQuantityChange( line.id, quantity, meta )
					: undefined
			}
			onRemove={
				editable && onRemove ? () => onRemove( line.id, meta ) : undefined
			}
		/>
	);
}

/**
 * Editable cart lines, or an empty state when the list is empty.
 *
 * @param {object} props
 * @param {Array<object>} [props.lines]
 * @param {string} [props.currency]
 * @param {(id: string, quantity: number, meta?: { subscriptionId?: string }) => void} [props.onQuantityChange]
 * @param {(id: string, meta?: { subscriptionId?: string }) => void} [props.onRemove]
 * @param {string} [props.emptyMessage]
 * @param {string} [props.emptyClassName]
 * @param {import('react').ReactNode} [props.emptyAction]
 * @param {boolean} [props.asList]
 * @param {'stack'|'row'} [props.layout='stack']
 * @param {boolean} [props.showUnitPrice=false]
 * @param {boolean} [props.showQuantity=true]
 * @param {boolean} [props.compactMeta=false] - Title + servings subtitle + tags; hide product description.
 * @param {number} [props.minQuantity=1]
 * @param {import('react').Ref} [props.listRef]
 * @param {string} [props.listClassName]
 */
export function CartLineList( {
	lines = [],
	currency,
	onQuantityChange,
	onRemove,
	emptyMessage = 'Your subscription is empty.',
	emptyClassName,
	emptyAction,
	asList = false,
	layout = 'stack',
	showUnitPrice = false,
	showQuantity = true,
	compactMeta = false,
	minQuantity = 1,
	listRef,
	listClassName = '',
} ) {
	if ( lines.length === 0 ) {
		return (
			<EmptyState
				message={ emptyMessage }
				className={ emptyClassName }
				action={ emptyAction }
			/>
		);
	}

	const items = lines.map( ( line, index ) => (
		<LineItem
			key={ cartLineKey( line, index ) }
			line={ line }
			index={ index }
			total={ lines.length }
			currency={ currency }
			onQuantityChange={ onQuantityChange }
			onRemove={ onRemove }
			layout={ layout }
			showUnitPrice={ showUnitPrice }
			showQuantity={ showQuantity }
			compactMeta={ compactMeta }
			minQuantity={ minQuantity }
		/>
	) );

	if ( ! asList ) {
		return items;
	}

	return (
		<ul ref={ listRef } className={ listClassName } role="list">
			{ lines.map( ( line, index ) => (
				<li key={ cartLineKey( line, index ) }>
					<LineItem
						line={ line }
						index={ index }
						total={ lines.length }
						currency={ currency }
						onQuantityChange={ onQuantityChange }
						onRemove={ onRemove }
						layout={ layout }
						showUnitPrice={ showUnitPrice }
						showQuantity={ showQuantity }
						compactMeta={ compactMeta }
						minQuantity={ minQuantity }
					/>
				</li>
			) ) }
		</ul>
	);
}
