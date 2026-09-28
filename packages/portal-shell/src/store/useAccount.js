import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	deletePortalAvatar,
	syncWindowBootstrap,
	updatePortalAccount,
	updatePortalAvatar,
} from '../api/portal.js';
import { __ } from '@stayilo/design-system/i18n';
import { ACCOUNT_PROFILE } from '../data/accountInfo.js';
import {
	selectAccount,
	selectAccountError,
	selectAccountSaving,
	selectAvatarSaving,
	selectAvatarUrl,
	setAccount,
	setAccountError,
	setAccountSaving,
	setAvatarSaving,
	setAvatarUrl,
} from './accountSlice.js';

/**
 * Customer account profile + header avatar (Redux).
 */
export function useAccount() {
	const dispatch = useDispatch();
	const account = useSelector( selectAccount );
	const avatarUrl = useSelector( selectAvatarUrl );
	const saving = useSelector( selectAccountSaving );
	const avatarSaving = useSelector( selectAvatarSaving );
	const error = useSelector( selectAccountError );

	const applyAccount = useCallback(
		( next ) => {
			dispatch( setAccount( next ) );
			const url = next?.user?.avatarUrl;
			dispatch( setAvatarUrl( typeof url === 'string' ? url : '' ) );
			syncWindowBootstrap( { account: next } );
			return next;
		},
		[ dispatch ]
	);

	const saveAccount = useCallback(
		async ( patch ) => {
			dispatch( setAccountSaving( true ) );
			dispatch( setAccountError( null ) );
			try {
				const next = await updatePortalAccount( patch );
				return applyAccount( next );
			} catch ( err ) {
				dispatch(
					setAccountError( err?.message || __( 'Failed to save account', 'stayilo' ) )
				);
				throw err;
			} finally {
				dispatch( setAccountSaving( false ) );
			}
		},
		[ applyAccount, dispatch ]
	);

	const updateAvatar = useCallback(
		async ( file ) => {
			if ( ! ( typeof File !== 'undefined' && file instanceof File ) ) {
				return;
			}

			const previous = avatarUrl;
			const preview = URL.createObjectURL( file );
			dispatch( setAvatarSaving( true ) );
			dispatch( setAccountError( null ) );
			dispatch( setAvatarUrl( preview ) );

			try {
				const next = await updatePortalAvatar( file );
				return applyAccount( next );
			} catch ( err ) {
				dispatch( setAvatarUrl( previous ) );
				dispatch(
					setAccountError( err?.message || __( 'Failed to update photo', 'stayilo' ) )
				);
				throw err;
			} finally {
				URL.revokeObjectURL( preview );
				dispatch( setAvatarSaving( false ) );
			}
		},
		[ applyAccount, avatarUrl, dispatch ]
	);

	const resetAvatar = useCallback( async () => {
		dispatch( setAvatarSaving( true ) );
		dispatch( setAccountError( null ) );
		try {
			const next = await deletePortalAvatar();
			return applyAccount( next );
		} catch ( err ) {
			dispatch(
				setAccountError( err?.message || __( 'Failed to delete photo', 'stayilo' ) )
			);
			throw err;
		} finally {
			dispatch( setAvatarSaving( false ) );
		}
	}, [ applyAccount, dispatch ] );

	const firstName = useMemo( () => {
		const raw =
			account?.user?.firstName ||
			account?.user?.displayName ||
			account?.user?.fullName ||
			'';
		return String( raw ).split( ' ' )[ 0 ];
	}, [ account ] );

	return {
		account,
		firstName,
		saving,
		avatarSaving,
		error,
		saveAccount,
		setAccount: ( next ) => dispatch( setAccount( next ) ),
		avatarUrl,
		avatarAlt: ACCOUNT_PROFILE.avatarAlt,
		isDefaultAvatar: ! avatarUrl || avatarUrl === ( ACCOUNT_PROFILE.avatarUrl || '' ),
		updateAvatar,
		resetAvatar,
	};
}
