/**
 * @param {object} [admin]
 */
export function getFreePlanInitialValues( admin = window.stayiloAdmin || {} ) {
	const storeUrl =
		admin.storeUrl ||
		admin.siteUrl ||
		( admin.siteUrl && admin.portalPath
			? admin.siteUrl.replace( /\/$/, '' )
			: '' ) ||
		'';

	return {
		storeUrl,
		adminEmail: admin.merchantEmail || admin.adminEmail || '',
		marketingOptIn: Boolean( admin.marketingOptIn ),
		storeConnected: Boolean( admin.storeConnected ),
		subscriberCount: admin.subscriberCount ?? null,
		mode: admin.subscriptionMode === 'multiple' ? 'multiple' : 'single',
	};
}
