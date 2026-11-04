import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ReactComponent as XIcon } from '../assets/svg/X.svg';

const EXIT_MS = 420;

function lockBodyScroll() {
	if ( typeof document === 'undefined' ) {
		return () => {};
	}

	const { body } = document;
	const previousOverflow = body.style.overflow;
	body.style.overflow = 'hidden';
	return () => {
		body.style.overflow = previousOverflow;
	};
}

export function AdminCenterModal( {
	open,
	onClose,
	title,
	titleClassName = 'text-stayilo-ink',
	description,
	subscriberLabel,
	children,
	footer,
	panelClassName = 'max-w-[420px]',
	footerClassName = 'justify-end',
} ) {
	const [ visible, setVisible ] = useState( open );
	const [ closing, setClosing ] = useState( false );

	useEffect( () => {
		if ( open ) {
			setVisible( true );
			setClosing( false );
			return undefined;
		}

		if ( ! visible ) {
			return undefined;
		}

		setClosing( true );
		const timeoutId = window.setTimeout( () => {
			setVisible( false );
			setClosing( false );
		}, EXIT_MS );

		return () => window.clearTimeout( timeoutId );
	}, [ open, visible ] );

	useEffect( () => {
		if ( ! visible ) {
			return undefined;
		}
		return lockBodyScroll();
	}, [ visible ] );

	useEffect( () => {
		if ( ! visible ) {
			return undefined;
		}

		const onKeyDown = ( event ) => {
			if ( event.key === 'Escape' && ! closing ) {
				onClose?.();
			}
		};

		window.addEventListener( 'keydown', onKeyDown );
		return () => window.removeEventListener( 'keydown', onKeyDown );
	}, [ visible, closing, onClose ] );

	if ( ! visible || typeof document === 'undefined' ) {
		return null;
	}

	const handleOverlayClose = () => {
		if ( ! closing ) {
			onClose?.();
		}
	};

	const subtitle = description || subscriberLabel;

	return createPortal(
		<div
			className={ [
				'stayilo-admin-modal-overlay',
				closing ? 'is-closing' : '',
			].join( ' ' ) }
			role="presentation"
			onClick={ handleOverlayClose }
		>
			<div
				className={ [
					'stayilo-admin-modal-panel relative w-full overflow-y-auto  max-h-[calc(100vh-48px)] rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]',
					panelClassName,
				].join( ' ' ) }
				role="dialog"
				aria-modal="true"
				aria-labelledby="stayilo-admin-modal-title"
				onClick={ ( event ) => event.stopPropagation() }
			>
				<div className="flex items-center justify-between gap-4 border-b border-[#0D11171A] px-5 py-4">
					<div className="min-w-0">
						<h2
							id="stayilo-admin-modal-title"
							className={ `text-base font-semibold leading-6  text-stayilo-ink ${ titleClassName }` }
						>
							{ title }
						</h2>
						{ subtitle ? (
							<p className="mt-0.5 text-xs leading-[18px] text-[#7C8494] capitalize">{ subtitle }</p>
						) : null }
					</div>
					<button
						type="button"
						aria-label="Close"
						disabled={ closing }
						onClick={ handleOverlayClose }
						className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-stayilo-muted hover:bg-[#F7F8FA]"
					>
						<XIcon
							width={ 24}
							height={ 24 }
							className="[&_path]:stroke-current"
							// style={ { transform: 'translate(-2px, -2.5px)' } }
							aria-hidden="true"
						/>
					</button>
				</div>

				<div className="p-5">{ children }</div>

				{ footer ? (
					<div className={ `flex items-center gap-2 px-5 pb-5 ${ footerClassName }` }>
						{ footer }
					</div>
				) : null }
			</div>
		</div>,
		document.body
	);
}
