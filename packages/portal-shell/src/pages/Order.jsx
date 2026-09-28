import { useNavigate } from 'react-router-dom';
import { Banner } from '../components/Banner.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { OrderHistoryCard } from '../components/OrderHistoryCard.jsx';
import { useOrders } from '../store/useOrders.js';
import { ORDERS_BANNER } from '../data/commerce.js';
import { ORDER_DETAILS_PATH } from '../routes.js';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Orders page — green header + past-order list with View Order actions.
 */
export function Order() {
	const navigate = useNavigate();
	const { orders } = useOrders();
	const { id } = useTemplateRecipe();

	return (
		<div className="w-full">
			<Banner { ...ORDERS_BANNER } title={ id === 'classic' ? __( 'Order history', 'stayilo' ) : __( 'Orders', 'stayilo' ) } showDecorations={ id === 'minimal' }/>

			<section className="portal-content portal-section--padded mt-[-8px]">
				{ orders.length === 0 ? (
					<EmptyState message={ __( 'No order is present.', 'stayilo' ) } />
				) : (
					<div className="portal-orders-list" aria-label={ __( 'Order history', 'stayilo' ) }>
						{ orders.map( ( order, index ) => (
							<OrderHistoryCard
								key={ order.id }
								variant="row"
								title={ order.title }
								price={ order.price }
								orderNumber={ order.orderNumber }
								dateLabel={ order.dateLabel }
								status={ order.status }
								imageUrl={ order.imageUrl }
								actionLabel={
									id === 'classic' ? __( 'View order', 'stayilo' ) : __( 'View Order', 'stayilo' )
								}
								showDivider={ index < orders.length - 1 }
								onView={ () =>
									navigate( `${ ORDER_DETAILS_PATH }/${ order.id }`, {
										state: { activeNavId: 'order', order },
									} )
								}
							/>
						) ) }
					</div>
				) }
			</section>
		</div>
	);
}
