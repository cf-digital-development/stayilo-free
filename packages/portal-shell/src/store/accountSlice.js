import { createSlice } from '@reduxjs/toolkit';
import { getBootstrapFromWindow } from '../api/portal.js';
import { ACCOUNT_PROFILE } from '../data/accountInfo.js';
import { readStorageJson } from '../utils/localStorageState.js';

const ACCOUNT_AVATAR_STORAGE_KEY = 'portal-shell:account-avatar';

export function emptyAccount() {
	return {
		user: {
			id: 0,
			email: '',
			firstName: '',
			lastName: '',
			displayName: '',
			fullName: '',
			avatarUrl: '',
			avatarAlt: '',
		},
		billing: {},
		shipping: {},
	};
}

function seedAccount() {
	const seed = getBootstrapFromWindow();
	return seed?.account || emptyAccount();
}

function isPersistedAvatarUrl( value ) {
	if ( typeof value !== 'string' || value.length === 0 ) {
		return false;
	}
	if ( value.startsWith( 'data:' ) || value.startsWith( 'blob:' ) ) {
		return false;
	}
	return (
		/^https?:\/\//i.test( value ) ||
		value.startsWith( '//' ) ||
		value.startsWith( '/' )
	);
}

function seedAvatarUrl() {
	const account = seedAccount();
	const fromWp = account?.user?.avatarUrl;
	if ( isPersistedAvatarUrl( fromWp ) ) {
		return fromWp;
	}
	const stored = readStorageJson( ACCOUNT_AVATAR_STORAGE_KEY );
	if ( isPersistedAvatarUrl( stored ) ) {
		return stored;
	}
	return ACCOUNT_PROFILE.avatarUrl || '';
}

const accountSlice = createSlice( {
	name: 'account',
	initialState: {
		data: seedAccount(),
		avatarUrl: seedAvatarUrl(),
		saving: false,
		avatarSaving: false,
		error: null,
	},
	reducers: {
		setAccount( state, action ) {
			state.data = action.payload || emptyAccount();
		},
		setAccountSaving( state, action ) {
			state.saving = Boolean( action.payload );
		},
		setAccountError( state, action ) {
			state.error = action.payload ?? null;
		},
		setAvatarSaving( state, action ) {
			state.avatarSaving = Boolean( action.payload );
		},
		setAvatarUrl( state, action ) {
			const next = action.payload;
			state.avatarUrl =
				typeof next === 'string' && next.length > 0
					? next
					: ACCOUNT_PROFILE.avatarUrl || '';
		},
		resetAvatarUrl( state ) {
			state.avatarUrl = ACCOUNT_PROFILE.avatarUrl || '';
		},
		applyBootstrapAccount( state, action ) {
			if ( ! action.payload ) {
				return;
			}
			state.data = action.payload;
			const url = action.payload?.user?.avatarUrl;
			state.avatarUrl = isPersistedAvatarUrl( url )
				? url
				: ACCOUNT_PROFILE.avatarUrl || '';
		},
	},
} );

export const {
	setAccount,
	setAccountSaving,
	setAccountError,
	setAvatarSaving,
	setAvatarUrl,
	resetAvatarUrl,
	applyBootstrapAccount,
} = accountSlice.actions;

export const selectAccount = ( state ) => state.account.data;
export const selectAvatarUrl = ( state ) => state.account.avatarUrl;
export const selectAccountSaving = ( state ) => state.account.saving;
export const selectAvatarSaving = ( state ) => state.account.avatarSaving;
export const selectAccountError = ( state ) => state.account.error;

export { ACCOUNT_AVATAR_STORAGE_KEY, isPersistedAvatarUrl };

export default accountSlice.reducer;
