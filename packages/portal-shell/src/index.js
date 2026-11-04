export { PortalApp, accountBasename } from './PortalApp.jsx';
export { useSubscriptions } from './store/useSubscriptions.js';
export { useCartLines, useBoxTotalProps } from './store/useCartLines.js';
export { useAccount } from './store/useAccount.js';
export { useOrders } from './store/useOrders.js';
export { usePaymentMethods } from './store/usePaymentMethods.js';
export { store, persistor } from './store/index.js';
export {
	selectCartLines,
	selectVisibleCartLines,
	selectSelectedSubscriptionId,
	setSelectedSubscriptionId,
	updateQuantity as updateCartQuantity,
	removeLine as removeCartLineAction,
	loadFromSubscription as loadCartFromSubscription,
	clearSubscriptionLines,
	setLines as setCartLines,
} from './store/cartSlice.js';
export { PortalProviders } from './context/PortalProviders.jsx';
export { PortalShell } from './PortalShell.jsx';
export {
	useTemplateRecipe,
	readTemplateId,
} from './templates/TemplateProvider.jsx';
export { getRecipe } from './templates/recipes.js';
export {
	NAV_ROUTES,
	PORTAL_HOME_PATH,
	MY_SUBSCRIPTION_PATH,
	MANAGE_SUBSCRIPTION_PATH,
	ACCOUNT_INFO_PATH,
	ACCOUNT_SUBSCRIPTION_PATH,
	ORDER_PATH,
	ORDER_DETAILS_PATH,
	SUBSCRIPTION_ACTIONS_PATH,
	MANAGE_SUBSCRIPTION_OVERVIEW_PATH,
	EDIT_BOX_PATH,
	VIEW_BOX_PATH,
	PAYMENT_PATH,
} from './routes.js';
export { PortalActionSlot } from './slots/PortalActionSlot.jsx';
export { registerFreePortalActions } from './registerFreeActions.js';
export {
	getPortalActionSettings,
	isPortalActionEnabled,
	canShowFreeSelfServeManageUi,
	canShowManageSubscriptionCta,
	isPortalActionRegistered,
	hasPortalActionNonce,
	usePortalPremiumRevision,
	PORTAL_ACTION_SETTING_MAP,
} from './utils/portalActions.js';
export { SkipDeliveryAction } from './actions/SkipDeliveryAction.jsx';
export { UpdateAddressAction } from './actions/UpdateAddressAction.jsx';
export { useResolvedSubscription } from './store/useResolvedSubscription.js';
export { isActiveSubscription } from './utils/subscriptionOverview.js';
export { buildConfirmActions } from './components/ManageDeliveryPopup/confirmActions.js';
export { Button } from './components/Button.jsx';
export { NavArrowIcon } from './components/NavArrowIcon.jsx';
export { Header } from './components/Header.jsx';
export { HeaderActions } from './components/HeaderActions.jsx';
export { NotificationBell } from './components/NotificationBell.jsx';
export { NavMenu } from './components/NavMenu.jsx';
export { Card } from './components/Card.jsx';
export { CardStatItem } from './components/CardStatItem.jsx';
export { CardBoxStatus } from './components/CardBoxStatus.jsx';
export { Banner } from './components/Banner.jsx';
export { ContentHeader } from './components/ContentHeader.jsx';
export { UpcomingDeliveryBanner } from './components/UpcomingDeliveryBanner.jsx';
export { WeeklyDiscountBanner } from './components/WeeklyDiscountBanner.jsx';
export { NextDeliveryBanner } from './components/NextDeliveryBanner.jsx';
export { MealBoxCard } from './components/MealBoxCard.jsx';
export { UpcomingBoxCard } from './components/UpcomingBoxCard.jsx';
export { TimelineDot } from './components/TimelineDot.jsx';
export { UpcomingBoxesSlider } from './components/UpcomingBoxesSlider.jsx';
export { AccountDetailsCards } from './components/AccountDetailsCards.jsx';
export { Field } from './components/Field.jsx';
export { SubscriptionManagementBanner } from './components/SubscriptionManagementBanner.jsx';
export { CreateSubscriptionBanner } from './components/CreateSubscriptionBanner.jsx';
export { ProductSummaryCard } from './components/ProductSummaryCard.jsx';
export { OrderHistoryCard } from './components/OrderHistoryCard.jsx';
export { OrderMetaCard } from './components/OrderMetaCard.jsx';
export { EditAddressPopup } from './components/EditAddressPopup.jsx';
export { BoxTotalCard } from './components/BoxTotalCard.jsx';
export { CartLineItem } from './components/CartLineItem.jsx';
export { CartLineList } from './components/CartLineList.jsx';
export { CartDrawer } from './components/CartDrawer.jsx';
export { ActionPromptCard } from './components/ActionPromptCard.jsx';
export { PortalPopup } from './components/PortalPopup.jsx';
export {
	CancelPackageIcon,
	DiscountOfferIcon,
	SuccessCheckIcon,
} from './components/PortalPopupIcons.jsx';
export { CancelSubscriptionPopup } from './components/CancelSubscriptionPopup.jsx';
export { ReactivateSubscriptionPopup } from './components/ReactivateSubscriptionPopup.jsx';
export { QuickActionCard } from './components/QuickActionCard.jsx';
export { DateBadge } from './components/DateBadge.jsx';
export { ManageDeliveryPopup } from './components/ManageDeliveryPopup/index.js';
export { PaymentMethodCard } from './components/PaymentMethodCard.jsx';
export { PaymentMethods } from './components/PaymentMethods.jsx';
export { PaymentHistory } from './components/PaymentHistory.jsx';
export { AddPaymentCardPopup } from './components/AddPaymentCardPopup.jsx';
export { PortalHeader } from './pages/sections/PortalHeader.jsx';
export { YourOrderSlider } from './pages/sections/YourOrderSlider.jsx';
export { SubscriptionOverview } from './pages/sections/SubscriptionOverview.jsx';
export { Subscription } from './pages/sections/Subscription.jsx';
export { MySubscription } from './pages/MySubscription.jsx';
export { ManageSubscription } from './pages/ManageSubscription.jsx';
export { AccountInfo } from './pages/AccountInfo.jsx';
export { AccountSubscription } from './pages/AccountSubscription.jsx';
export { Order } from './pages/Order.jsx';
export { OrderDetails } from './pages/OrderDetails.jsx';
export { ViewBox } from './pages/ViewBox.jsx';
export { Payment } from './pages/Payment.jsx';
export { SubscriptionActions } from './pages/SubscriptionActions.jsx';
export {
	DEFAULT_NAV_ITEMS,
	DEFAULT_ORDER_CARDS,
	WELCOME_BANNER,
	EDIT_BOX_BANNER,
	REACTIVATE_BANNER,
	PAYMENT_FAILED_BANNER,
	UPCOMING_DELIVERY_BANNER,
	WEEKLY_DISCOUNT_BANNER,
	MY_SUBSCRIPTION_HEADER,
	ACCOUNT_SUBSCRIPTION_HEADER,
	formatActiveSubscriptionsSubtitle,
	UPCOMING_BOXES_HEADER,
	ACCOUNT_INFO_BANNER,
	ACCOUNT_PROFILE,
	SUBSCRIPTION_MANAGEMENT,
	CREATE_SUBSCRIPTION_BANNER,
	ORDERS_BANNER,
	ORDER_DETAILS_HEADER,
	ORDER_DETAILS_BANNER,
	ORDER_CONVERT_BANNER,
	VIEW_BOX_NEXT_CARD,
	SUBSCRIPTION_ACTIONS_HEADER,
	SUBSCRIPTION_ACTION_CARDS,
	PAYMENT_BANNER,
	addPaymentCardSchema,
	cardLast4,
	CANCEL_POPUP_STEPS,
	MANAGE_DELIVERY_ESTIMATE,
	SKIP_DELIVERY_WINDOW,
	generateDeliveryDates,
	toDateParts,
	DEFAULT_DELIVERY_DATE_COUNT,
} from './data/index.js';

/* Public surface for Pro (portal-core) — import these from the barrel only. */
export { CardStatusBadge } from './components/meal-card/CardStatusBadge.jsx';
export { EmptyState } from './components/EmptyState.jsx';
export { PageLoader } from './components/PageLoader.jsx';
export { AnnouncementBanner } from './components/AnnouncementBanner.jsx';
export { ensureCalendarStyles } from './styles/ensureCalendarStyles.js';
export { ensurePortalPopupStyles } from './styles/ensurePortalPopupStyles.js';
export { findDateIndex } from './utils/delivery/index.js';
export {
	formatDeliveryFrequency,
	getSelectableFrequencyOptions,
	getSubscriptionFrequencyOptionId,
} from './utils/delivery/frequency.js';
export { fetchShopProducts } from './api/wc.js';
export { getPortal, portalAjax } from './api/portal.js';
export { boxLinesToPersistPayload } from './utils/cartLines.js';
export { useSaveSubscriptionBox } from './store/useSaveSubscriptionBox.js';
export { findCartLineForProduct } from './utils/cartLines.js';
export { getPortalCurrency } from './utils/portalCurrency.js';
export { mapStoreProductsToCatalog } from './utils/shopProducts.js';
export { subscriptionLocation } from './utils/subscriptionNavigation.js';
export {
	WEEKDAY_HEADERS,
	earliestSelectableDeliveryDate,
	earliestSelectableDeliveryDateId,
	formatDeliveryBannerDate,
	formatMonthTitle,
	getMonthGrid,
	parseDateId,
	toDateId,
} from './utils/monthCalendar.js';
export {
	listOffersForReasons,
	resolveOfferStep,
	shouldShowOfferAfterReasons,
	offerNeedsCustomerChoice,
	buildOfferConfigureStep,
	buildOfferAppliedStep,
} from './data/popupContent.js';
