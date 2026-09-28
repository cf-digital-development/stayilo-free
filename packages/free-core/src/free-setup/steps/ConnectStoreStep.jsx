import { useState } from 'react';
import { __, sprintf } from '@stayilo/design-system/i18n';
import { useFormikContext } from 'formik';
import { Button } from '@stayilo/design-system/buttons';
import { TextField } from '@stayilo/design-system/text-field';
import { SuccessBadgeIcon } from '@stayilo/design-system/status-card';
import { ReactComponent as CheckIcon } from '@stayilo/design-system/assets/svg/Check.svg';
import { ReactComponent as AtEmailIcon } from '@stayilo/design-system/assets/svg/@email.svg';
import { FREE_PLAN_SUBSCRIBER_LIMIT } from '../config/constants';
import {
	getFieldError,
	getStoreUrlError,
	isValidStoreUrl,
	persistStoreConnection,
} from '../validation';

/**
 * Connect store step — URL validation, admin email, connect action, success summary.
 *
 * @param {object} [props]
 * @param {boolean} [props.showFreePlanNote=true]
 * @param {boolean} [props.showSubscriberLimit=true]
 */
export default function ConnectStoreStep( {
	showFreePlanNote = true,
	showSubscriberLimit = true,
} ) {
	const { values, errors, touched, setFieldValue, setFieldTouched, setFieldError } =
		useFormikContext();
	const [ connecting, setConnecting ] = useState( false );
	const [ connectFailed, setConnectFailed ] = useState( false );
	const [ urlTouched, setUrlTouched ] = useState( false );

	const formatError = urlTouched || connectFailed ? getStoreUrlError( values.storeUrl ) : undefined;
	const storeUrlError =
		touched.storeUrl || connectFailed
			? getFieldError( errors, 'storeUrl' ) || formatError
			: formatError;
	const adminEmailError =
		touched.adminEmail ? getFieldError( errors, 'adminEmail' ) : undefined;
	const connectError =
		touched.storeConnected && ! values.storeConnected
			? getFieldError( errors, 'storeConnected' )
			: undefined;
	const fieldError =
		storeUrlError ||
		connectError ||
		( connectFailed ? __( 'Could not connect to your store. Check the URL and try again.', 'stayilo' ) : undefined );
	const urlValid = isValidStoreUrl( values.storeUrl );

	const resetConnection = () => {
		setConnectFailed( false );
		setFieldError( 'storeUrl', undefined );
		setFieldError( 'storeConnected', undefined );
		if ( values.storeConnected ) {
			setFieldValue( 'storeConnected', false );
			setFieldValue( 'subscriberCount', null );
		}
	};

	return (
		<div className="stayilo-stack-16">
			<TextField
				label={ __( 'Store URL', 'stayilo' ) }
				name="storeUrl"
				value={ values.storeUrl }
				onChange={ ( event ) => {
					setFieldValue( 'storeUrl', event.target.value );
					resetConnection();
				} }
				placeholder="https://cfdigital.co.uk"
				error={ fieldError }
				invalid={ Boolean( fieldError ) }
				success={ values.storeConnected }
				disabled={ connecting }
				inputProps={ {
					onBlur: () => {
						setUrlTouched( true );
						setFieldTouched( 'storeUrl', true, false );
					},
				} }
			/>

			<TextField
				label={ __( 'Email', 'stayilo' ) }
				name="adminEmail"
				type="email"
				value={ values.adminEmail }
				onChange={ ( event ) => {
					setFieldValue( 'adminEmail', event.target.value );
					setFieldError( 'adminEmail', undefined );
				} }
				placeholder="you@example.com"
				// startIcon={ <AtIcon className="block h-4 w-4" aria-hidden="true" /> }
				startIcon={ <AtEmailIcon aria-hidden="true" /> }
				error={ adminEmailError }
				invalid={ Boolean( adminEmailError ) } 
				disabled={ connecting }
				inputProps={ {
					autoComplete: 'email',
					onBlur: () => setFieldTouched( 'adminEmail', true, false ),
				} }
			/>

			<label className="flex cursor-pointer items-start gap-3 text-left">
				<input
					type="checkbox"
					className="stayilo-subscriber-checkbox mt-0.5 shrink-0"
					checked={ Boolean( values.marketingOptIn ) }
					onChange={ ( event ) =>
						setFieldValue( 'marketingOptIn', event.target.checked )
					}
					disabled={ connecting }
				/>
				<span className="font-inter text-sm leading-5 text-[#474C57]">
					{ __( 'Email me tips and product updates from Stayilo. You can unsubscribe anytime.', 'stayilo' ) }{ ' ' }
					<span className="text-[#7C8494]">
						{ __( 'Your email and store URL are only sent to Stayilo if you opt in.', 'stayilo' ) }
					</span>
				</span>
			</label>

			<Button
				text={
					values.storeConnected
						? __( 'Connected', 'stayilo' )
						: connecting
							? __( 'Connecting…', 'stayilo' )
							: __( 'Connect store', 'stayilo' )
				}
				direction={ values.storeConnected ? undefined : 'next' }
				icon={ values.storeConnected ? <CheckIcon className="block h-4 w-4" /> : undefined }
				iconPosition="right"
				active={ values.storeConnected || ( urlValid && ! connecting ) }
				disabled={ connecting || values.storeConnected || ! urlValid }
				onClick={ handleConnect }
				className="w-full !min-w-0"
			/>

			{ values.storeConnected ? (
				<div
					className="rounded-xl border border-[#16A34A33] bg-stayilo-accent-soft p-4"
					role="status"
				>
					<div className="flex items-start gap-3">
						<div className="shrink-0 pt-0.5" aria-hidden="true">
							<SuccessBadgeIcon />
						</div>
						<div className="min-w-0 flex-1">
							<p className="stayilo-type-title-md m-0 text-stayilo-accent">
								{ __( 'Store connected', 'stayilo' ) }
							</p>
							<p className="stayilo-type-body-muted m-0 mt-1">
								{ sprintf(
									/* translators: %s: number of active subscribers. */
									__( 'Stayilo found %s active subscribers in WooCommerce.', 'stayilo' ),
									String( values.subscriberCount ?? 0 )
								) }
								{ showSubscriberLimit
									? ' ' + sprintf(
										/* translators: %s: Free plan subscriber limit. */
										__( 'The Free plan manages up to %s.', 'stayilo' ),
										String( FREE_PLAN_SUBSCRIBER_LIMIT )
									)
									: '' }
							</p>
							{ showFreePlanNote ? (
								<div className="mt-3 rounded-lg border border-[#FED7AA] bg-[#FFF7ED] p-3">
									<p className="m-0 font-inter text-xs leading-4 text-[#973C00]">
										<strong>{ __( 'Free plan note:', 'stayilo' ) }</strong>{ ' ' }
										{ __( 'The subscriber portal will use default Stayilo branding. No branding customization or email setup in the Free plan.', 'stayilo' ) }
									</p>
								</div>
							) : null }
						</div>
					</div>
				</div>
			) : null }
		</div>
	);

	async function handleConnect() {
		setUrlTouched( true );
		setFieldTouched( 'storeUrl', true, false );
		setFieldTouched( 'adminEmail', true, false );
		setConnectFailed( false );
		setFieldError( 'storeUrl', undefined );
		setFieldError( 'storeConnected', undefined );
		setFieldError( 'adminEmail', undefined );

		const validationError = getStoreUrlError( values.storeUrl );
		if ( validationError ) {
			setFieldError( 'storeUrl', validationError );
			return;
		}

		const email = String( values.adminEmail || '' ).trim();
		if ( ! email || ! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email ) ) {
			setFieldError( 'adminEmail', __( 'Enter a valid email', 'stayilo' ) );
			return;
		}

		setConnecting( true );
		try {
			const saved = await persistStoreConnection( {
				storeUrl: values.storeUrl,
				adminEmail: email,
				marketingOptIn: Boolean( values.marketingOptIn ),
			} );
			setFieldValue( 'storeConnected', true );
			setFieldValue( 'subscriberCount', saved.subscriberCount );
		} catch ( error ) {
			setConnectFailed( true );
			setFieldValue( 'storeConnected', false );
			setFieldValue( 'subscriberCount', null );
			if ( error?.message ) {
				setFieldError( 'storeUrl', error.message );
			}
		} finally {
			setConnecting( false );
		}
	}
}
