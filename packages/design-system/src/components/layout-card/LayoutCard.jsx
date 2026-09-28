import { useClickableSurface } from '../../hooks/useClickableSurface';

/**
 * Layout / template option card.
 * Preview area supports a background image, image, custom content, or wireframe illustration;
 * heading + optional demo action sit in one row inside the box; paragraph sits outside.
 * The whole card is clickable when `onClick` is provided.
 *
 * @param {object} props
 * @param {string} props.title - Heading inside the box (left of action)
 * @param {string} [props.description] - Paragraph outside the box
 * @param {string} [props.backgroundImage] - Preview area background image URL
 * @param {string} [props.previewImage] - Image shown inside the preview area
 * @param {string} [props.previewAlt] - Accessible alt text for previewImage
 * @param {import('react').ReactNode} [props.preview] - Optional content inside the preview area
 * @param {boolean} [props.selected=false]
 * @param {() => void} [props.onClick] - Called when the card is selected
 * @param {() => void} [props.onViewDemo] - Optional demo action (does not select the card)
 * @param {string} [props.demoLabel='View Demo']
 * @param {string} [props.className]
 * @param {string} [props.boxClassName] - Extra classes on the inner bordered box
 */
export default function LayoutCard( {
	title,
	description,
	backgroundImage,
	previewImage,
	previewAlt = '',
	preview,
	selected = false,
	onClick,
	onViewDemo,
	demoLabel = 'View Demo',
	className = '',
	boxClassName = '',
} ) {
	const { isClickable, rootProps } = useClickableSurface( {
		onActivate: onClick,
		pressed: selected,
		fallbackRole: undefined,
	} );

	const boxClasses = [
		'stayilo-layout-card__box flex flex-col p-4 bg-white border-2 rounded-[15px] box-border transition-[border-color,box-shadow,background-color] duration-150 ease-[ease]',
		selected
			? 'stayilo-layout-card__box--selected stayilo-card--selected border-stayilo-ink bg-stayilo-ink-alpha-selected'
			: 'border-stayilo-ink-alpha',
		boxClassName,
	]
		.filter( Boolean )
		.join( ' ' );

	const previewStyle = backgroundImage
		? {
			backgroundImage: `url(${ backgroundImage })`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			backgroundRepeat: 'no-repeat',
		}
		: undefined;

	const rootClasses = [
		'group flex flex-col flex-1 min-w-0 box-border text-left',
		isClickable ? 'cursor-pointer select-none focus-visible:outline-none' : '',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	const handleViewDemo = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		onViewDemo?.();
	};

	return (
		<div className={ rootClasses } { ...( isClickable ? rootProps : {} ) }>
			<div className={ boxClasses }>
				<div
					className="pointer-events-none flex flex-1 items-stretch justify-center w-full min-h-[164px] mb-3 rounded-xl overflow-hidden [&_img]:block [&_img]:w-full [&_img]:h-full [&_img]:object-cover"
					style={ previewStyle }
					aria-hidden={ ! preview && ! previewImage && backgroundImage ? 'true' : undefined }
				>
					{ previewImage ? (
						<img
							src={ previewImage }
							alt={ previewAlt }
							className="w-full h-full object-cover"
						/>
					) : null }
					{ preview }
				</div>

				<div className="flex items-center justify-between gap-3">
					<div className="pointer-events-none stayilo-type-title-sm">{ title }</div>
					{ onViewDemo ? (
						<button
							type="button"
							className="relative z-[1] shrink-0 rounded-lg border border-[#E5E7EB] bg-white px-3 py-[3.5px] font-inter text-[13px] font-semibold leading-[18px] text-[#474C57] transition-colors duration-150 hover:bg-stayilo-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-stayilo-pro focus-visible:outline-offset-2"
							onClick={ handleViewDemo }
						>
							{ demoLabel }
						</button>
					) : (
						<span
							className={ [
								'pointer-events-none stayilo-radio shrink-0',
								selected ? 'stayilo-radio--checked' : '',
							]
								.filter( Boolean )
								.join( ' ' ) }
							aria-hidden="true"
						/>
					) }
				</div>
			</div>

			{ description ? (
				<p className="pointer-events-none mt-3 font-inter text-xs font-normal leading-4 text-stayilo-muted text-left">{ description }</p>
			) : null }
		</div>
	);
}
