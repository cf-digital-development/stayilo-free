import { useEffect } from 'react';
import { Button } from '../../components/Button.jsx';
import { CartLineList } from '../../components/CartLineList.jsx';
import { ContentHeader } from '../../components/ContentHeader.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { PageLoader } from '../../components/PageLoader.jsx';
import { __, _n, sprintf } from '@stayilo/design-system/i18n';

function formatBoxSubtitle( items ) {
	if ( ! items.length ) {
		return '';
	}
	const kinds = new Set( items.map( ( item ) => item.title ).filter( Boolean ) )
		.size;
	const qty = items.reduce(
		( sum, item ) => sum + ( Number( item.quantity ) || 0 ),
		0
	);
	return sprintf(
		_n( '%1$d item · %2$d total', '%1$d items · %2$d total', kinds, 'stayilo' ),
		kinds,
		qty
	);
}

export function ClassicEditBody( {
	isAddMore,
	displayLines,
	boxLines,
	currency,
	boxTotal,
	saveState,
	catalogStatus,
	onQuantityChange,
	onRemove,
	onBrowse,
} ) {
	const saving =
		saveState?.status === 'saving' || saveState?.status === 'pending';
	const itemsTitle = isAddMore ? __( 'Add more items', 'stayilo' ) : "What's in your box";
	const itemsSubtitle = isAddMore ? '' : formatBoxSubtitle( boxLines );

	useEffect( () => {
		if ( saveState?.status !== 'error' ) {
			return;
		}
		window.alert(
			saveState.message ||
				__( 'Could not update your WooCommerce subscription.', 'stayilo' )
		);
	}, [ saveState?.status, saveState?.message ] );

	let itemsBody;
	if ( isAddMore && ( catalogStatus === 'idle' || catalogStatus === 'loading' ) ) {
		itemsBody = (
			<PageLoader
				message={ __( 'Loading shop products…', 'stayilo' ) }
				className="!rounded-none bg-transparent"
			/>
		);
	} else if ( isAddMore && catalogStatus === 'error' ) {
		itemsBody = (
			<EmptyState
				message={ __( 'Could not load shop products.', 'stayilo' ) }
				className="!rounded-none bg-transparent py-4"
			/>
		);
	} else {
		itemsBody = (
			<CartLineList
				lines={ displayLines }
				currency={ currency }
				layout="row"
				showUnitPrice
				compactMeta
				minQuantity={ isAddMore ? 0 : 1 }
				onQuantityChange={ onQuantityChange }
				onRemove={ onRemove }
				emptyMessage={
					isAddMore
						? __( 'No shop products are available.', 'stayilo' )
						: __( 'Your subscription is empty.', 'stayilo' )
				}
				emptyClassName="!rounded-none bg-transparent py-4"
				emptyAction={
					isAddMore ? undefined : (
						<button
							type="button"
							className="text-base font-semibold underline"
							onClick={ onBrowse }
						>
							{ __( 'Browse items to add', 'stayilo' ) }
						</button>
					)
				}
			/>
		);
	}

	return (
		<div className="portal-edit-box">
			<div className="portal-edit-box__grid">
				<section
					className="portal-edit-box__items"
					aria-label={ itemsTitle }
				>
					<ContentHeader
						title={ itemsTitle }
						subtitle={ itemsSubtitle }
						className="portal-edit-box__items-header"
					/>
					{ itemsBody }
				</section>

				<section
					className="portal-edit-box__summary"
					aria-label={ __( 'Order summary', 'stayilo' ) }
				>
					<h2 className="portal-edit-box__summary-title">{ __( 'Order summary', 'stayilo' ) }</h2>
					<ul className="portal-edit-box__summary-lines" role="list">
						{ ( boxTotal?.lines || [] ).map( ( line ) => (
							<li
								key={ line.id }
								className={ [
									'portal-edit-box__summary-line',
									line.tone === 'discount'
										? 'portal-edit-box__summary-line--discount'
										: '',
									line.tone === 'total'
										? 'portal-edit-box__summary-line--total'
										: '',
								]
									.filter( Boolean )
									.join( ' ' ) }
							>
								<span>{ line.label }</span>
								<span>{ line.value }</span>
							</li>
						) ) }
					</ul>
					<Button
						label={ saving ? __( 'Saving…', 'stayilo' ) : __( 'Save changes', 'stayilo' ) }
						variant="primary"
						disabled={ saving }
						className="portal-edit-box__save"
					/>
				</section>
			</div>
		</div>
	);
}
