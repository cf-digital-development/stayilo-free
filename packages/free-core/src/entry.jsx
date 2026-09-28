import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as ReactJSXRuntime from 'react/jsx-runtime';
import * as ReactRouter from 'react-router';
import * as ReactRouterDOM from 'react-router-dom';
import { seedMerchantPremium } from '@stayilo/admin-shell';
import { ADMIN_MOUNT_ID } from './mount-config.js';
import { mountStayiloFreeAdmin } from './mount-admin.jsx';

// Same React + Router instance for live-fetched Core/Growth bundles.
window.React = React;
window.ReactDOM = ReactDOM;
window.ReactDOMClient = ReactDOMClient;
window.ReactJSXRuntime = ReactJSXRuntime;
window.ReactRouter = ReactRouter;
window.ReactRouterDOM = ReactRouterDOM;

seedMerchantPremium();

const root = document.getElementById( ADMIN_MOUNT_ID );
if ( root ) {
	try {
		mountStayiloFreeAdmin( root );
	} catch ( err ) {
		console.error( '[stayilo/free-core] Admin mount failed:', err );
	}
} else {
	console.warn(
		`[stayilo/free-core] Admin mount skipped — no element with id="${ ADMIN_MOUNT_ID }". ` +
			'Add that div to the page or set window.stayiloAdmin.adminMountId before index.js loads.'
	);
}
