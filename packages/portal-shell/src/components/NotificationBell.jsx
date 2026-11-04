import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ReactComponent as BellIcon } from '@stayilo/design-system/assets/svg/Bell.svg';
import { usePortalNotifications } from '../store/usePortalNotifications.js';
import { BrandedIcon } from './BrandedIcon.jsx';
import { __ } from '@stayilo/design-system/i18n';

const PANEL_BASE =
	'transition-[opacity,transform] duration-[800ms] ease-out motion-reduce:transition-none';
const PANEL_OPEN = 'pointer-events-auto opacity-100 translate-y-0 scale-100';
const PANEL_CLOSED =
	'pointer-events-none opacity-0 -translate-y-1 scale-[0.98]';
const PANEL_WIDTH = 320;
const PANEL_GAP = 8;
const PANEL_EDGE = 8;

function useAnimatedOpen( open, durationMs = 800 ) {
	const [ mounted, setMounted ] = useState( open );
	const [ visible, setVisible ] = useState( open );

	useEffect( () => {
		if ( open ) {
			setMounted( true );
			const id = window.requestAnimationFrame( () => {
				window.requestAnimationFrame( () => setVisible( true ) );
			} );
			return () => window.cancelAnimationFrame( id );
		}

		setVisible( false );
		const timeout = window.setTimeout( () => setMounted( false ), durationMs );
		return () => window.clearTimeout( timeout );
	}, [ open, durationMs ] );

	return { mounted, visible };
}

function useClickOutside( open, onClose, rootRef ) {
	const stableClose = useCallback( () => onClose(), [ onClose ] );

	useEffect( () => {
		if ( ! open ) {
			return undefined;
		}

		const onPointer = ( event ) => {
			if ( rootRef.current && ! rootRef.current.contains( event.target ) ) {
				stableClose();
			}
		};

		const onKey = ( event ) => {
			if ( event.key === 'Escape' ) {
				stableClose();
			}
		};

		document.addEventListener( 'mousedown', onPointer );
		document.addEventListener( 'keydown', onKey );
		return () => {
			document.removeEventListener( 'mousedown', onPointer );
			document.removeEventListener( 'keydown', onKey );
		};
	}, [ open, stableClose, rootRef ] );
}

/**
 * Keep the panel fixed under the bell, flush to the icon’s right edge.
 *
 * @param {boolean} open
 * @param {React.RefObject<HTMLElement|null>} anchorRef
 * @returns {{ top: number, left: number, width: number } | null}
 */
function useAnchoredPanelStyle( open, anchorRef ) {
	const [ style, setStyle ] = useState( null );

	useLayoutEffect( () => {
		if ( ! open ) {
			setStyle( null );
			return undefined;
		}

		const update = () => {
			const el = anchorRef.current;
			if ( ! el ) {
				return;
			}
			const rect = el.getBoundingClientRect();
			const width = Math.min( PANEL_WIDTH, window.innerWidth - PANEL_EDGE * 2 );
			let left = rect.right - width;
			if ( left < PANEL_EDGE ) {
				left = PANEL_EDGE;
			}
			if ( left + width > window.innerWidth - PANEL_EDGE ) {
				left = Math.max( PANEL_EDGE, window.innerWidth - PANEL_EDGE - width );
			}
			setStyle( {
				top: rect.bottom + PANEL_GAP,
				left,
				width,
			} );
		};

		update();
		window.addEventListener( 'resize', update );
		window.addEventListener( 'scroll', update, true );
		return () => {
			window.removeEventListener( 'resize', update );
			window.removeEventListener( 'scroll', update, true );
		};
	}, [ open, anchorRef ] );

	return style;
}

/**
 * Portal header notification bell + popover (admin-style).
 */
export function NotificationBell() {
	const [ open, setOpen ] = useState( false );
	const { items, unreadCount, refresh, markAllRead } = usePortalNotifications();
	const close = useCallback( () => setOpen( false ), [] );
	const rootRef = useRef( null );
	const buttonRef = useRef( null );
	useClickOutside( open, close, rootRef );
	const { mounted, visible } = useAnimatedOpen( open );
	const panelStyle = useAnchoredPanelStyle( open, buttonRef );

	useEffect( () => {
		if ( open ) {
			refresh();
		}
	}, [ open, refresh ] );

	return (
		<div className="portal-header-bell" ref={ rootRef }>
			<button
				ref={ buttonRef }
				type="button"
				className="portal-icon-btn portal-header-tool"
				aria-label={ __( 'Notifications', 'stayilo' ) }
				aria-haspopup="dialog"
				aria-expanded={ open }
				onClick={ () => setOpen( ( prev ) => ! prev ) }
			>
				<BrandedIcon name="bell" width={ 24 } height={ 24 } className="portal-header-tool-icon">
					<BellIcon
						width={ 24 }
						height={ 24 }
						aria-hidden="true"
						className="portal-header-tool-icon"
					/>
				</BrandedIcon>
				{ unreadCount > 0 ? (
					<span
						className="portal-header-bell-dot"
						aria-hidden="true"
					/>
				) : null }
			</button>
			{ mounted && panelStyle ? (
				<div
					role="dialog"
					aria-label={ __( 'Notifications', 'stayilo' ) }
					style={ {
						position: 'fixed',
						top: panelStyle.top,
						left: panelStyle.left,
						width: panelStyle.width,
						zIndex: 1200,
						transformOrigin: 'top right',
					} }
					className={ [
						'overflow-hidden rounded-2xl border border-[#1010101A] bg-white shadow-lg',
						PANEL_BASE,
						visible ? PANEL_OPEN : PANEL_CLOSED,
					].join( ' ' ) }
				>
					<div className="flex items-center justify-between border-b border-[#1010101A] px-4 py-3">
						<p className="m-0 text-sm font-semibold text-[#101010]">
							Notifications
							{ unreadCount > 0 ? (
								<span className="ml-2 rounded-full bg-[#EEF2FF] px-2 py-0.5 text-xs font-medium text-[#4F46E5]">
									{ unreadCount } new
								</span>
							) : null }
						</p>
						{ unreadCount > 0 ? (
							<button
								type="button"
								className="border-0 bg-transparent p-0 text-xs font-medium text-[#4F46E5] shadow-none transition-opacity hover:underline hover:opacity-80"
								onClick={ markAllRead }
							>
								{ __( 'Mark all read', 'stayilo' ) }
							</button>
						) : null }
					</div>
					{ items.length === 0 ? (
						<p className="m-0 px-4 py-8 text-center text-sm text-[#7C8494]">
							{ __( 'No notifications yet.', 'stayilo' ) }
						</p>
					) : (
						<ul className="m-0 max-h-[320px] list-none overflow-y-auto p-0">
							{ items.map( ( item ) => (
								<li
									key={ item.id }
									className={ [
										'border-b border-[#1010100A] px-4 py-3 last:border-b-0',
										item.unread ? 'bg-[#F8FAFC]' : 'bg-white',
									].join( ' ' ) }
								>
									<div className="flex items-start gap-2">
										{ item.unread ? (
											<span
												className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#16A34A]"
												aria-hidden="true"
											/>
										) : (
											<span
												className="mt-1.5 h-1.5 w-1.5 shrink-0"
												aria-hidden="true"
											/>
										) }
										<div className="min-w-0 flex-1">
											<p className="m-0 text-sm font-semibold text-[#101010]">
												{ item.title }
											</p>
											<p className="m-0 mt-0.5 text-xs leading-4 text-[#7C8494]">
												{ item.body }
											</p>
											{ item.time ? (
												<p className="m-0 mt-1 text-[11px] text-[#9AA3B2]">
													{ item.time }
												</p>
											) : null }
										</div>
									</div>
								</li>
							) ) }
						</ul>
					) }
				</div>
			) : null }
		</div>
	);
}
