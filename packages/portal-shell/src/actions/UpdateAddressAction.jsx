import { ShippingAddressSection } from '../components/ShippingAddressSection.jsx';
import { useResolvedSubscription } from '../store/useResolvedSubscription.js';

/**
 * Free-tier built-in portal action — Update address.
 * Edit is gated inside ShippingAddressSection / useShippingAddress.
 *
 * @param {object} [props]
 * @param {object} [props.shipping]
 * @param {string} [props.estimateLabel]
 * @param {boolean} [props.actionsEnabled]
 * @param {string} [props.descriptionClassName] - Override Edit Address popup description styles.
 */
export function UpdateAddressAction( {
	shipping,
	estimateLabel = '',
	actionsEnabled = true,
	descriptionClassName = '',
	label,
	actionLabel,
	className = '',
} = {} ) {
	const { subscription } = useResolvedSubscription();

	return (
		<ShippingAddressSection
			shipping={ shipping ?? subscription?.shipping }
			estimateLabel={
				estimateLabel || subscription?.nextDelivery?.date || ''
			}
			actionsEnabled={ actionsEnabled }
			descriptionClassName={ descriptionClassName }
			label={ label }
			actionLabel={ actionLabel }
			className={ className }
		/>
	);
}
