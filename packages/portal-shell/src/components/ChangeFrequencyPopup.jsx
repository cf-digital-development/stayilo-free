import { useEffect, useMemo, useState } from 'react';
import { PortalPopup } from './PortalPopup.jsx';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import {
	formatDeliveryFrequency,
	getSelectableFrequencyOptions,
	getSubscriptionFrequencyOptionId,
} from '../utils/delivery/frequency.js';
import { __, sprintf } from '@stayilo/design-system/i18n';

function classicOptionLabel( option ) {
	if ( option.period === 'week' && Number( option.interval ) === 1 ) {
		return __( 'Every week', 'stayilo' );
	}
	if ( option.period === 'month' && Number( option.interval ) === 1 ) {
		return __( 'Every month', 'stayilo' );
	}
	return option.label;
}

function classicOptionMeta( option ) {
	const interval = Math.max( 1, Number( option.interval ) || 1 );
	const period = String( option.period || 'week' ).toLowerCase();
	if ( period === 'week' ) {
		const days = interval * 7;
		return sprintf( __( '%d days', 'stayilo' ), days );
	}
	if ( period === 'day' ) {
		return interval === 1 ? __( '1 day', 'stayilo' ) : sprintf( __( '%d days', 'stayilo' ), interval );
	}
	if ( period === 'month' ) {
		return interval === 1 ? __( '1 month', 'stayilo' ) : sprintf( __( '%d months', 'stayilo' ), interval );
	}
	return '';
}

export function ChangeFrequencyPopup( {
	open,
	onClose,
	subscription,
	onConfirm,
} ) {
	const { id } = useTemplateRecipe();
	const currentLabel = useMemo(
		() => formatDeliveryFrequency( subscription ),
		[ subscription ]
	);
	const options = useMemo(
		() => getSelectableFrequencyOptions( subscription ),
		[ subscription ]
	);
	const [ selectedOptionIds, setSelectedOptionIds ] = useState( [] );
	const [ submitting, setSubmitting ] = useState( false );

	useEffect( () => {
		if ( ! open ) {
			return;
		}
		const currentId = getSubscriptionFrequencyOptionId( subscription );
		const known = options.find( ( option ) => option.id === currentId );
		setSelectedOptionIds( known ? [ known.id ] : [] );
		setSubmitting( false );
	}, [ open, options, subscription ] );

	const selected = options.find( ( option ) =>
		selectedOptionIds.includes( option.id )
	);
	const currentId = getSubscriptionFrequencyOptionId( subscription );
	const confirmDisabled =
		! selected ||
		submitting ||
		selected.id === currentId ||
		options.length === 0;

	const handleConfirm = async () => {
		if ( ! selected || submitting ) {
			return;
		}
		setSubmitting( true );
		try {
			await onConfirm?.( selected );
		} finally {
			setSubmitting( false );
		}
	};

	if ( id === 'classic' ) {
		return (
			<PortalPopup
				open={ open }
				onClose={ onClose }
				className="portal-popup-overlay--frequency"
				contentClassName="portal-popup--frequency"
				title={ __( 'Delivery frequency', 'stayilo' ) }
				description={ __( 'Choose how often your box arrives. You can change this again anytime.', 'stayilo' ) }
				actions={ [
					{
						label: __( 'Confirm new frequency', 'stayilo' ),
						variant: 'primary',
						disabled: confirmDisabled,
						loading: submitting,
						onClick: handleConfirm,
						className: 'portal-popup__action--frequency-confirm',
					},
					{
						label: __( 'Cancel', 'stayilo' ),
						variant: 'secondary',
						showIcon: false,
						disabled: submitting,
						onClick: onClose,
						className: 'portal-popup__action--frequency-cancel',
					},
				] }
			>
				<ul className="portal-frequency-list" role="listbox">
					{ options.map( ( option ) => {
						const selectedOption = selectedOptionIds.includes( option.id );
						const isCurrent = option.id === currentId;
						const description = String(
							option.description || ''
						).trim();
						const meta = classicOptionMeta( option );
						return (
							<li key={ option.id }>
								<button
									type="button"
									role="option"
									aria-selected={ selectedOption }
									className={ [
										'portal-frequency-option',
										selectedOption
											? 'portal-frequency-option--selected'
											: '',
										isCurrent
											? 'portal-frequency-option--current'
											: '',
									]
										.filter( Boolean )
										.join( ' ' ) }
									onClick={ () =>
										setSelectedOptionIds( [ option.id ] )
									}
								>
									<span
										className={ [
											'portal-frequency-option__check',
											selectedOption
												? 'portal-frequency-option__check--checked'
												: '',
										]
											.filter( Boolean )
											.join( ' ' ) }
										aria-hidden="true"
									>
										{ selectedOption ? (
											<svg
												width="12"
												height="12"
												viewBox="0 0 12 12"
												fill="none"
											>
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
									<span className="portal-frequency-option__copy">
										<span className="portal-frequency-option__title-row">
											<span className="portal-frequency-option__title">
												{ classicOptionLabel( option ) }
											</span>
											{ isCurrent ? (
												<span className="portal-frequency-option__badge">
													{ __( 'Current', 'stayilo' ) }
												</span>
											) : null }
										</span>
										{ description ? (
											<span className="portal-frequency-option__desc">
												{ description }
											</span>
										) : null }
									</span>
									{ meta ? (
										<span className="portal-frequency-option__meta">
											{ meta }
										</span>
									) : null }
								</button>
							</li>
						);
					} ) }
				</ul>
			</PortalPopup>
		);
	}

	return (
		<PortalPopup
			open={ open }
			onClose={ onClose }
			title={ __( 'Order frequency', 'stayilo' ) }
			description={
				currentLabel
					? sprintf( __( 'Current frequency: %s. Choose a new order interval.', 'stayilo' ), currentLabel )
					: __( 'Choose how often you receive orders.', 'stayilo' )
			}
			options={ options.map( ( option ) => ( {
				id: option.id,
				label: option.label,
			} ) ) }
			selectedOptionIds={ selectedOptionIds }
			onOptionChange={ setSelectedOptionIds }
			optionMode="single"
			actions={ [
				{
					className: 'w-full',
					label: __( 'Confirm', 'stayilo' ),
					variant: 'primary',
					disabled: confirmDisabled,
					loading: submitting,
					onClick: handleConfirm,
				},
			] }
		/>
	);
}
