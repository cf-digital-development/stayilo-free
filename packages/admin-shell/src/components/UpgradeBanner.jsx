
	
import { ReactComponent as CrownIcon } from '@stayilo/design-system/assets/svg/Crown.svg';
import { ReactComponent as X } from '@stayilo/design-system/assets/svg/X.svg';
import { ReactComponent as ArrowRightIcon } from '@stayilo/design-system/assets/svg/ArrowRight.svg';

const FREE_SHELL_STYLE = {
	background:
		'linear-gradient(90deg, #EFF6FF 0%, #FAF5FF 100%) padding-box, linear-gradient(90deg, rgba(157, 55, 255, 0.2) 0%, rgba(43, 127, 255, 0.2) 100%) border-box',
	border: '1px solid transparent',
};

export function UpgradeBanner( {
	title,
	description,
	actionLabel = 'Upgrade now',
	variant = 'free',
	actionClassName,
	onAction,
	onDismiss,
} ) {
	const isFree = variant === 'free';
	const actionClass =
		actionClassName ||
		( variant === 'growth' || variant === 'core' ? 'bg-[#9810FA]' : 'bg-[#155DFC]' );

	return (
		<div
			className={ [
				'relative flex flex-col  lg:flex-row flex-wrap items-center gap-4 rounded-xl px-5 py-4',
				isFree ? '' : 'border border-[#E9D4FF] bg-white',
			]
				.filter( Boolean )
				.join( ' ' ) }
			style={ isFree ? FREE_SHELL_STYLE : undefined }
		>
			<div className="flex min-w-0 flex-1 items-center gap-3">
				<span
					className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
					style={ {
						background:
							'linear-gradient(142.59deg, #A233FF 6.25%, #2B7FFF 101.67%)',
					} }
				>
					<CrownIcon width={ 24 } height={ 24 } className="text-white" aria-hidden="true" />
				</span>
				<div>
					<h2 className="text-base leading-6 font-semibold text-[#0D1117]">{ title }</h2>
					<p className="max-w-[504px] text-[13px] leading-xs text-[#7C8494]">
						{ description }
					</p>
				</div>
			</div>
			<div className="flex flex-wrap gap-4">
			<button
				type="button"
				className={ `inline-flex w-fit items-center gap-2 rounded-xl border-0 px-6 py-3 font-inter text-base font-bold leading-6 text-white transition-opacity hover:opacity-90 ${ actionClass }` }
				onClick={ onAction }
			>
				<span>{ actionLabel }</span>
				<ArrowRightIcon width={ 20 } height={ 20 } aria-hidden="true" />
			</button>
			{ onDismiss ? (
				<button
					type="button"
					onClick={ onDismiss }
					className="text-stayilo-muted hover:text-stayilo-ink"
					aria-label="Dismiss"
				>
					<X width={ 20 } height={ 20 } aria-hidden="true" />
				</button>
			) : null }
			</div>
		</div>
	);
}