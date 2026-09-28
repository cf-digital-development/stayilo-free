import { useState } from 'react';
import { PageHeader } from '../components/PageHeader.jsx';
import { hasTierAccess } from '../utils/tier.js';
import { useMerchantTier } from '../premium.js';
import { isWpAdmin, savePortalBranding } from '../api/wp-admin.js';
import { pickImage } from '../utils/wpMedia.js';
import { ReactComponent as EyeIcon } from '../assets/svg/Eye.svg';
import { ReactComponent as SaveIcon } from '../assets/svg/FloppyDisk.svg';
import { ChooseTemplateModal } from '../components/template-picker/ChooseTemplateModal.jsx';
import { BannerSection } from '../components/templates-branding/BannerSection.jsx';
import { BrandSection } from '../components/templates-branding/BrandSection.jsx';
import { CssSection } from '../components/templates-branding/CssSection.jsx';
import { LivePreview } from '../components/templates-branding/LivePreview.jsx';
import { TemplateSection } from '../components/templates-branding/TemplateSection.jsx';
import {
	brandingCssVars,
	clearPortalBrandingPreview,
	colorsForTemplate,
	normalizeColor,
	normalizeHex,
	surfaceColorsFrom,
	persistableBranding,
	portalPreviewUrl,
	readAdminBranding,
	PORTAL_ICON_FIELDS,
	readPortalIcons,
	readTemplateColors,
	TEMPLATE_COLOR_DEFAULTS,
	templateColorDefaults,
	writePortalBrandingPreview,
} from '../branding.js';

/**
 * @param {{ tier?: 'free'|'core'|'growth' }} props
 */
export function TemplatesBrandingPage( { tier: tierProp } ) {
	const merchantTier = useMerchantTier();
	const tier = tierProp ?? merchantTier;
	const hasGrowth = hasTierAccess( tier, 'growth' );
	const isPaid = tier !== 'free';
	const admin =
		typeof window !== 'undefined' ? window.stayiloAdmin || {} : {};

	const [ branding, setBranding ] = useState( () => readAdminBranding( admin ) );
	const [ template, setTemplate ] = useState( branding.template || 'minimal' );
	const [ customCss, setCustomCss ] = useState( '' );
	const [ previewMode, setPreviewMode ] = useState( 'desktop' );
	const [ previewScope, setPreviewScope ] = useState( 'single' );
	const [ saving, setSaving ] = useState( false );
	const [ savedFlash, setSavedFlash ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ templatePickerOpen, setTemplatePickerOpen ] = useState( false );

	const previewStyle = brandingCssVars( branding, template );
	const activeLogo = branding.icons?.[ template ]?.logo || branding.logoUrl;
	const logoName = activeLogo
		? activeLogo.split( '/' ).pop()
		: 'SVG, JPG, or PNG';

	const selectTemplate = ( next ) => {
		const nextId = TEMPLATE_COLOR_DEFAULTS[ next ] ? next : 'minimal';
		setBranding( ( current ) => {
			const colors = {
				...( current.colors || TEMPLATE_COLOR_DEFAULTS ),
				[ template ]: {
					brandColor: current.brandColor,
					accentColor: current.accentColor,
					buttonColor: current.buttonColor,
					...surfaceColorsFrom( current, template ),
				},
			};
			const nextColors = colorsForTemplate( { colors }, nextId );
			return {
				...current,
				colors,
				template: nextId,
				brandColor: nextColors.brandColor,
				accentColor: nextColors.accentColor,
				buttonColor: nextColors.buttonColor,
				...surfaceColorsFrom( nextColors, nextId ),
			};
		} );
		setTemplate( nextId );
	};

	const updateColor = ( key, value ) => {
		setBranding( ( current ) => ( {
			...current,
			[ key ]: value,
		} ) );
	};

	const commitColor = ( key, value ) => {
		const fallback = branding[ key ];
		updateColor(
			key,
			key === 'bannerBackground'
				? normalizeColor( value, fallback )
				: normalizeHex( value, fallback )
		);
	};

	const applySavedBranding = ( saved ) => {
		if ( ! saved ) {
			return;
		}
		const colors = readTemplateColors( saved );
		const active = colorsForTemplate( { colors }, template );
		setBranding( ( current ) => ( {
			...current,
			...saved,
			colors,
			brandColor: active.brandColor,
			accentColor: active.accentColor,
			buttonColor: active.buttonColor,
			font:
				saved.font === 'inherit'
					? 'Inherit from theme'
					: saved.font || current.font,
			bannerEnabled: Boolean( saved.bannerEnabled ),
			bannerText:
				typeof saved.bannerText === 'string'
					? saved.bannerText
					: current.bannerText,
			bannerColor: normalizeHex(
				saved.bannerColor,
				current.bannerColor || '#0D1117'
			),
			bannerLink:
				typeof saved.bannerLink === 'string'
					? saved.bannerLink
					: current.bannerLink,
			...surfaceColorsFrom( active, template ),
			icons: readPortalIcons( saved.icons || current.icons ),
		} ) );
	};

	const save = async () => {
		if ( ! isWpAdmin() ) {
			return;
		}

		setSaving( true );
		setError( null );
		setSavedFlash( false );

		try {
			const saved = await savePortalBranding(
				persistableBranding( branding, template )
			);
			clearPortalBrandingPreview();
			applySavedBranding( saved );
			setSavedFlash( true );
			window.setTimeout( () => setSavedFlash( false ), 2000 );
		} catch ( err ) {
			setError( err.message );
		} finally {
			setSaving( false );
		}
	};

	const previewPortal = () => {
		const url = admin.portalUrl;
		if ( ! url ) {
			return;
		}

		writePortalBrandingPreview( persistableBranding( branding, template ) );
		window.open( portalPreviewUrl( url ), '_blank', 'noopener,noreferrer' );
	};

	const changeLogo = async () => {
		if ( ! isWpAdmin() ) {
			setError( 'Logo upload is only available inside WordPress admin.' );
			return;
		}

		try {
			const picked = await pickImage( {
				title: 'Select store logo',
				buttonText: 'Use logo',
			} );
			if ( ! picked?.url ) {
				return;
			}
			setBranding( ( current ) => ( {
				...current,
				icons: {
					...( current.icons || {} ),
					[ template ]: {
						...( current.icons?.[ template ] || {} ),
						logo: picked.url,
					},
				},
			} ) );
		} catch ( err ) {
			setError( err.message );
		}
	};

	const resetColors = () => {
		const defaults = templateColorDefaults( template );
		setBranding( ( current ) => ( {
			...current,
			...defaults,
			colors: {
				...( current.colors || {} ),
				[ template ]: {
					...( current.colors?.[ template ] || {} ),
					...defaults,
				},
			},
		} ) );
	};

	const resetIcons = () => {
		const cleared = {};
		PORTAL_ICON_FIELDS.forEach( ( field ) => {
			if ( field.id !== 'logo' ) {
				cleared[ field.id ] = '';
			}
		} );
		setBranding( ( current ) => ( {
			...current,
			icons: {
				...( current.icons || {} ),
				[ template ]: {
					...( current.icons?.[ template ] || {} ),
					...cleared,
				},
			},
		} ) );
	};

	const deleteIcon = ( iconId ) => {
		setBranding( ( current ) => ( {
			...current,
			icons: {
				...( current.icons || {} ),
				[ template ]: {
					...( current.icons?.[ template ] || {} ),
					[ iconId ]: '',
				},
			},
		} ) );
	};

	const changeIcon = async ( iconId, label ) => {
		if ( ! isWpAdmin() ) {
			setError( 'Icon upload is only available inside WordPress admin.' );
			return;
		}

		try {
			const picked = await pickImage( {
				title: `Select ${ label }`,
				buttonText: 'Use icon',
			} );
			if ( ! picked?.url ) {
				return;
			}
			setBranding( ( current ) => ( {
				...current,
				icons: {
					...( current.icons || {} ),
					[ template ]: {
						...( current.icons?.[ template ] || {} ),
						[ iconId ]: picked.url,
					},
				},
			} ) );
		} catch ( err ) {
			setError( err.message );
		}
	};

	return (
		<>
			<div className="border-b border-[#0D11171A] md:px-10 px-4 py-4">
				<PageHeader
					title={ isPaid ? 'Templates & Branding' : 'Branding' }
					subtitle="Customise how your portal looks to customers"
					actions={
						<>
							<button
								type="button"
								onClick={ previewPortal }
								className="inline-flex items-center gap-2 rounded-xl border border-[#0D11171A] bg-white px-3.5 py-[9.5px] text-sm leading-5 font-medium text-stayilo-ink !shadow-none"
							>
								<EyeIcon width={ 16 } height={ 16 } aria-hidden="true" />
								Preview portal
							</button>
							<button
								type="button"
								onClick={ save }
								disabled={ saving }
								className="inline-flex items-center gap-2 rounded-xl bg-stayilo-ink px-3.5 py-[9.5px] text-sm leading-5 font-medium text-white !shadow-none disabled:opacity-60"
							>
								<SaveIcon width={ 16 } height={ 16 } aria-hidden="true" />
								{ saving ? 'Saving…' : savedFlash ? 'Saved' : 'Save changes' }
							</button>
						</>
					}
				/>
			</div>
			<div className="space-y-6 md:px-10 px-4	py-6">
				{ error ? (
					<p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
						{ error }
					</p>
				) : null }

				<div className="grid gap-6 xl:grid-cols-[460px_1fr]">
					<div className="space-y-5 border border-[#0D11171A] rounded-2xl bg-white p-5">
						{ isPaid ? (
							<TemplateSection
								template={ template }
								onSelect={ selectTemplate }
								onOpenPicker={ () => setTemplatePickerOpen( true ) }
							/>
						) : null }

						<BrandSection
							branding={ branding }
							logoName={ logoName }
							saving={ saving }
							template={ template }
							onChangeLogo={ changeLogo }
							onUpdateColor={ updateColor }
							onCommitColor={ commitColor }
							onChangeFont={ ( font ) =>
								setBranding( ( current ) => ( { ...current, font } ) )
							}
							onChangeIcon={ changeIcon }
							onDeleteIcon={ deleteIcon }
							onResetColors={ resetColors }
							onResetIcons={ resetIcons }
						/>

						<BannerSection
							hasGrowth={ hasGrowth }
							enabled={ branding.bannerEnabled }
							text={ branding.bannerText }
							color={ branding.bannerColor }
							link={ branding.bannerLink }
							onToggle={ () =>
								setBranding( ( current ) => ( {
									...current,
									bannerEnabled: ! current.bannerEnabled,
								} ) )
							}
							onChangeText={ ( bannerText ) =>
								setBranding( ( current ) => ( { ...current, bannerText } ) )
							}
							onChangeColor={ ( bannerColor ) =>
								setBranding( ( current ) => ( { ...current, bannerColor } ) )
							}
							onCommitColor={ ( bannerColor ) =>
								setBranding( ( current ) => ( {
									...current,
									bannerColor: normalizeHex( bannerColor, current.bannerColor ),
								} ) )
							}
							onChangeLink={ ( bannerLink ) =>
								setBranding( ( current ) => ( { ...current, bannerLink } ) )
							}
						/>

						<CssSection
							hasGrowth={ hasGrowth }
							value={ customCss }
							onChange={ setCustomCss }
						/>
					</div>

					<LivePreview
						branding={ branding }
						previewStyle={ previewStyle }
						previewMode={ previewMode }
						previewScope={ previewScope }
						onChangeMode={ setPreviewMode }
						onChangeScope={ setPreviewScope }
						bannerEnabled={ hasGrowth && branding.bannerEnabled }
						bannerText={ branding.bannerText }
						bannerColor={ branding.bannerColor }
						hasGrowth={ hasGrowth }
						storeName={ admin.siteName || 'your store' }
					/>
				</div>
			</div>
			{ isPaid ? (
				<ChooseTemplateModal
					open={ templatePickerOpen }
					onClose={ () => setTemplatePickerOpen( false ) }
					value={ template }
					onConfirm={ ( next ) => {
						selectTemplate( next );
						setTemplatePickerOpen( false );
					} }
				/>
			) : null }
		</>
	);
}

export default TemplatesBrandingPage;
