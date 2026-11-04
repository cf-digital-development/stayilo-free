import { useEffect, useRef, useState } from 'react';
import { Formik, Form } from 'formik';
import { ReactComponent as CloudArrowUpIcon } from '@stayilo/design-system/assets/svg/CloudArrowUp.svg';
import { ReactComponent as TrashIcon } from '@stayilo/design-system/assets/svg/delete.svg';
import { Button } from './Button.jsx';
import { Field } from './Field.jsx';
import { NavArrowIcon } from './NavArrowIcon.jsx';
import { useAccount } from '../store/useAccount.js';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import {
	accountPasswordSchema,
	accountProfileSchema,
} from '../utils/validation/accountSchemas.js';
import { __ } from '@stayilo/design-system/i18n';

const EMPTY_PASSWORD_VALUES = {
	currentPassword: '',
	newPassword: '',
	confirmPassword: '',
};

const MAX_AVATAR_BYTES = 1_000_000;

/**
 * About you + Password account cards (Formik + Yup).
 * Profile, password, and avatar persist via Stayilo portal AJAX.
 *
 * @param {object} [props]
 * @param {(values: { fullName: string, email: string }) => void} [props.onSaveProfile]
 * @param {(values: { currentPassword: string, newPassword: string, confirmPassword: string }) => void} [props.onChangePassword]
 * @param {(avatarUrl: string) => void} [props.onUpdateAvatar]
 * @param {() => void} [props.onDeleteAvatar]
 * @param {string} [props.avatarUrl]
 * @param {string} [props.avatarAlt]
 * @param {boolean} [props.isDefaultAvatar]
 * @param {(file: File) => void|Promise<void>} [props.updateAvatar]
 * @param {() => void|Promise<void>} [props.resetAvatar]
 */
export function AccountDetailsCards( {
	onSaveProfile,
	onChangePassword,
	onUpdateAvatar,
	onDeleteAvatar,
	avatarUrl = '',
	avatarAlt = 'Account',
	isDefaultAvatar = true,
	updateAvatar,
	resetAvatar,
} = {} ) {
	const { account, saveAccount, saving } = useAccount();
	const { id } = useTemplateRecipe();
	const isClassic = id === 'classic';
	const user = account?.user || {};
	const displayAvatarUrl = avatarUrl || user.avatarUrl || '';
	const displayAvatarAlt = avatarAlt || user.avatarAlt || user.fullName || __( 'Account', 'stayilo' );

	const fileInputRef = useRef( null );
	const [ profileSuccess, setProfileSuccess ] = useState( '' );
	const [ passwordSuccess, setPasswordSuccess ] = useState( '' );
	const [ avatarError, setAvatarError ] = useState( '' );
	const [ avatarDraft, setAvatarDraft ] = useState( null );

	useEffect( () => {
		return () => {
			if ( avatarDraft?.previewUrl ) {
				URL.revokeObjectURL( avatarDraft.previewUrl );
			}
		};
	}, [ avatarDraft ] );

	const showDeletedAvatar = Boolean( avatarDraft?.deleted );
	const draftPreviewUrl = avatarDraft?.previewUrl || '';
	const visibleAvatarUrl = showDeletedAvatar
		? ''
		: draftPreviewUrl || displayAvatarUrl;
	const avatarIsDefault = showDeletedAvatar
		? true
		: ! draftPreviewUrl && isDefaultAvatar;
	const avatarDirty = avatarDraft !== null;

	const setDraft = ( next ) => {
		setAvatarDraft( ( current ) => {
			if ( current?.previewUrl ) {
				URL.revokeObjectURL( current.previewUrl );
			}
			return next;
		} );
	};

	const handleUpdateAvatar = () => {
		setAvatarError( '' );
		fileInputRef.current?.click();
	};

	const handleAvatarFileChange = ( event ) => {
		const file = event.target.files?.[ 0 ];
		event.target.value = '';

		if ( ! file ) {
			return;
		}

		if ( ! file.type.startsWith( 'image/' ) ) {
			setAvatarError( 'Please choose an image file' );
			return;
		}

		if ( file.size > MAX_AVATAR_BYTES ) {
			setAvatarError( 'Image must be 1MB or smaller' );
			return;
		}

		setAvatarError( '' );
		setDraft( {
			file,
			previewUrl: URL.createObjectURL( file ),
		} );
	};

	const handleDeleteAvatar = () => {
		if ( avatarIsDefault ) {
			return;
		}
		setAvatarError( '' );
		setDraft( { deleted: true } );
	};

	const handleSaveProfile = async ( values, helpers ) => {
		setProfileSuccess( '' );
		helpers.setStatus( undefined );
		const next = {
			fullName: values.fullName.trim(),
			email: values.email.trim(),
		};

		try {
			if ( avatarDraft?.file ) {
				await updateAvatar?.( avatarDraft.file );
				onUpdateAvatar?.( avatarDraft.file );
			} else if ( avatarDraft?.deleted ) {
				await resetAvatar?.();
				onDeleteAvatar?.();
			}

			await saveAccount( {
				user: {
					fullName: next.fullName,
					email: next.email,
				},
			} );
			setDraft( null );
			onSaveProfile?.( next );
			setProfileSuccess( 'Changes saved' );
		} catch ( err ) {
			helpers.setStatus( err?.message || __( 'Save failed', 'stayilo' ) );
		} finally {
			helpers.setSubmitting( false );
		}
	};

	const handleChangePassword = async ( values, helpers ) => {
		setPasswordSuccess( '' );
		helpers.setStatus( undefined );

		try {
			await saveAccount( {
				user: {
					currentPassword: values.currentPassword,
					password: values.newPassword,
				},
			} );
			onChangePassword?.( values );
			helpers.resetForm( { values: EMPTY_PASSWORD_VALUES } );
			setPasswordSuccess( 'Password updated' );
		} catch ( err ) {
			const message = err?.message || __( 'Password change failed', 'stayilo' );
			if ( /current password/i.test( message ) ) {
				helpers.setFieldError( 'currentPassword', message );
			} else {
				helpers.setStatus( message );
			}
		} finally {
			helpers.setSubmitting( false );
		}
	};

	const initial = ( user.fullName || user.email || '?' ).charAt( 0 ).toUpperCase();

	return (
		<div className="portal-account-cards">
			<article className="portal-account-card portal-account-card--profile">
				<h2 className="portal-account-card-title">{ __( 'About you', 'stayilo' ) }</h2>

				<div className="portal-account-avatar">
					{ visibleAvatarUrl ? (
						<span className="portal-account-avatar-photo" >
							<img
								src={ visibleAvatarUrl }
								alt={ displayAvatarAlt }
								className="!h-full !w-full !max-h-none !max-w-none aspect-square object-cover"
							/>
						</span>
					) : (
						<div
							className="portal-account-avatar-fallback"
							style={ { color: 'var(--stayilo-primary)' } }
							aria-hidden="true"
							onClick={ handleUpdateAvatar }
						>
							{ initial }
						</div>
					) }
					<div>
						<p className="portal-account-avatar-label">{ __( 'Profile picture', 'stayilo' ) }</p>
						<div className="portal-account-avatar-actions">
						<button
							type="button"
							className="portal-account-chip portal-account-chip--remove disabled:cursor-not-allowed disabled:opacity-40"
							onClick={ handleDeleteAvatar }
							disabled={ avatarIsDefault || saving }
							aria-label={ __( 'Delete profile photo', 'stayilo' ) }
						>
							<TrashIcon
								width={ 20 }
								height={ 20 }
								aria-hidden="true"
								className={ `shrink-0 ${ avatarIsDefault ? '' : 'text-[#C00808]' }` }
							/>
							{ isClassic ? __( 'Remove', 'stayilo' ) : __( 'Delete', 'stayilo' ) }
						</button>
						<button
							type="button"
							className="portal-account-chip portal-account-chip--upload disabled:cursor-not-allowed disabled:opacity-40"
							onClick={ handleUpdateAvatar }
							disabled={ saving }
							aria-label={ __( 'Update profile photo', 'stayilo' ) }
						>
							<CloudArrowUpIcon
								width={ 20 }
								height={ 20 }
								aria-hidden="true"
								className="shrink-0 [&_path]:stroke-current"
							/>
							{ isClassic ? __( 'Upload', 'stayilo' ) : __( 'Update', 'stayilo' ) }
						</button>
						<input
							ref={ fileInputRef }
							type="file"
							accept="image/*"
							className="sr-only"
							tabIndex={ -1 }
							aria-hidden="true"
							onChange={ handleAvatarFileChange }
						/>
					</div>
					</div>
				</div>
				{ avatarError ? (
					<p className="mt-2 text-sm font-medium text-[#C00808]" role="alert">
						{ avatarError }
					</p>
				) : null }

				<Formik
					initialValues={ {
						fullName: user.fullName || '',
						email: user.email || '',
					} }
					enableReinitialize
					validationSchema={ accountProfileSchema }
					onSubmit={ handleSaveProfile }
				>
					{ ( { isSubmitting, dirty, status } ) => (
						<Form className="mt-4" noValidate>
							<div className="space-y-4">
								<Field
									name="fullName"
									label={ isClassic ? __( 'Full name', 'stayilo' ) : __( 'Full Name', 'stayilo' ) }
									autoComplete="name"
								/>
								<Field
									name="email"
									label={ __( 'Email address', 'stayilo' ) }
									type="email"
									autoComplete="email"
								/>
							</div>
							{ status ? (
								<p className="mt-2 text-sm text-portal-danger" role="alert">
									{ status }
								</p>
							) : null }

							<div className="mt-4">
								<Button
									type="submit"
									label={
										isSubmitting
											? __( 'Saving…', 'stayilo' )
											: isClassic
												? __( 'Save changes', 'stayilo' )
												: __( 'Save Changes', 'stayilo' )
									}
									variant="primary"
									className="form_btn"
									disabled={ isSubmitting || saving || ( ! dirty && ! avatarDirty ) }
									loading={ isSubmitting }
									icon={
										<NavArrowIcon
											width={ 24 }
											height={ 24 }
											className="text-current"
										/>
									}
								/>
								{ profileSuccess && ! dirty && ! avatarDirty ? (
									<p className="mt-2 text-sm font-medium text-[#047857]" role="status">
										{ profileSuccess }
									</p>
								) : null }
							</div>
						</Form>
					) }
				</Formik>
			</article>

			<article className="portal-account-card portal-account-card--password">
				<h2 className="portal-account-card-title">{ __( 'Password', 'stayilo' ) }</h2>

				<Formik
					initialValues={ EMPTY_PASSWORD_VALUES }
					validationSchema={ accountPasswordSchema }
					onSubmit={ handleChangePassword }
				>
					{ ( { isSubmitting, dirty, status } ) => (
						<Form className="mt-4" noValidate>
							<div className="space-y-4">
								<Field
									name="currentPassword"
									label={ __( 'Current password', 'stayilo' ) }
									type="password"
									autoComplete="current-password"
								/>
								<Field
									name="newPassword"
									label={ __( 'New password', 'stayilo' ) }
									type="password"
									autoComplete="new-password"
								/>
								<Field
									name="confirmPassword"
									label={ __( 'Confirm new password', 'stayilo' ) }
									type="password"
									autoComplete="new-password"
								/>
							</div>
							{ status ? (
								<p className="mt-2 text-sm text-portal-danger" role="alert">
									{ status }
								</p>
							) : null }

							<div className="mt-4">
								<Button
									type="submit"
									label={
										isSubmitting
											? __( 'Updating…', 'stayilo' )
											: isClassic
												? __( 'Save changes', 'stayilo' )
												: __( 'Change Password', 'stayilo' )
									}
									variant="secondary"
									disabled={ isSubmitting || saving || ! dirty }
									loading={ isSubmitting }
									className="form_btn"
									icon={
										<NavArrowIcon
											width={ 24 }
											height={ 24 }
											className="text-current"
										/>
									}
								/>
								{ passwordSuccess && ! dirty ? (
									<p className="mt-2 text-sm font-medium text-[#047857]" role="status">
										{ passwordSuccess }
									</p>
								) : null }
							</div>
						</Form>
					) }
				</Formik>
			</article>
		</div>
	);
}
