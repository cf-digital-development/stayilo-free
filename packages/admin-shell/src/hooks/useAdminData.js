import { useCallback, useEffect, useState } from 'react';
import {
	fetchDashboardRaw,
	fetchPortalSettingsRaw,
	fetchSubscribersRaw,
	isWpAdmin,
	savePortalSettings,
} from '../api/wp-admin.js';
import { formatCurrency, formatGrowth } from '../domain/metrics.js';
import { querySubscriberRows } from '../domain/subscribers.js';
import {
	normalizePortalSettings,
	transformDashboard,
	transformSettings,
	transformSubscribers,
} from '../transforms/admin-data.js';
import { MOCK_ACTIVITY, MOCK_SUBSCRIBERS } from '../data/mock.js';

const MOCK_METRICS = {
	activeSubscribers: 48,
	subscriberGrowth: 12,
	revenue: 0,
	revenueChange: 480,
	currencySymbol: '£',
	freeSubscriberCap: 50,
};

export function useDashboardData() {
	const [ view, setView ] = useState( null );
	const [ loading, setLoading ] = useState( isWpAdmin() );
	const [ error, setError ] = useState( null );

	useEffect( () => {
		if ( ! isWpAdmin() ) {
			return;
		}

		let cancelled = false;

		fetchDashboardRaw()
			.then( ( raw ) => {
				if ( ! cancelled ) {
					setView( transformDashboard( raw ) );
				}
			} )
			.catch( ( err ) => {
				if ( ! cancelled ) {
					setError( err.message );
				}
			} )
			.finally( () => {
				if ( ! cancelled ) {
					setLoading( false );
				}
			} );

		return () => {
			cancelled = true;
		};
	}, [] );

	const metrics = view?.metrics || MOCK_METRICS;
	const symbol = metrics.currencySymbol || '£';

	// Live WP admin: use API activity (may be empty). Mock only outside WordPress.
	const activity = isWpAdmin()
		? view?.activity || []
		: view?.activity?.length
			? view.activity
			: MOCK_ACTIVITY;

	return {
		loading,
		error,
		metrics,
		// undefined outside WP → chart keeps decorative fallback series
		subscriptions: isWpAdmin() ? view?.subscriptions || [] : undefined,
		activeCount: view?.meta?.activeCount,
		activity,
		totalLogsCount: view?.totalLogsCount ?? 0,
		formatCurrency: ( amount ) => formatCurrency( amount, symbol ),
		formatGrowth: ( value, _symbol, type ) => formatGrowth( value, symbol, type ),
	};
}

export function useSubscribers( { page = 1, perPage = 15, search = '', status = 'all' } = {} ) {
	const [ raw, setRaw ] = useState( null );
	const [ loading, setLoading ] = useState( isWpAdmin() );
	const [ error, setError ] = useState( null );

	const load = useCallback( () => {
		if ( ! isWpAdmin() ) {
			setLoading( false );
			return;
		}

		setLoading( true );
		setError( null );

		fetchSubscribersRaw( { status: 'all' } )
			.then( setRaw )
			.catch( ( err ) => setError( err.message ) )
			.finally( () => setLoading( false ) );
	}, [] );

	useEffect( () => {
		load();
	}, [ load ] );

	const view = raw
		? transformSubscribers( raw, { page, perPage, search, status } )
		: null;

	const mockView = querySubscriberRows(
		MOCK_SUBSCRIBERS.map( ( sub ) => ( {
			...sub,
			nextRenewal: sub.renewal,
			price: sub.mrr,
			lastActivity: sub.lastActivity || '—',
			raw: sub,
		} ) ),
		{ page, perPage, search, status }
	);

	const resolved = isWpAdmin() ? view : mockView;
	const items = resolved?.items ?? [];
	const filteredItems = resolved?.filtered ?? items;

	return {
		loading,
		error,
		items,
		filteredItems,
		total: resolved?.total ?? items.length,
		page: resolved?.page ?? page,
		perPage: resolved?.perPage ?? perPage,
		totalPages: resolved?.totalPages ?? 1,
		counts: resolved?.counts,
		reload: load,
	};
}

function filterAllRows( raw ) {
	if ( ! raw?.subscriptions ) {
		return [];
	}
	return ( raw.subscriptions || [] ).map( ( sub ) => ( {
		status: sub.status,
		raw: sub,
	} ) );
}

export function usePortalSettings() {
	const [ settings, setSettings ] = useState( null );
	const [ loading, setLoading ] = useState( isWpAdmin() );
	const [ saving, setSaving ] = useState( false );
	const [ error, setError ] = useState( null );

	useEffect( () => {
		if ( ! isWpAdmin() ) {
			setSettings( normalizePortalSettings() );
			setLoading( false );
			return;
		}

		let cancelled = false;

		fetchPortalSettingsRaw()
			.then( ( raw ) => {
				if ( ! cancelled ) {
					setSettings( transformSettings( raw ).settings );
				}
			} )
			.catch( ( err ) => {
				if ( ! cancelled ) {
					setError( err.message );
				}
			} )
			.finally( () => {
				if ( ! cancelled ) {
					setLoading( false );
				}
			} );

		return () => {
			cancelled = true;
		};
	}, [] );

	const save = async () => {
		if ( ! isWpAdmin() || ! settings ) {
			return;
		}

		setSaving( true );
		setError( null );

		try {
			const saved = await savePortalSettings( settings );
			setSettings( normalizePortalSettings( saved ) );
		} catch ( err ) {
			setError( err.message );
		} finally {
			setSaving( false );
		}
	};

	return {
		settings,
		setSettings,
		loading,
		saving,
		error,
		save,
	};
}
