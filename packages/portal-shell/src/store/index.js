import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
	FLUSH,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
	REHYDRATE,
	createTransform,
	persistReducer,
	persistStore,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import accountReducer, {
	ACCOUNT_AVATAR_STORAGE_KEY,
	isPersistedAvatarUrl,
} from './accountSlice.js';
import { ACCOUNT_PROFILE } from '../data/accountInfo.js';
import cartReducer from './cartSlice.js';
import ordersReducer from './ordersSlice.js';
import paymentReducer from './paymentSlice.js';
import subscriptionsReducer from './subscriptionsSlice.js';
import { writeStorageJson } from '../utils/localStorageState.js';

/** Persist avatar URL from WordPress; drop leftover in-browser data URLs. */
const accountAvatarTransform = createTransform(
	( inboundState, key ) => {
		if ( key === 'avatarUrl' ) {
			const next = isPersistedAvatarUrl( inboundState )
				? inboundState
				: ACCOUNT_PROFILE.avatarUrl || '';
			writeStorageJson( ACCOUNT_AVATAR_STORAGE_KEY, next );
			return next;
		}
		return inboundState;
	},
	( outboundState, key ) => {
		if ( key === 'avatarUrl' ) {
			return isPersistedAvatarUrl( outboundState )
				? outboundState
				: ACCOUNT_PROFILE.avatarUrl || '';
		}
		return outboundState;
	},
	{ whitelist: [ 'avatarUrl' ] }
);

const accountPersistConfig = {
	key: 'stayilo-portal-account',
	storage,
	whitelist: [ 'avatarUrl' ],
	transforms: [ accountAvatarTransform ],
};

const rootReducer = combineReducers( {
	cart: cartReducer,
	account: persistReducer( accountPersistConfig, accountReducer ),
	subscriptions: subscriptionsReducer,
	orders: ordersReducer,
	payment: paymentReducer,
} );

export const store = configureStore( {
	reducer: rootReducer,
	middleware: ( getDefaultMiddleware ) =>
		getDefaultMiddleware( {
			serializableCheck: {
				ignoredActions: [ FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER ],
			},
		} ),
} );

export const persistor = persistStore( store );
