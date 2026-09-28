import { useCallback, useEffect, useRef, useState } from 'react';
import { ReactComponent as BellIcon } from '../assets/svg/BellSimple.svg';
import { ReactComponent as CaretDownIcon } from '../assets/svg/CaretDown.svg';
import {
	applyPersistedReadState,
	markNotificationsRead,
} from '../domain/notifications.js';

export const DATE_RANGE_OPTIONS = [
	{ id: '7d', label: 'Last 7 days' },
	{ id: '30d', label: 'Last 30 days' },
	{ id: '90d', label: 'Last 90 days' },
	{ id: 'ytd', label: 'This year' },
];

const PANEL_BASE =
	'origin-top-right transition-[opacity,transform] duration-[800ms] ease-out motion-reduce:transition-none';
const PANEL_OPEN = 'pointer-events-auto opacity-100 translate-y-0 scale-100';
const PANEL_CLOSED =
	'pointer-events-none opacity-0 -translate-y-1 scale-[0.98]';

/**
 * Keep popover mounted through exit animation.
 *
 * @param {boolean} open
 * @param {number} [durationMs=800]
 */
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

function useClickOutside( open, onClose ) {
	const rootRef = useRef( null );
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
	}, [ open, stableClose ] );

	return rootRef;
}

/**
 * Dashboard date-range menu — matches header chip styling.
 *
 * @param {{ value: string, onChange: (id: string) => void }} props
 */
function DateRangeDropdown( { value, onChange } ) {
	const [ open, setOpen ] = useState( false );
	const close = useCallback( () => setOpen( false ), [] );
	const rootRef = useClickOutside( open, close );
	const { mounted, visible } = useAnimatedOpen( open );
	const selected =
		DATE_RANGE_OPTIONS.find( ( option ) => option.id === value ) ||
		DATE_RANGE_OPTIONS[ 1 ];

	return (
		<div className="relative hidden md:block" ref={ rootRef }>
			<button
				type="button"
				aria-haspopup="listbox"
				aria-expanded={ open }
				aria-label="Select date range"
				onClick={ () => setOpen( ( prev ) => ! prev ) }
				className="inline-flex items-center gap-2 rounded-xl border border-[#0D11171A] bg-white px-3 py-[9px] text-sm font-medium leading-5 text-[#0D1117] transition-colors hover:bg-stayilo-surface"
			>
				{ selected.label }
				<CaretDownIcon
					width={ 16 }
					height={ 16 }
					aria-hidden="true"
					className={ [
						'transition-transform duration-[800ms] ease-out',
						open ? 'rotate-[-180deg]' : 'rotate-0',
					].join( ' ' ) }
				/>
			</button>
			{ mounted ? (
				<ul
					role="listbox"
					className={ [
						'absolute right-0 z-30 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-[#0D11171A] bg-white py-1 shadow-sm',
						PANEL_BASE,
						visible ? PANEL_OPEN : PANEL_CLOSED,
					].join( ' ' ) }
				>
					{ DATE_RANGE_OPTIONS.map( ( option ) => {
						const active = option.id === value;
						return (
							<li key={ option.id }>
								<button
									type="button"
									role="option"
									aria-selected={ active }
									className={ [
										'flex w-full whitespace-nowrap border-0 px-3 py-2 text-left text-sm shadow-none transition-colors',
										active
											? 'bg-[#0D1117] text-white'
											: 'bg-white text-[#0D1117] hover:bg-[#F3F4F6]',
									].join( ' ' ) }
									onClick={ () => {
										onChange( option.id );
										setOpen( false );
									} }
								>
									{ option.label }
								</button>
							</li>
						);
					} ) }
				</ul>
			) : null }
		</div>
	);
}

/**
 * Notification bell + popover card.
 *
 * @param {{
 *   items?: Array<{ id: string, title: string, body: string, time: string, unread?: boolean }>,
 * }} props
 */
function NotificationBell( { items = [] } ) {
	const [ open, setOpen ] = useState( false );
	const [ notifications, setNotifications ] = useState( () =>
		applyPersistedReadState( Array.isArray( items ) ? items : [] )
	);
	const close = useCallback( () => setOpen( false ), [] );
	const rootRef = useClickOutside( open, close );
	const { mounted, visible } = useAnimatedOpen( open );
	const unreadCount = notifications.filter( ( item ) => item.unread ).length;

	useEffect( () => {
		setNotifications(
			applyPersistedReadState( Array.isArray( items ) ? items : [] )
		);
	}, [ items ] );

	const markAllRead = () => {
		markNotificationsRead(
			notifications.map( ( item ) => item.id ).filter( Boolean )
		);
		setNotifications( ( prev ) =>
			prev.map( ( item ) => ( { ...item, unread: false } ) )
		);
	};

	return (
		<div className="relative hidden md:block" ref={ rootRef }>
			<button
				type="button"
				className="relative inline-flex border border-[#0D11171A] h-[40px] w-[40px] items-center justify-center rounded-xl bg-white text-[#7C8494] transition-colors hover:bg-stayilo-surface"
				aria-label="Notifications"
				aria-haspopup="dialog"
				aria-expanded={ open }
				onClick={ () => setOpen( ( prev ) => ! prev ) }
			>
				<BellIcon width={ 20 } height={ 20 } aria-hidden="true" />
				{ unreadCount > 0 ? (
					<span className="absolute right-[10px] top-[6px] h-1.5 w-1.5 rounded-full border border-white bg-[#16A34A]" />
				) : null }
			</button>
			{ mounted ? (
				<div
					role="dialog"
					aria-label="Notifications"
					className={ [
						'absolute right-0 z-30 mt-2 w-[320px] overflow-hidden rounded-2xl border border-[#0D11171A] bg-white shadow-lg',
						PANEL_BASE,
						visible ? PANEL_OPEN : PANEL_CLOSED,
					].join( ' ' ) }
				>
					<div className="flex items-center justify-between border-b border-[#0D11171A] px-4 py-3">
						<p className="m-0 text-sm font-semibold text-[#0D1117]">
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
								Mark all read
							</button>
						) : null }
					</div>
					{ notifications.length === 0 ? (
						<p className="m-0 px-4 py-8 text-center text-sm text-[#7C8494]">
							No notifications yet.
						</p>
					) : (
						<ul className="m-0 max-h-[320px] list-none overflow-y-auto p-0">
							{ notifications.map( ( item ) => (
								<li
									key={ item.id }
									className={ [
										'border-b border-[#0D11170A] px-4 py-3 last:border-b-0 transition-colors',
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
											<p className="m-0 text-sm font-semibold text-[#0D1117]">
												{ item.title }
											</p>
											<p className="m-0 mt-0.5 text-xs leading-4 text-[#7C8494]">
												{ item.body }
											</p>
											<p className="m-0 mt-1 text-[11px] text-[#9AA3B2]">
												{ item.time }
											</p>
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

/**
 * Search + notifications + date range for the Dashboard page header.
 *
 * @param {{
 *   dateRange: string,
 *   onDateRangeChange: (id: string) => void,
 *   notifications?: Array<{ id: string, title: string, body: string, time: string, unread?: boolean }>,
 * }} props
 */
export function DashboardHeaderActions( {
	dateRange,
	onDateRangeChange,
	notifications = [],
} ) {
	return (
		<div className="flex h-full max-h-10 items-center gap-2">
			<NotificationBell items={ notifications } />
			<DateRangeDropdown value={ dateRange } onChange={ onDateRangeChange } />
		</div>
	);
}
