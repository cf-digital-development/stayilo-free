function getAdminConfig() {
	return typeof window !== 'undefined' ? window.stayiloAdmin || {} : {};
}

export function isWpAdmin() {
	const admin = getAdminConfig();
	return Boolean( admin.ajaxUrl && admin.dashboardNonce );
}

async function postAdminAction( action, payload = {} ) {
	const admin = getAdminConfig();

	if ( ! admin.ajaxUrl || ! admin.dashboardNonce ) {
		throw new Error( 'WordPress admin API is not available.' );
	}

	const body = new URLSearchParams( {
		action,
		nonce: admin.dashboardNonce,
		...payload,
	} );

	const response = await fetch( admin.ajaxUrl, {
		method: 'POST',
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
		},
		body,
	} );

	const json = await response.json();

	if ( ! json?.success ) {
		throw new Error( json?.data?.message || 'Request failed.' );
	}

	return json.data;
}

export function fetchAdminData( context, payload = {} ) {
	return postAdminAction( 'stayilo_admin_data', {
		context,
		...payload,
	} );
}

export function fetchDashboardRaw() {
	return fetchAdminData( 'dashboard' );
}

export function fetchSubscribersRaw( { status = 'all' } = {} ) {
	return fetchAdminData( 'subscribers', { status } );
}

export function fetchPortalSettingsRaw() {
	return fetchAdminData( 'settings' );
}

export function savePortalSettings( settings ) {
	const payload = {
		skipDelivery: settings.skipDelivery ? '1' : '0',
		updateAddress: settings.updateAddress ? '1' : '0',
	};

	// Only send Core+ toggles when the caller actually provided them — Free
	// Settings only edits skip/update and must not wipe allowReactivation etc.
	const optionalKeys = [
		'showOrderHistory',
		'allowReactivation',
	];
	optionalKeys.forEach( ( key ) => {
		if ( Object.prototype.hasOwnProperty.call( settings, key ) ) {
			payload[ key ] = settings[ key ] ? '1' : '0';
		}
	} );

	if ( Object.prototype.hasOwnProperty.call( settings, 'subscriptionMode' ) ) {
		payload.subscriptionMode =
			settings.subscriptionMode === 'multiple' ? 'multiple' : 'single';
	}

	return postAdminAction( 'stayilo_save_portal_settings', payload ).then(
		( data ) => data?.settings || data
	);
}

export function dismissUpgradeBanner() {
	if ( ! isWpAdmin() ) {
		return Promise.resolve( { dismissed: true } );
	}

	return postAdminAction( 'stayilo_dismiss_upgrade_banner' ).then( ( data ) => {
		if ( typeof window !== 'undefined' && window.stayiloAdmin ) {
			window.stayiloAdmin.upgradeBannerDismissed = true;
		}
		return data;
	} );
}

export function saveSubscriptionMode( mode = 'single' ) {
	return postAdminAction( 'stayilo_save_subscription_mode', {
		subscriptionMode: mode === 'multiple' ? 'multiple' : 'single',
	} );
}

export function fetchPortalBrandingRaw() {
	return fetchAdminData( 'branding' );
}

export function savePortalBranding( branding = {} ) {
	return postAdminAction( 'stayilo_save_portal_branding', {
		brandName: branding.brandName || '',
		logoUrl: branding.logoUrl || '',
		brandColor: branding.brandColor || '',
		accentColor: branding.accentColor || '',
		buttonColor: branding.buttonColor || '',
		colors: JSON.stringify( branding.colors || {} ),
		icons: JSON.stringify( branding.icons || {} ),
		template: branding.template || '',
		font: branding.font || '',
		bannerEnabled: branding.bannerEnabled ? '1' : '0',
		bannerText: branding.bannerText || '',
		bannerColor: branding.bannerColor || '',
		bannerLink: branding.bannerLink || '',
	} ).then( ( data ) => {
		const saved = data?.branding || data;
		if ( typeof window !== 'undefined' && window.stayiloAdmin && saved ) {
			window.stayiloAdmin.branding = {
				...( window.stayiloAdmin.branding || {} ),
				...saved,
			};
			if ( saved.logoUrl ) {
				window.stayiloAdmin.siteLogoUrl = saved.logoUrl;
			}
		}
		return saved;
	} );
}

function postSubscriptionAction( action, subscriptionId, extra = {} ) {
	return postAdminAction( action, {
		subscription_id: String( subscriptionId ),
		...extra,
	} );
}

export function adminSkipSubscription( subscriptionId ) {
	return postSubscriptionAction( 'stayilo_admin_skip_subscription', subscriptionId );
}

export function adminChangeSubscriptionDate( subscriptionId, nextPaymentDate ) {
	return postSubscriptionAction( 'stayilo_admin_change_subscription_date', subscriptionId, {
		next_payment_date: nextPaymentDate,
	} );
}

export function adminPauseSubscription( subscriptionId, mode = '', extra = {} ) {
	return postSubscriptionAction( 'stayilo_admin_pause_subscription', subscriptionId, {
		mode,
		...extra,
	} );
}

export function adminCancelSubscription( subscriptionId, extra = {} ) {
	return postSubscriptionAction( 'stayilo_admin_cancel_subscription', subscriptionId, extra );
}

export function adminEditSubscriptionItems( subscriptionId, items ) {
	return postSubscriptionAction( 'stayilo_admin_edit_subscription_items', subscriptionId, {
		items: JSON.stringify( items ),
	} );
}

export function fetchEmailTemplatesRaw() {
	return fetchAdminData( 'emails' );
}

export function saveEmailTemplates( payload ) {
	return postAdminAction( 'stayilo_save_email_templates', {
		payload: JSON.stringify( payload ),
	} );
}

export function sendTestEmail( templateId, to = '' ) {
	return postAdminAction( 'stayilo_send_test_email', {
		template_id: templateId,
		to,
	} );
}
