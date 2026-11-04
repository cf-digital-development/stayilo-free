import { Button } from './Button.jsx';
import { __ } from '@stayilo/design-system/i18n';

const TITLE_CLASSES = {
	section: 'portal-title',
	card: 'portal-card-title',
	delivery: 'mt-3 text-xl md:text-[40px] font-bold leading-[100%]',
};

const SUBTITLE_CLASSES = {
	section: '  text-lg font-medium leading-[26px] portal-subscription-subtitle',
	card: 'portal-card-subtitle',
	delivery: 'mt-2 text-base font-normal leading-[26px]',
};

function HeaderText( {
	variant,
	title,
	subtitle,
	eyebrow,
	eyebrowColor,
	showAccentBar,
	accentBarColor,
	headingLevel,
	titleClassName = '',
	subtitleClassName = '',
} ) {
	const HeadingTag = headingLevel ?? ( variant === 'card' ? 'h3' : 'h2' );

	return (
		<div
			className={ showAccentBar ? 'min-w-0 border-l-4 pl-3' : 'min-w-0' }
			style={ showAccentBar ? { borderColor: accentBarColor } : undefined }
		>
			{ eyebrow ? (
				<p
					className={ [
						'm-0  text-xl font-bold leading-[26px]',
						! eyebrowColor ? 'text-[#00823B]' : '',
					].filter( Boolean ).join( ' ' ) }
					style={ eyebrowColor ? { color: eyebrowColor } : undefined }
				>
					{ eyebrow }
				</p>
			) : null }

			<HeadingTag
				className={ [
					TITLE_CLASSES[ variant ] ?? TITLE_CLASSES.section,
					titleClassName,
				].filter( Boolean ).join( ' ' ) }
			>
				{ title }
			</HeadingTag>

			{ subtitle ? (
				<p
					className={ [
						SUBTITLE_CLASSES[ variant ] ?? SUBTITLE_CLASSES.section,
						subtitleClassName,
					].filter( Boolean ).join( ' ' ) }
				>
					{ subtitle }
				</p>
			) : null }
		</div>
	);
}

function HeaderActions( { actions } ) {
	if ( ! actions.length ) {
		return null;
	}

	return (
		<div className=" md:w-auto w-full  flex flex-col sm:flex-row shrink-0 flex-wrap items-center gap-5 mt-0 md:mt-0">
			{ actions.map( ( action, index ) => (
				<Button
					key={ `${ action.label }-${ index }` }
					label={ action.label }
					variant={ action.variant ?? ( index === 0 ? 'secondary' : 'primary' ) }
					showIcon={ action.showIcon ?? action.variant !== 'secondary' }
					icon={ action.icon }
					onClick={ action.onClick }
					disabled={ action.disabled }
					className={ action.className ?? 'portal-btn-compact' }
				/>
			) ) }
		</div>
	);
}

/**
 * Shared title / subtitle / actions header for sections, cards, and delivery rows.
 *
 * @param {object} props
 * @param {'section'|'card'|'delivery'} [props.variant='section']
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} [props.eyebrow]
 * @param {string} [props.eyebrowColor]
 * @param {boolean} [props.showAccentBar=false]
 * @param {string} [props.accentBarColor='#3B82F6']
 * @param {boolean} [props.showTopAccent=true] - Peach strip at top (delivery variant only).
 * @param {string} [props.innerClassName] - Extra classes on delivery variant inner row.
 * @param {string} [props.backgroundColor]
 * @param {Array<{ label: string, variant?: 'primary'|'secondary', showIcon?: boolean, icon?: import('react').ReactNode, disabled?: boolean, onClick?: Function, className?: string }>} [props.actions]
 * @param {'h2'|'h3'} [props.headingLevel]
 * @param {string} [props.titleClassName] - Extra classes on the title (e.g. order slider size).
 * @param {string} [props.subtitleClassName] - Extra classes on the subtitle.
 * @param {string} [props.className]
 */
export function ContentHeader( {
	variant = 'section',
	title,
	subtitle,
	eyebrow,
	eyebrowColor,
	showAccentBar = false,
	accentBarColor = '#3B82F6',
	topAccentColor = '#F3D5C0',
	showTopAccent = true,
	backgroundColor,
	actions = [],
	headingLevel,
	titleClassName = '',
	subtitleClassName = '',
	className = '',
	innerClassName = '',
} ) {
	const text = (
		<HeaderText
			variant={ variant }
			title={ title }
			subtitle={ subtitle }
			eyebrow={ eyebrow }
			eyebrowColor={ eyebrowColor }
			showAccentBar={ showAccentBar }
			accentBarColor={ accentBarColor }
			headingLevel={ headingLevel }
			titleClassName={ titleClassName }
			subtitleClassName={ subtitleClassName }
		/>
	);

	if ( variant === 'delivery' ) {
		const innerClasses = [
			'flex flex-wrap items-end gap-8 md:gap-12 lg:gap-24 px-6 py-6 sm:px-6',
			showTopAccent ? 'pt-5' : 'py-5 sm:py-6',
			innerClassName,
		]
			.filter( Boolean )
			.join( ' ' );

		const useCreamDefault = ! backgroundColor;
		const useTransparent = backgroundColor === 'transparent';

		return (
			<div
				className={ [
					'portal-delivery-strip',
					useCreamDefault ? 'portal-surface-cream' : '',
					className,
				].filter( Boolean ).join( ' ' ) }
				style={
					! useCreamDefault && ! useTransparent
						? { backgroundColor }
						: undefined
				}
			>
				{ showTopAccent ? (
					<span
						className="absolute inset-x-0 top-0 h-1"
						style={ { backgroundColor: topAccentColor } }
						aria-hidden="true"
					/>
				) : null }
				<div className={ innerClasses }>
					{ text }
					<HeaderActions actions={ actions } />
				</div>
			</div>
		);
	}

	if ( variant === 'card' ) {
		return (
			<div className={ className }>
				{ text }
			</div>
		);
	}

	return (
		<div
			className={ [
				' sm:flex-row flex-col flex min-w-0 items-start flex-wrap sm:items-end sm:justify-between justify-start gap-4 mt-0 sm:mt-0',
				className,
			].filter( Boolean ).join( ' ' ) }
		>
			{ text }
			<HeaderActions actions={ actions } />
		</div>
	);
}
