import { useState } from 'react';
import { Button } from './Button.jsx';
import { ReactComponent as PackageIcon } from '@stayilo/design-system/assets/svg/PackageIcon.svg';
import { ReactComponent as PlusCircleIcon } from '@stayilo/design-system/assets/svg/PlusCircle.svg';
import { ReactComponent as LeafIcon } from '@stayilo/design-system/assets/svg/leaf.svg';
import patternSrc from '../assets/images/pattern.png';
import { __ } from '@stayilo/design-system/i18n';

const TEXT_TONE_CLASSES = {
	light: 'text-white',
	dark: 'text-[#101010]',
	brand: 'portal-banner-on-brand',
};

const SUBTITLE_TONE_CLASSES = {
	light: 'text-white',
	dark: 'text-[#101010]',
	brand: 'portal-banner-on-brand',
};

function DefaultDecorationLeft() {
	return (
		<LeafIcon
			width={ 71 }
			height={ 90 }
			aria-hidden="true"
		/>
	);
}

function DefaultDecorationRight() {
	return (
		<img
			src={ patternSrc }
			alt=""
			aria-hidden="true"
			className="hidden h-auto w-[360px] object-contain md:block lg:w-[430px]"
		/>
	);
}

function TabPackageIcon() {
	return <PackageIcon width={ 24 } height={ 24 } aria-hidden="true" />;
}

function TabPlusCircleIcon() {
	return <PlusCircleIcon width={ 24 } height={ 24 } aria-hidden="true" />;
}

const TAB_ICONS = {
	box: TabPackageIcon,
	plus: TabPlusCircleIcon,
};

/**
 * Dynamic portal banner — welcome strip, edit-box header, or CTA alert.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} [props.backgroundColor]
 * @param {'light'|'dark'|'brand'} [props.textTone='dark']
 * @param {boolean} [props.showAccent=false] - Lime accent bar at top.
 * @param {string} [props.accentColor]
 * @param {boolean} [props.showDecorations=false] - Default botanical decorations.
 * @param {import('react').ReactNode} [props.decorationLeft] - Overrides default left decoration.
 * @param {import('react').ReactNode} [props.decorationRight] - Overrides default right decoration.
 * @param {Array<{ label: string, variant?: 'primary'|'secondary', onClick?: Function, showIcon?: boolean, icon?: import('react').ReactNode, disabled?: boolean }>} [props.actions]
 * @param {Array<{ id: string, label: string, icon?: 'box'|'plus'|import('react').ComponentType }>} [props.tabs]
 * @param {string} [props.activeTabId]
 * @param {(tabId: string) => void} [props.onTabChange]
 * @param {boolean} [props.fullBleed=true] - Full-width background, 1440px inner content.
 * @param {string} [props.className]
 * @param {string} [props.contentClassName]
 * @param {string} [props.paddingClassName='py-8 md:py-[60px]'] - Vertical padding. Edit subscription uses `py-10` (40px).
 * @param {string} [props.subtitleClassName]
 * @param {import('react').ReactNode} [props.before] - Rendered above the title (e.g. back link).
 */
export function Banner( {
	title,
	subtitle,
	backgroundColor,
	textTone = 'dark',
	showAccent = false,
	accentColor,
	showDecorations = false,
	decorationLeft,
	decorationRight,
	actions = [],
	tabs = [],
	activeTabId,
	onTabChange,
	fullBleed = true,
	className = '',
	contentClassName = '',
	paddingClassName = 'py-8 md:py-[60px]',
	subtitleClassName = '',
	titleClassName = '',
	before,
} ) {
	const [ internalTabId, setInternalTabId ] = useState(
		() => activeTabId ?? tabs[ 0 ]?.id ?? null
	);
	const currentTabId = onTabChange ? activeTabId ?? tabs[ 0 ]?.id : internalTabId;

	const resolvedLeft = decorationLeft ?? ( showDecorations ? <DefaultDecorationLeft /> : null );
	const resolvedRight = decorationRight ?? ( showDecorations ? <DefaultDecorationRight /> : null );
	const hasLeaf = Boolean( resolvedLeft );

	const handleTabSelect = ( tabId ) => {
		if ( ! onTabChange ) {
			setInternalTabId( tabId );
		}
		onTabChange?.( tabId );
	};

	const shellClasses = [
		hasLeaf ? 'overflow-visible' : 'overflow-hidden',
		fullBleed ? 'portal-full-bleed' : 'relative rounded-2xl',
		! backgroundColor ? 'portal-surface-warm' : '',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	const contentClasses = [
		'portal-content relative z-[1] px-0',
		paddingClassName,
		hasLeaf ? 'portal-banner-with-leaf' : '',
		contentClassName,
	]
		.filter( Boolean )
		.join( ' ' );

	const textBlock = (
		<div className={ hasLeaf ? 'portal-banner-copy min-w-0 flex-1' : undefined }>
			{ before }
			{/* <h2>
				className={ [
					'portal-banner-title',
					TEXT_TONE_CLASSES[ textTone ] ?? TEXT_TONE_CLASSES.dark,
				].join( ' ' ) }
			>
				{ title }
			</h2> */}
			<h2
                className={[
              'portal-banner-title',
             TEXT_TONE_CLASSES[textTone] ?? TEXT_TONE_CLASSES.dark,
             titleClassName,
                ].join(' ')}
>
  {title}
</h2>

			{ subtitle ? (
				<p
					className={ [
						'mt-4  max-w-2xl lg:max-w-4xl text-sm font-normal leading-5 sm:text-lg sm:leading-[24px]',
						SUBTITLE_TONE_CLASSES[ textTone ] ?? SUBTITLE_TONE_CLASSES.dark,
						subtitleClassName,
					].join( ' ' ) }
				>
					{ subtitle }
				</p>
			) : null }

			{ actions.length > 0 ? (
				<div className="mt-5 flex flex-wrap items-center gap-4 sm:gap-5 md:mt-10">
					{ actions.map( ( action, index ) => (
						<Button
							key={ `${ action.label }-${ index }` }
							label={ action.label }
							variant={ action.variant ?? ( index === 0 ? 'primary' : 'secondary' ) }
							showIcon={ action.showIcon !== false }
							icon={ action.icon }
							onClick={ action.onClick }
							disabled={ action.disabled }
							className={ [
								'portal-btn portal-btn-banner',
								action.className,
							]
								.filter( Boolean )
								.join( ' ' ) }
						/>
					) ) }
				</div>
			) : null }

			{ tabs.length > 0 ? (
				<div
					className="mt-5 sm:mt-8 flex w-full max-w-full flex-col gap-3 rounded-2xl bg-white p-2 sm:inline-flex sm:w-auto sm:flex-row sm:flex-wrap"
					role="tablist"
					aria-label={ __( 'Banner tabs', 'stayilo' ) }
				>
					{ tabs.map( ( tab ) => {
						const isActive = tab.id === currentTabId;
						const Icon =
							typeof tab.icon === 'string'
								? TAB_ICONS[ tab.icon ]
								: tab.icon;

						return (
							<button
								key={ tab.id }
								type="button"
								role="tab"
								aria-selected={ isActive }
								className={ [
									'portal-banner-tab',
									isActive
										? 'portal-banner-tab--active'
										: 'portal-banner-tab--inactive',
								].join( ' ' ) }
								onClick={ () => handleTabSelect( tab.id ) }
							>
								{ Icon ? (
									<span className="inline-flex shrink-0">
										<Icon />
									</span>
								) : null }
								{ tab.label }
							</button>
						);
					} ) }
				</div>
			) : null }
		</div>
	);

	const content = (
		<div className={ contentClasses }>
			{ hasLeaf ? (
				<div className="portal-banner-leaf" aria-hidden="true">
					{ resolvedLeft }
				</div>
			) : null }
			{ textBlock }
		</div>
	);

	return (
		<section
			className={ shellClasses }
			style={ backgroundColor ? { backgroundColor } : undefined }
			aria-label={ title }
		>
			{ showAccent ? (
				<span
					className={ [
						'absolute left-1/2 top-0 z-[2] h-1.5 w-16 -translate-x-1/2 rounded-b-sm sm:w-20',
						! accentColor ? 'portal-accent-bg' : '',
					].filter( Boolean ).join( ' ' ) }
					style={ accentColor ? { backgroundColor: accentColor } : undefined }
					aria-hidden="true"
				/>
			) : null }

			{ resolvedRight ? (
				<div className="pointer-events-none absolute bottom-0 right-0 z-0" aria-hidden="true">
					{ resolvedRight }
				</div>
			) : null }

			{ fullBleed ? (
				<div className={ hasLeaf ? 'relative overflow-visible px-1.5 lg:px-6' : 'px-1.5 lg:px-6' }>
					{ content }
				</div>
			) : content }
		</section>
	);
}
