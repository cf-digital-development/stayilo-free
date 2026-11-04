/**
 * Inject PortalPopup + calendar-popup styles once.
 * Needed when portal popups are used outside portal-shell (e.g. live-fetched
 * admin-core), where portal.css is not loaded.
 */
const STYLE_ID = 'stayilo-portal-popup-styles';

const POPUP_CSS = `
@keyframes portal-popup-slide {
	from { opacity: 0; transform: translateY(-100%); }
	to { opacity: 1; transform: translateY(0); }
}
@keyframes portal-popup-slide-out {
	from { opacity: 1; transform: translateY(0); }
	to { opacity: 0; transform: translateY(-100%); }
}
@keyframes portal-popup-overlay {
	from { opacity: 0; }
	to { opacity: 1; }
}
@keyframes portal-popup-overlay-out {
	from { opacity: 1; }
	to { opacity: 0; }
}
.portal-popup-overlay {
	position: fixed;
	inset: 0;
	z-index: 100;
	display: flex;
	align-items: flex-start;
	justify-content: center;
	overflow-y: auto;
	background: rgba(0, 0, 0, 0.45);
	padding: 0;
	animation: portal-popup-overlay 380ms ease-out;
}
.portal-popup-overlay--closing {
	animation: portal-popup-overlay-out 380ms ease-out forwards;
	pointer-events: none;
}
.portal-popup-overlay--center {
	align-items: center;
}
.portal-popup-overlay--above-admin {
	z-index: 100001;
}
.portal-popup {
	position: relative;
	width: 100%;
	max-width: none;
	overflow-y: auto;
	border-radius: 0;
	background: #FAF8F2;
	padding: 2.5rem 1.25rem;
	box-shadow: 0px 50px 111px 0px rgba(0, 0, 0, 0.1);
	max-height: 100dvh;
	animation: portal-popup-slide 420ms ease-out;
}
.portal-popup--closing {
	animation: portal-popup-slide-out 420ms ease-out forwards;
}
.portal-popup--calendar {
	margin: 2.5rem 1rem;
	width: 100%;
	max-width: 600px;
	align-self: center;
	overflow-y: auto;
	overflow-x: hidden;
	border-radius: 1rem;
	background: #fff;
	padding: 1.5rem;
	box-shadow: 0px 24px 64px rgba(0, 0, 0, 0.18);
	max-height: min(100dvh - 2rem, 720px);
}
@media (min-width: 1024px) {
	.portal-popup--calendar {
		padding: 2rem;
	}
}
.portal-popup--calendar .portal-popup__body {
	max-width: none;
	align-items: stretch;
	text-align: center;
}
.portal-popup--calendar .portal-popup__title {
	padding-left: 2rem;
	padding-right: 2rem;
	font-size: 28px;
	font-weight: 700;
	line-height: 2rem;
}
@media (min-width: 640px) {
	.portal-popup--calendar .portal-popup__title {
		font-size: 32px;
		line-height: 2.5rem;
	}
}
.portal-popup--calendar .portal-popup__description {
	margin-top: 0.5rem;
	font-size: 0.875rem;
	font-weight: 400;
	line-height: 1.25rem;
}
@media (min-width: 640px) {
	.portal-popup--calendar .portal-popup__description {
		font-size: 1rem;
		line-height: 1.5rem;
	}
}
.portal-popup--calendar .portal-popup__close {
	right: 1rem;
	top: 1rem;
	height: 2.25rem;
	width: 2.25rem;
	background: #F2F2F2;
}
.portal-popup--calendar .portal-popup__actions {
	margin-top: 1.75rem;
	gap: 0.75rem;
}
@media (min-width: 640px) {
	.portal-popup--calendar .portal-popup__actions {
		flex-direction: row;
	}
}
.portal-popup--calendar .portal-popup__action {
	width: 100% !important;
	flex: 1;
	border-radius: 0.75rem !important;
	padding: 0.875rem 1rem !important;
	font-size: 1rem !important;
}
.portal-popup--calendar .portal-popup__action--calendar-apply {
	background: #047946 !important;
}
.portal-popup--calendar .portal-popup__action--calendar-apply:hover:not(:disabled) {
	background: #036b3d !important;
}
.portal-popup--calendar .portal-popup__action--calendar-apply-black {
	background: #101010 !important;
}
.portal-popup--calendar .portal-popup__action--calendar-apply-black:hover:not(:disabled) {
	background: #2a2a2a !important;
}
.portal-popup__close {
	position: absolute;
	right: 1.5rem;
	top: 1.5rem;
	display: inline-flex;
	height: 3rem;
	width: 3rem;
	align-items: center;
	justify-content: center;
	border-radius: 9999px;
	border: 0;
	background: #fff;
	padding: 0;
	line-height: 1;
	cursor: pointer;
	transition: opacity 0.15s;
}
.portal-popup__close:hover {
	opacity: 0.8;
}
.portal-popup__close-icon {
	display: block;
	width: 1.25rem;
	height: 1.25rem;
	flex-shrink: 0;
	color: #06021F;
}
.portal-popup__close-icon path {
	stroke: currentColor;
}
.portal-popup--calendar .portal-popup__close-icon {
	width: 20px;
	height: 20px;
}
.portal-popup__body {
	margin-left: auto;
	margin-right: auto;
	display: flex;
	width: 100%;
	max-width: 800px;
	flex-direction: column;
	align-items: center;
	text-align: center;
}
.portal-popup__title {
	margin: 0;
	padding-left: 3.5rem;
	padding-right: 3.5rem;
	font-size: 1.25rem;
	font-weight: 700;
	line-height: 2rem;
}
.portal-popup__description {
	margin: 0.5rem 0 0;
	font-size: 1.125rem;
	font-weight: 400;
	line-height: 1.75rem;
	color: rgba(16, 16, 16, 0.8);
}
.portal-popup__actions {
	margin-top: 2rem;
	display: flex;
	width: 100%;
	flex-direction: column;
	gap: 0.75rem;
}
@media (min-width: 640px) {
	.portal-popup__actions {
		flex-direction: row;
		justify-content: center;
	}
}
.portal-popup__action {
	width: 100% ;
	justify-content: center;
}
.portal-btn {
	display: inline-flex;
	width: 100%;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	border-radius: 10px;
	padding: 1rem 1.5rem;
	font-size: 0.875rem;
	font-weight: 700;
	line-height: 1.75rem;
	transition: color 0.15s, background-color 0.15s, filter 0.15s;
	cursor: pointer;
}
@media (min-width: 640px) {
	.portal-btn {
		width: auto;
		font-size: 1.125rem;
	}
}
.portal-btn:disabled {
	cursor: not-allowed;
}
.portal-btn--primary {
	background: var(--stayilo-button, #101010);
	color: var(--stayilo-button-contrast, #ffffff);
}
.portal-btn--primary:disabled {
	opacity: 0.4;
}
.portal-btn--primary.portal-muted-action,
.portal-btn--primary.portal-muted-action:disabled,
.portal-btn--secondary.portal-muted-action,
.portal-btn--secondary.portal-muted-action:disabled,
.portal-btn.portal-muted-action,
.portal-muted-action,
.portal-muted-action:disabled {
	opacity: 1 !important;
	filter: none !important;
	background: #00000066 !important;
	color: rgba(255, 255, 255, 0.4) !important;
	border-color: transparent !important;
}
.portal-muted-action svg {
	color: rgba(255, 255, 255, 0.4) !important;
	opacity: 1 !important;
}
.portal-btn--primary:hover:not(:disabled) {
	filter: brightness(1.12);
}
.portal-btn--secondary {
	border: 1px solid rgba(16, 16, 16, 0.2);
	padding-top: 15px;
	padding-bottom: 15px;
	background: #fff;
	color: #101010;
}
.portal-btn--secondary:hover:not(:disabled) {
	background: #f3f4f6;
}
.portal-btn--success {
	background: #047946;
	color: #fff;
}
.portal-btn--success:hover:not(:disabled) {
	background: #036b3d;
}
.portal-btn--success:disabled {
	background: rgba(4, 121, 70, 0.4);
}
.portal-btn--loading {
	opacity: 0.9;
}
.portal-spinner {
	display: inline-block;
	height: 2rem;
	width: 2rem;
	flex-shrink: 0;
	border-radius: 9999px;
	border: 2px solid #e5e7eb;
	border-top-color: #101010;
	animation: portal-spin 0.7s linear infinite;
}
.portal-spinner--btn {
	height: 1.25rem;
	width: 1.25rem;
	border-color: currentColor;
	border-top-color: transparent;
}
@keyframes portal-spin {
	to { transform: rotate(360deg); }
}
`;

export function ensurePortalPopupStyles() {
	if ( typeof document === 'undefined' ) {
		return;
	}
	if ( document.getElementById( STYLE_ID ) ) {
		return;
	}
	const style = document.createElement( 'style' );
	style.id = STYLE_ID;
	style.textContent = POPUP_CSS;
	document.head.appendChild( style );
}
