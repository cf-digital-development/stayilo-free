import { ReactComponent as CreditCardIcon } from '../assets/images/CreditCard.svg';
import { BrandedIcon } from './BrandedIcon.jsx';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import { Button } from './Button.jsx';
import { NavArrowIcon } from './NavArrowIcon.jsx';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Single saved payment method card (mockup layout).
 *
 * @param {object} props
 * @param {string} props.label
 * @param {string} props.last4
 * @param {boolean} [props.isDefault=false]
 * @param {() => void} [props.onMakeDefault]
 * @param {() => void} [props.onRemove]
 * @param {string} [props.className]
 */
export function PaymentMethodCard( {
	label,
	last4,
	isDefault = false,
	onMakeDefault,
	onRemove,
	className = '',
} ) {
	const { id } = useTemplateRecipe();
	const isClassic = id === 'classic';

	return (
		<article
			className={ [
				'portal-payment-method',
				className,
			].filter( Boolean ).join( ' ' ) }
		>
			<div className="portal-payment-method__main">
				<div className="portal-payment-method__heading">
					<span className="portal-payment-method__icon" aria-hidden="true">
						<BrandedIcon name="card" width={ 24 } height={ 24 } className="text-[#516350]">
							<CreditCardIcon
								className="text-[#516350] [&_path]:stroke-current"
							/>
						</BrandedIcon>
					</span>
					<p className="portal-payment-method__label">{ label }</p>
				</div>

				<p className="portal-payment-method__number">
					**** **** ****{ ' ' }
					<span className="portal-payment-method__last4">{ last4 }</span>
				</p>

				{ isDefault ? (
					<span className="portal-payment-badge portal-payment-badge--default">
						{ __( 'Default', 'stayilo' ) }
					</span>
				) : (
					<Button
						label={ isClassic ? __( 'Make it default', 'stayilo' ) : __( 'Make it Default', 'stayilo' ) }
						variant="secondary"
						showIcon={ ! isClassic }
						icon={
							<NavArrowIcon
								width={ 24 }
								height={ 24 }
								className="text-current"
							/>
						}
						onClick={ onMakeDefault }
						disabled={ typeof onMakeDefault !== 'function' }
						className="portal-payment-method__default-btn"
					/>
				) }
			</div>

			<Button
				label={ isClassic ? __( 'Remove card', 'stayilo' ) : __( 'Remove Card', 'stayilo' ) }
				variant="dangerOutline"
				showIcon
				icon={
					<NavArrowIcon
						width={ 24 }
						height={ 24}
						className="text-current"
					/>
				}
				onClick={ onRemove }
				disabled={ typeof onRemove !== 'function' }
				className="portal-payment-method__remove-btn border"
				style={{
					border: '1px solid #FF1010 !important',
				}}
			/>
		</article>
	);
}
