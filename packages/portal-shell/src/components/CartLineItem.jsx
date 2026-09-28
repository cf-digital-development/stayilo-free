import { useEffect, useState } from 'react';
import { ReactComponent as TrashIcon } from '@stayilo/design-system/assets/svg/delete.svg';
import { ReactComponent as MinusIcon } from '@stayilo/design-system/assets/svg/Minus.svg';
import { ReactComponent as AddIcon } from '@stayilo/design-system/assets/svg/Add.svg';
import { clampQuantity } from '../utils/cartLines.js';
import {
	DEFAULT_THUMB_IMAGE,
	resolveMediaUrl,
} from '../utils/mediaPlaceholders.js';
import { __, sprintf } from '@stayilo/design-system/i18n';

function QuantityStepper( {
	title,
	quantity,
	minQuantity,
	maxQuantity,
	canDecrease,
	canIncrease,
	draft,
	setDraft,
	commitQuantity,
	onQuantityChange,
	className = 'portal-qty-stepper mt-[14px]',
} ) {
	const bounds = { min: minQuantity, max: maxQuantity };
	return (
		<div
			className={ className }
			role="group"
			aria-label={ sprintf( __( 'Quantity for %s', 'stayilo' ), title ) }
		>
			<button
				type="button"
				className="portal-qty-stepper__btn"
				aria-label={ __( 'Decrease quantity', 'stayilo' ) }
				disabled={ ! canDecrease }
				onClick={ () =>
					onQuantityChange?.(
						clampQuantity( quantity - 1, bounds )
					)
				}
			>
				<MinusIcon width={ 20 } height={ 20 } aria-hidden="true" />
			</button>
			<input
				type="number"
				inputMode="numeric"
				min={ minQuantity }
				max={ maxQuantity }
				className="portal-qty-stepper__value"
				aria-label={ sprintf( __( 'Quantity for %s', 'stayilo' ), title ) }
				aria-live="polite"
				value={ draft }
				onChange={ ( event ) => {
					setDraft( event.target.value );
				} }
				onBlur={ () => commitQuantity( draft ) }
				onKeyDown={ ( event ) => {
					if ( event.key === 'Enter' ) {
						event.currentTarget.blur();
					}
				} }
			/>
			<button
				type="button"
				className="portal-qty-stepper__btn"
				aria-label={ __( 'Increase quantity', 'stayilo' ) }
				disabled={ ! canIncrease }
				onClick={ () =>
					onQuantityChange?.(
						clampQuantity( quantity + 1, bounds )
					)
				}
			>
				<AddIcon width={ 20 } height={ 20 } aria-hidden="true" />
			</button>
		</div>
	);
}

/**
 * Editable cart / order line — thumbnail, servings, quantity stepper, price, remove.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.servings]
 * @param {string} [props.subtitle]
 * @param {string[]} [props.tags]
 * @param {number} [props.quantity=1]
 * @param {number} [props.minQuantity=1]
 * @param {number} [props.maxQuantity]
 * @param {string} [props.price]
 * @param {string} [props.unitPrice]
 * @param {string} [props.compareAtPrice] - Pre-discount price (strikethrough).
 * @param {string} [props.savingsLabel] - e.g. "Save £0.18 / week".
 * @param {string} [props.imageUrl]
 * @param {string} [props.imageAlt]
 * @param {(next: number) => void} [props.onQuantityChange]
 * @param {() => void} [props.onRemove]
 * @param {boolean} [props.showDivider=true]
 * @param {boolean} [props.showQuantity=true] - When false, quantity is inlined in meta.
 * @param {'stack'|'row'} [props.layout='stack']
 * @param {string} [props.className]
 */
export function CartLineItem( {
	title,
	servings = '',
	subtitle = '',
	tags,
	quantity = 1,
	minQuantity = 1,
	maxQuantity,
	price,
	unitPrice,
	compareAtPrice,
	savingsLabel = '',
	imageUrl,
	imageAlt = '',
	onQuantityChange,
	onRemove,
	showDivider = true,
	showQuantity = true,
	layout = 'stack',
	className = '',
} ) {
	const bounds = { min: minQuantity, max: maxQuantity };
	const displayImageUrl = resolveMediaUrl( imageUrl, DEFAULT_THUMB_IMAGE );
	const [ draft, setDraft ] = useState( String( quantity ) );

	useEffect( () => {
		setDraft( String( quantity ) );
	}, [ quantity ] );

	const canDecrease = quantity > minQuantity;
	const canIncrease = maxQuantity == null || quantity < maxQuantity;

	const commitQuantity = ( value ) => {
		const next = clampQuantity( value, bounds );
		setDraft( String( next ) );
		if ( next !== quantity ) {
			onQuantityChange?.( next );
		}
	};

	const lineTags = Array.isArray( tags ) ? tags.filter( Boolean ) : [];
	const meta = [
		servings,
		! showQuantity ? sprintf( __( 'Quantity: %s', 'stayilo' ), quantity ) : '',
	]
		.filter( Boolean )
		.join( ' · ' );

	const stepper = ! showQuantity
		? null
		: onQuantityChange ? (
			<QuantityStepper
				title={ title }
				quantity={ quantity }
				minQuantity={ minQuantity }
				maxQuantity={ maxQuantity }
				canDecrease={ canDecrease }
				canIncrease={ canIncrease }
				draft={ draft }
				setDraft={ setDraft }
				commitQuantity={ commitQuantity }
				onQuantityChange={ onQuantityChange }
				className={
					layout === 'row'
						? 'portal-qty-stepper'
						: 'portal-qty-stepper mt-[14px]'
				}
			/>
		) : (
			<p
				className={
					layout === 'row'
						? 'm-0 text-sm font-medium text-stayilo-muted'
						: 'mt-[14px] m-0 text-sm font-medium text-stayilo-muted'
				}
			>
				Qty { quantity }
			</p>
		);

	if ( layout === 'row' ) {
		return (
			<div
				className={ [
					'portal-cart-line',
					showDivider ? 'portal-cart-line--divided' : '',
					className,
				].filter( Boolean ).join( ' ' ) }
			>
				<div className="portal-cart-line-media">
					<img
						src={ displayImageUrl }
						alt={ imageAlt || title }
						className="h-full w-full object-cover"
					/>
				</div>
				<div className="portal-cart-line__info">
					<h3 className="m-0 text-base font-bold leading-6 md:text-xl md:leading-[100%]">
						{ title }
					</h3>
					{ subtitle ? (
						<p className="portal-cart-line__subtitle">{ subtitle }</p>
					) : null }
					{ lineTags.length ? (
						<ul className="portal-cart-line__tags">
							{ lineTags.map( ( tag ) => (
								<li key={ tag } className="portal-cart-line__tag">
									{ tag }
								</li>
							) ) }
						</ul>
					) : null }
					{ meta ? (
						<p className="portal-cart-line__meta">{ meta }</p>
					) : null }
				</div>
				{ stepper }
				<div className="flex shrink-0 items-start gap-4">
					{ price ? (
						<span className="portal-cart-line__prices text-right">
							{ compareAtPrice ? (
								<span className="portal-cart-line__compare">
									{ compareAtPrice }
								</span>
							) : null }
							<span className="portal-cart-line__total text-base font-bold leading-6 md:text-xl md:leading-7">
								{ price }
							</span>
							{ unitPrice ? (
								<span className="portal-cart-line__unit">
									{ sprintf( __( '%s / bag', 'stayilo' ), unitPrice ) }
								</span>
							) : null }
						</span>
					) : null }
					{ onRemove ? (
						<button
							type="button"
							className="portal-cart-line-remove"
							aria-label={ sprintf( __( 'Remove %s', 'stayilo' ), title ) }
							onClick={ onRemove }
						>
							<TrashIcon
								width={ 20 }
								height={ 20 }
								aria-hidden="true"
								className="block"
								style={ { color: '#C00808' } }
							/>
						</button>
					) : null }
				</div>
			</div>
		);
	}

	return (
		<div
			className={ [
				'portal-cart-line',
				showDivider ? 'portal-cart-line--divided' : '',
				className,
			].filter( Boolean ).join( ' ' ) }
		>
			<div className="portal-cart-line-media">
				<img
					src={ displayImageUrl }
					alt={ imageAlt || title }
					className="h-full w-full object-cover"
				/>
			</div>

			<div className="min-w-0 flex-1">
				<h3 className="m-0 text-base font-bold leading-6 md:text-xl md:leading-[100%]">
					{ title }
				</h3>
				

				{ stepper }
			</div>

			<div className="flex shrink-0 flex-col items-end gap-1 md:gap-1.5">
				<div className="flex items-start gap-4 md:gap-8">
					{ price ? (
						<span className="portal-cart-line__prices text-right">
							{ compareAtPrice ? (
								<span className="portal-cart-line__compare">
									{ compareAtPrice }
								</span>
							) : null }
							<span className="text-base font-bold leading-6 md:text-xl md:leading-7">
								{ price }
							</span>
						</span>
					) : null }
					{ onRemove ? (
						<button
							type="button"
							className="portal-cart-line-remove"
							aria-label={ sprintf( __( 'Remove %s', 'stayilo' ), title ) }
							onClick={ onRemove }
						>
							<TrashIcon
								width={ 20 }
								height={ 20 }
								aria-hidden="true"
								className="block"
								style={ { color: '#C00808' } }
							/>
						</button>
					) : null }
				</div>
				{ savingsLabel ? (
					<span className="portal-cart-line__savings">{ savingsLabel }</span>
				) : null }
			</div>
		</div>
	);
}
