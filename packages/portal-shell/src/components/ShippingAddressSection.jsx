import { useShippingAddress } from '../utils/useShippingAddress.js';
import { EditAddressPopup } from './EditAddressPopup.jsx';
import { OrderMetaCard } from './OrderMetaCard.jsx';

/**
 * Order address card + edit popup shared by View Subscription and Order Details.
 *
 * @param {object} props
 * @param {object} [props.shipping]
 * @param {string} [props.estimateLabel]
 * @param {boolean} [props.actionsEnabled=true] - When false, Edit address is disabled (e.g. canceled sub).
 * @param {string} [props.descriptionClassName] - Override Edit Address popup description styles.
 */
export function ShippingAddressSection( {
	shipping,
	estimateLabel = '',
	actionsEnabled = true,
	descriptionClassName = '',
	label = 'Order address',
	actionLabel = 'Edit Address',
	className = '',
} ) {
	const {
		address,
		addressLines,
		addressOpen,
		setAddressOpen,
		canUpdateAddress,
		saveAddress,
	} = useShippingAddress( shipping );

	const canEdit = canUpdateAddress && actionsEnabled;

	return (
		<>
			<OrderMetaCard
				label={ label }
				icon={ <OrderMetaCard.HomeIcon /> }
				lines={ addressLines }
				labelPlacement="inline"
				bodyAlign="start"
				actionLabel={ canUpdateAddress ? actionLabel : null }
				actionDisabled={ ! canEdit }
				className={ className }
				onAction={
					canEdit ? () => setAddressOpen( true ) : undefined
				}
			/>
			<EditAddressPopup
				open={ addressOpen }
				onClose={ () => setAddressOpen( false ) }
				estimateLabel={ estimateLabel }
				initialValues={ address }
				onSave={ saveAddress }
				descriptionClassName={ descriptionClassName }
			/>
		</>
	);
}
