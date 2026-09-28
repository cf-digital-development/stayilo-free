import { useState, useEffect } from '@wordpress/element';
import sealCheckUrl from '../../assets/svg/SealCheck.svg';

/** Default success badge icon (green circle + check) */
export function SuccessBadgeIcon() {
	return <img src={ sealCheckUrl } alt="" aria-hidden="true" width={ 20 } height={ 20 } />;
}

/**
 * Status / success card with optional progress section.
 *
 * @param {object} props
 * @param {string} props.title - Bold green heading
 * @param {import('react').ReactNode} [props.icon] - Optional left icon
 * @param {boolean} [props.showIcon=true]
 * @param {string} [props.progressText] - e.g. "Downloading platform package..."
 * @param {number} [props.progress] - 0–100, shows bar when set with progressText
 * @param {boolean} [props.autoProgress=false] - Card animates 0–100 by itself, then hides the bar
 * @param {number} [props.autoProgressDuration=2000] - Simulation length in ms
 * @param {() => void} [props.onProgressComplete] - Fired once when auto progress reaches 100
 * @param {boolean} [props.showProgress] - Force show/hide progress block
 * @param {string} [props.className]
 */
export default function StatusCard( {
	title,
	icon,
	showIcon = true,
	progressText,
	progress,
	autoProgress = false,
	autoProgressDuration = 2000,
	onProgressComplete,
	showProgress,
	className = '',
} ) {
	const [ internalProgress, setInternalProgress ] = useState( 0 );

	useEffect( () => {
		if ( ! autoProgress ) {
			setInternalProgress( 0 );
			return;
		}

		const stepMs = 40;
		const increment = 100 / ( autoProgressDuration / stepMs );
		let completed = false;

		const timer = setInterval( () => {
			setInternalProgress( ( value ) => {
				const next = value + increment;
				if ( next >= 100 ) {
					clearInterval( timer );
					if ( ! completed ) {
						completed = true;
						onProgressComplete?.();
					}
					return 100;
				}
				return next;
			} );
		}, stepMs );

		return () => clearInterval( timer );
	}, [ autoProgress, autoProgressDuration, onProgressComplete ] );

	const autoDone = autoProgress && internalProgress >= 100;
	const effectiveProgress = autoProgress ? internalProgress : progress;

	const hasIcon = showIcon && icon !== undefined && icon !== null && icon !== false;
	const hasProgressBlock = autoProgress
		? ! autoDone
		: showProgress !== undefined
			? showProgress
			: Boolean( progressText || progress !== undefined );

	const progressValue = Math.max( 0, Math.min( 100, effectiveProgress ?? 0 ) );

	const classes = [
		'flex items-center gap-3 p-4 rounded-xl border border-[#16A34A33] bg-stayilo-accent-soft',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	return (
		<div className={ classes } role="status">
			{ hasIcon ? (
				<div
					className="shrink-0 flex items-center justify-center w-5 h-5 [&_svg]:w-5 [&_svg]:h-5"
					aria-hidden="true"
				>
					{ icon }
				</div>
			) : null }

			<div className="flex-1 min-w-0">
				{ title ? (
					<p
						className={
							hasProgressBlock
								? 'stayilo-type-title-md text-stayilo-accent'
								: 'm-0 font-inter text-sm font-semibold leading-5 tracking-normal text-stayilo-accent'
						}
					>
						{ title }
					</p>
				) : null }

				{ hasProgressBlock ? (
					<>
						{ progressText ? (
							<p className="stayilo-type-body-muted mt-0.5 mb-2">{ progressText }</p>
						) : null }
						{ effectiveProgress !== undefined ? (
							<div
								className="w-full h-1.5 rounded-full bg-stayilo-ink-alpha"
								role="progressbar"
								aria-valuenow={ progressValue }
								aria-valuemin={ 0 }
								aria-valuemax={ 100 }
							>
								<div
									className="h-full rounded-full bg-[rgba(22,163,74,0.53)] transition-[width] duration-[250ms] ease-in-out"
									style={ { width: `${ progressValue }%` } }
								/>
							</div>
						) : null }
					</>
				) : null }
			</div>
		</div>
	);
}
