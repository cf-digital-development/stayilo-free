import { useCallback, useEffect, useState } from 'react';
import {
	fetchPortalNotifications,
	syncWindowBootstrap,
} from '../api/portal.js';
import {
	applyPersistedReadState,
	getBootstrapNotifications,
	markNotificationsRead,
} from '../domain/notifications.js';

/**
 * Portal notification list + mark-read helpers.
 */
export function usePortalNotifications() {
	const [ items, setItems ] = useState( () => getBootstrapNotifications() );
	const [ loading, setLoading ] = useState( false );

	const applyItems = useCallback( ( next ) => {
		const normalized = applyPersistedReadState(
			Array.isArray( next ) ? next : []
		);
		setItems( normalized );
		syncWindowBootstrap( { notifications: next } );
	}, [] );

	const refresh = useCallback( async () => {
		setLoading( true );
		try {
			const data = await fetchPortalNotifications();
			applyItems( data?.notifications );
		} catch {
			/* keep existing list */
		} finally {
			setLoading( false );
		}
	}, [ applyItems ] );

	useEffect( () => {
		const onFocus = () => {
			refresh();
		};
		window.addEventListener( 'stayilo-portal-bootstrap', onFocus );
		return () => {
			window.removeEventListener( 'stayilo-portal-bootstrap', onFocus );
		};
	}, [ refresh ] );

	const markAllRead = useCallback( () => {
		markNotificationsRead( items.map( ( item ) => item.id ).filter( Boolean ) );
		setItems( ( prev ) =>
			prev.map( ( item ) => ( { ...item, unread: false } ) )
		);
	}, [ items ] );

	return {
		items,
		loading,
		refresh,
		markAllRead,
		unreadCount: items.filter( ( item ) => item.unread ).length,
	};
}
