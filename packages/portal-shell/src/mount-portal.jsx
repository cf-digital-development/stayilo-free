import React from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import * as ReactJSXRuntime from 'react/jsx-runtime';
import * as ReactRouter from 'react-router';
import * as ReactRouterDOM from 'react-router-dom';
import * as ReactRedux from 'react-redux';
import * as ReduxToolkit from '@reduxjs/toolkit';
import '@stayilo/design-system/styles/styles.css';
import './styles/portal.css';
/* Unlayered (after portal.css @layer) so theme button styles cannot override muted days. */
import './styles/calendar.css';
import { PortalApp } from './PortalApp.jsx';

// Paid portal-core is live-fetched with these as window externals.
window.React = window.React || React;
window.ReactDOM = window.ReactDOM || ReactDOM;
window.ReactDOMClient = window.ReactDOMClient || { createRoot };
window.ReactJSXRuntime = window.ReactJSXRuntime || ReactJSXRuntime;
window.ReactRouter = window.ReactRouter || ReactRouter;
window.ReactRouterDOM = window.ReactRouterDOM || ReactRouterDOM;
window.ReactRedux = window.ReactRedux || ReactRedux;
window.ReduxToolkit = window.ReduxToolkit || ReduxToolkit;

const admin = window.stayiloPortal || {};
const id = admin.portalMountId || 'stayilo-portal-root';
const el = document.getElementById( id );

if ( el && el.dataset.stayiloMounted !== '1' ) {
	el.dataset.stayiloMounted = '1';
	createRoot( el ).render(
		<PortalApp
			brandName={ admin.brandName || admin.siteName }
			logoUrl={ admin.logoUrl }
			accountUrl={ admin.accountUrl }
		/>
	);
}
