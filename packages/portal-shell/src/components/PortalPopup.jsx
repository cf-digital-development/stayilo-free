import { useEffect, useState } from 'react';
import { ReactComponent as XIcon } from '@stayilo/design-system/assets/svg/X.svg';
import { lockBodyScroll } from '../utils/lockBodyScroll.js';
import { Button } from './Button.jsx';
import { NavArrowIcon } from './NavArrowIcon.jsx';
import { __ } from '@stayilo/design-system/i18n';

/** Keep in sync with `.portal-popup--closing` / overlay exit duration in portal.css */
const EXIT_MS = 420;

/**
 * Shared portal modal — icon, title, body, optional option list, and action buttons.
 * Opens / steps slide in from the top; close slides out to the top.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} [props.onClose]
 * @param {import('react').ReactNode} [props.icon]
 * @param {string} [props.title]
 * @param {string|import('react').ReactNode} [props.description]
 * @param {Array<{ id: string, label: string }>} [props.options]
 * @param {string[]} [props.selectedOptionIds]
 * @param {(ids: string[]) => void} [props.onOptionChange]
 * @param {'single'|'multi'} [props.optionMode='single']
 * @param {Array<{
 *   label: string,
 *   variant?: 'primary'|'secondary'|'chip'|'success'|'danger'|'dangerOutline',
 *   onClick?: Function,
 *   showIcon?: boolean,
 *   icon?: import('react').ReactNode,
 *   disabled?: boolean,
 *   className?: string,
 * }>} [props.actions]
 * @param {import('react').ReactNode} [props.children]
 * @param {string} [props.className]
 * @param {string} [props.contentClassName]
 * @param {string} [props.descriptionClassName] - Extra classes on the description. Default styles stay in `.portal-popup__description`.
 * @param {string|number} [props.stepKey] - When set, panel re-slides from top on step change.
 */
export function PortalPopup( {
	open,
	onClose,
	icon,
	title,
	description,
	options = [],
	selectedOptionIds = [],
	onOptionChange,
	optionMode = 'single',
	actions = [],
	children,
	className = '',
	contentClassName = '',
	descriptionClassName = '',
	stepKey,
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

		return () => {
			window.removeEventListener( 'keydown', onKeyDown );
		};
	}, [ visible, closing, onClose ] );

	if ( ! visible ) {
		return null;
	}

	const toggleOption = ( optionId ) => {
		if ( ! onOptionChange ) {
			return;
		}

		if ( optionMode === 'multi' ) {
			const next = selectedOptionIds.includes( optionId )
				? selectedOptionIds.filter( ( id ) => id !== optionId )
				: [ ...selectedOptionIds, optionId ];
			onOptionChange( next );
			return;
		}

		onOptionChange(
			selectedOptionIds[ 0 ] === optionId ? [] : [ optionId ]
		);
	};

	const handleOverlayClose = () => {
		if ( ! closing ) {
			onClose?.();
		}
	};

	const panelKey = stepKey != null ? String( stepKey ) : 'panel';

	return (
		<div
			className={ [
				'portal-popup-overlay',
				closing ? 'portal-popup-overlay--closing' : '',
				className,
			].filter( Boolean ).join( ' ' ) }
			role="presentation"
			onClick={ handleOverlayClose }
		>
			<div
				key={ panelKey }
				className={ [
					'portal-popup',
					closing ? 'portal-popup--closing' : '',
					contentClassName,
				].filter( Boolean ).join( ' ' ) }
				role="dialog"
				aria-modal="true"
				aria-labelledby={ title ? 'portal-popup-title' : undefined }
				aria-describedby={ description ? 'portal-popup-description' : undefined }
				onClick={ ( event ) => event.stopPropagation() }
			>
				{ onClose ? (
					<button
						type="button"
						className="portal-popup__close"
						aria-label={ __( 'Close', 'stayilo' ) }
						disabled={ closing }
						onClick={ handleOverlayClose }
					>
						<XIcon
							width={ 20 }
							height={ 20 }
							aria-hidden="true"
							className="portal-popup__close-icon"
						/>
					</button>
				) : null }

				<div className="portal-popup__body">
					{ icon ? (
						<div className="portal-popup__icon" aria-hidden="true">
							{ icon }
						</div>
					) : null }

					{ title ? (
						<h2 id="portal-popup-title" className="portal-popup__title">
							{ title }
						</h2>
					) : null }

					{ description ? (
						<div
							id="portal-popup-description"
							className={ [
								'portal-popup__description',
								descriptionClassName,
							]
								.filter( Boolean )
								.join( ' ' ) }
						>
							{ description }
						</div>
					) : null }

					{ options.length > 0 ? (
						<ul className="portal-popup__options" role="list">
							{ options.map( ( option ) => {
								const checked = selectedOptionIds.includes( option.id );
								return (
									<li key={ option.id }>
										<label className="portal-popup__option">
											<input
												type={ optionMode === 'multi' ? 'checkbox' : 'radio' }
												name="portal-popup-option"
												className="sr-only"
												checked={ checked }
												onChange={ () => {} }
												onClick={ ( event ) => {
													// Radios don't fire change when re-clicked; click lets single-select uncheck.
													event.preventDefault();
													toggleOption( option.id );
												} }
											/>
											<span
												className={ [
													'portal-popup__check',
													checked ? 'portal-popup__check--checked' : '',
												].filter( Boolean ).join( ' ' ) }
												aria-hidden="true"
											>
												{ checked ? (
													<svg width="24" height="24" viewBox="0 0 12 12" fill="none">
														<path
															d="M2.5 6.2L4.8 8.5L9.5 3.5"
															stroke="white"
															strokeWidth="1.6"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</svg>
												) : null }
											</span>
											<span
												className={ [
													'portal-popup__option-label',
													checked ? 'portal-popup__option-label--checked' : '',
												].filter( Boolean ).join( ' ' ) }
											>
												{ option.label }
											</span>
										</label>
									</li>
								);
							} ) }
						</ul>
					) : null }

					{ children }

					{ actions.length > 0 ? (
						<div className="portal-popup__actions">
							{ actions.map( ( action, index ) => (
								<Button
									key={ `${ action.label }-${ index }` }
									label={ action.label }
									variant={ action.variant ?? 'primary' }
									showIcon={ action.showIcon !== false }
									icon={
										action.icon ?? (
											<NavArrowIcon
												width={ 24 }
												height={ 24 }
												className={
													action.variant === 'dangerOutline' ||
													action.variant === 'secondary'
														? 'text-current'
														: 'text-white'
												}
											/>
										)
									}
									onClick={ action.onClick }
									disabled={ action.disabled }
									loading={ action.loading }
									className={ [
										'portal-popup__action',
										action.className,
									].filter( Boolean ).join( ' ' ) }
								/>
							) ) }
						</div>
					) : null }
				</div>
			</div>
		</div>
	);
}
