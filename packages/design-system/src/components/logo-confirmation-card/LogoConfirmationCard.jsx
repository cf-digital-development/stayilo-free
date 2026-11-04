import { useRef } from '@wordpress/element';
import cloudArrowUpUrl from '../../assets/svg/CloudArrowUp.svg';

/**
 * Build logo initials from a brand name.
 * "Bloom & Thread" → "B&T", "Coffee Shop" → "CS"
 *
 * @param {string} name
 * @returns {string}
 */
export function getInitials( name = '' ) {
	const parts = name.trim().split( /\s+/ ).filter( Boolean );
	if ( ! parts.length ) {
		return '';
	}

	const hasAmpersand = parts.some( ( part ) => part === '&' );
	const words = parts.filter( ( part ) => part !== '&' );

	if ( hasAmpersand && words.length >= 2 ) {
		return `${ words[ 0 ].charAt( 0 ) }&${ words[ 1 ].charAt( 0 ) }`.toUpperCase();
	}

	return words
		.slice( 0, 2 )
		.map( ( word ) => word.charAt( 0 ) )
		.join( '' )
		.toUpperCase();
}

/**
 * Reusable logo confirmation and upload card.
 *
 * @param {object} props
 * @param {string} [props.prompt='Is this your logo?']
 * @param {string} props.brandName
 * @param {string} [props.description]
 * @param {string} [props.logoUrl]
 * @param {import('react').ReactNode} [props.logo]
 * @param {boolean} [props.confirmed=false]
 * @param {() => void} [props.onConfirm]
 * @param {(file: File) => void} [props.onUpload]
 * @param {() => void} [props.onUploadClick]
 * @param {string} [props.confirmLabel='Yes, use this']
 * @param {string} [props.uploadLabel='Upload']
 * @param {string} [props.accept='image/*']
 * @param {string} [props.className]
 */
export default function LogoConfirmationCard( {
	prompt = 'Is this your logo?',
	brandName,
	description = 'Auto-detected from site customizer',
	logoUrl,
	logo,
	confirmed = false,
	onConfirm,
	onUpload,
	onUploadClick,
	confirmLabel = 'Yes, use this',
	uploadLabel = 'Upload',
	accept = 'image/*',
	className = '',
} ) {
	const fileInputRef = useRef( null );
	const classes = [ 'w-full font-inter', className ].filter( Boolean ).join( ' ' );

	const handleFileChange = ( event ) => {
		const [ file ] = event.target.files;

		if ( file ) {
			onUpload?.( file );
		}

		event.target.value = '';
	};

	return (
		<div className={ classes }>
			{ prompt ? (
				<p className="stayilo-type-body-muted mb-2">{ prompt }</p>
			) : null }

			<div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 w-full box-border py-3 px-[15px] rounded-xl border border-stayilo-ink-alpha bg-stayilo-surface-soft max-[560px]:grid-cols-[auto_minmax(0,1fr)]">
				<div
					className="flex h-[37.25px] w-[37.25px] items-center justify-center overflow-hidden rounded-[11.25px] border border-stayilo-ink-alpha bg-[#0D1117] text-[11.5px] font-black uppercase leading-4 text-white"
					aria-hidden="true"
				>
					{ logo ??
						( logoUrl ? (
							<img src={ logoUrl } alt="" className="block h-full w-full object-cover" />
						) : (
							<span>{ getInitials( brandName ) }</span>
						) ) }
				</div>

				<div className="flex min-w-0 flex-col">
					<strong className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold leading-6 text-stayilo-ink">
						{ brandName }
					</strong>
					{ description ? (
						<span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-normal leading-5 text-stayilo-muted">
							{ description }
						</span>
					) : null }
				</div>

				<div className="flex items-center gap-[7.5px] whitespace-nowrap text-stayilo-muted max-[560px]:[grid-column:2]">
					<button
						type="button"
						className="inline-flex items-center gap-1 border-0 bg-transparent p-0 [font-family:inherit] text-sm font-semibold leading-5 text-stayilo-accent cursor-pointer"
						aria-pressed={ confirmed }
						onClick={ onConfirm }
					>
						{ confirmed ? <span aria-hidden="true">✓</span> : null }
						{ confirmLabel }
					</button>

					<span aria-hidden="true">·</span>

					<button
						type="button"
						className="inline-flex items-center gap-1 border-0 bg-transparent p-0 [font-family:inherit] text-sm font-semibold leading-5 text-stayilo-muted cursor-pointer"
						onClick={ () => {
							if ( onUploadClick ) {
								onUploadClick();
								return;
							}
							fileInputRef.current?.click();
						} }
					>
						<img src={ cloudArrowUpUrl } alt="" aria-hidden="true" className="block h-5 w-5" />
						{ uploadLabel }
					</button>

					<input
						ref={ fileInputRef }
						type="file"
						className="sr-only"
						accept={ accept }
						onChange={ handleFileChange }
					/>
				</div>
			</div>
		</div>
	);
}
