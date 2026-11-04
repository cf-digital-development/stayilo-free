import { useMemo, useState } from 'react';
import { AddPaymentCardPopup } from '../components/AddPaymentCardPopup.jsx';
import { Banner } from '../components/Banner.jsx';
import { PaymentHistory } from '../components/PaymentHistory.jsx';
import { PaymentMethods } from '../components/PaymentMethods.jsx';
import { PAYMENT_FAILED_BANNER } from '../data/banners.js';
import { PAYMENT_BANNER } from '../data/payment.js';
import { usePaymentMethods } from '../store/usePaymentMethods.js';
import { useSubscriptions } from '../store/useSubscriptions.js';
import {
	goToSubscriptionPaymentCheckout,
	resolvePaymentFailedSubscription,
} from '../utils/subscriptionOverview.js';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';


/**
 * Payment page — saved cards + payment history from WooCommerce.
 */
export function Payment() {
	const {
		methods,
		history,
		error,
		makeDefault,
		removeMethod,
		addMethod,
		readOnly,
	} = usePaymentMethods();
	const { subscriptions } = useSubscriptions();
	const paymentFailedSubscription = useMemo(
		() => resolvePaymentFailedSubscription( subscriptions ),
		[ subscriptions ]
	);
	const { id } = useTemplateRecipe();

	const banner = useMemo( () => {
		if ( paymentFailedSubscription ) {
			return {
				...PAYMENT_FAILED_BANNER,
				actions: [
					{
						...PAYMENT_FAILED_BANNER.actions[ 0 ],
						onClick: () =>
							goToSubscriptionPaymentCheckout( paymentFailedSubscription ),
					},
				],
			};
		}
		return PAYMENT_BANNER;
	}, [ paymentFailedSubscription ] );

	const [ addOpen, setAddOpen ] = useState( false );

	return (
		<div className="w-full">
			<Banner { ...banner } showDecorations={ id === 'minimal' }/>

			<section
				id="portal-payment-methods"
				className="portal-content portal-section--padded"
			>
				{ error ? (
					<p className="text-sm font-medium text-[#C00808]" role="alert">
						{ error }
					</p>
				) : null }
				<PaymentMethods
					methods={ methods }
					onMakeDefault={ readOnly ? undefined : makeDefault }
					onRemove={ readOnly ? undefined : removeMethod }
					onAddCard={ readOnly ? undefined : () => setAddOpen( true ) }
				/>
				<PaymentHistory id={ id } items={ history } />
			</section>

			{ ! readOnly ? (
				<AddPaymentCardPopup
					open={ addOpen }
					onClose={ () => setAddOpen( false ) }
					onSave={ addMethod }
				/>
			) : null }
		</div>
	);
}
