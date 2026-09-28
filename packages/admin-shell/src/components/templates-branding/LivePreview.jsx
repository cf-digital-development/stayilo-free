import { ReactComponent as DesktopIcon } from '../../assets/svg/desktop.svg';
import { ReactComponent as MobileIcon } from '../../assets/svg/mobile.svg';
import { normalizeHex } from '../../branding.js';

/** Tiny right chevron for breadcrumb — sized for 4px without clipping. */
function BreadcrumbCaret() {
	return (
		<svg
			width="4"
			height="10"
			viewBox="0 0 3 2"
			fill="none"
			aria-hidden="true"
			className="inline-block shrink-0 align-middle"
			style={ { width: '4px', height: '10px', display: 'inline-block', verticalAlign: 'middle' } }
		>
			<path
				d="M1.25 0.75L2.75 2L1.25 3.25"
				stroke="currentColor"
				strokeWidth="0.75"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function BagIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
			<g clip-path="url(#clip0_4314_18268)">
				<path d="M4 1.33203L2 3.9987V13.332C2 13.6857 2.14048 14.0248 2.39052 14.2748C2.64057 14.5249 2.97971 14.6654 3.33333 14.6654H12.6667C13.0203 14.6654 13.3594 14.5249 13.6095 14.2748C13.8595 14.0248 14 13.6857 14 13.332V3.9987L12 1.33203H4Z" stroke="white" stroke-width="1.33333"/>
				<path d="M2 4H14" stroke="white" stroke-width="1.33333"/>
				<path d="M10.6673 6.66797C10.6673 7.37521 10.3864 8.05349 9.88627 8.55359C9.38617 9.05368 8.7079 9.33464 8.00065 9.33464C7.29341 9.33464 6.61513 9.05368 6.11503 8.55359C5.61494 8.05349 5.33398 7.37521 5.33398 6.66797" stroke="white" stroke-width="1.33333"/>
			</g>
			<defs>
				<clipPath id="clip0_4314_18268">
				<rect width="16" height="16" fill="white"/>
				</clipPath>
			</defs>
		</svg>
	);
}


/**
 * Templates & Branding live preview — My Account wireframe mockup.
 * Shared across Free / Core / Growth.
 */
export function LivePreview( {
	branding,
	previewStyle,
	previewMode,
	previewScope,
	onChangeMode,
	onChangeScope,
	bannerEnabled,
	bannerText,
	bannerColor,
	hasGrowth,
	storeName,
} ) {
	const isMobile = previewMode === 'mobile';
	const accent = 'var(--stayilo-accent, #16A34A)';
	const brandLabel = branding.brandName || storeName || 'Store';

	return (
		<aside className="w-full min-w-0  h-fit overflow-hidden rounded-2xl border border-[#0D11171A] bg-white">
			<div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
				<h2 className="m-0 text-sm font-semibold leading-5 text-stayilo-ink">
					Live Preview
				</h2>
				<div className="flex flex-wrap items-center gap-2">
					<div className="inline-flex rounded-lg border border-[#0D111714] p-1">
						{ [
							{ id: 'single', label: 'Single' },
							{ id: 'multi', label: 'Multi' },
						].map( ( scope ) => (
							<button
								key={ scope.id }
								type="button"
								onClick={ () => onChangeScope( scope.id ) }
								className={ [
									'rounded-md px-3 py-1 text-xs font-medium !shadow-none',
									previewScope === scope.id
										? 'bg-stayilo-ink text-white'
										: 'bg-transparent text-[#7C8494]',
								].join( ' ' ) }
							>
								{ scope.label }
							</button>
						) ) }
					</div>
					<div className="inline-flex rounded-lg border border-[#0D111714] p-1">
						<button
							type="button"
							aria-label="Desktop preview"
							onClick={ () => onChangeMode( 'desktop' ) }
							className={ [
								'inline-flex h-6 w-6 items-center justify-center rounded-md !shadow-none',
								previewMode === 'desktop' ? 'bg-stayilo-ink' : 'bg-transparent',
							].join( ' ' ) }
						>
							<DesktopIcon
								width={ 16 }
								height={ 16 }
								aria-hidden="true"
								className={
									previewMode === 'desktop'
										? '[&_path]:stroke-white'
										: '[&_path]:stroke-[#7C8494]'
								}
							/>
						</button>
						<button
							type="button"
							aria-label="Mobile preview"
							onClick={ () => onChangeMode( 'mobile' ) }
							className={ [
								'inline-flex h-6 w-6 items-center justify-center rounded-md !shadow-none',
								previewMode === 'mobile' ? 'bg-stayilo-ink' : 'bg-transparent',
							].join( ' ' ) }
						>
							<MobileIcon
								width={ 16 }
								height={ 16 }
								aria-hidden="true"
								className={
									previewMode === 'mobile'
										? '[&_path]:stroke-white'
										: '[&_path]:stroke-[#7C8494]'
								}
							/>
						</button>
					</div>
				</div>
			</div>

			<div className={ [ 'w-full px-5 pb-5 shadow-[0_8px_24px_rgba(13,17,23,0.06)]', isMobile ? 'mx-auto max-w-[320px]' : '' ].join( ' ' ) }>
				<div
					className="overflow-hidden rounded-xl border border-[#0D111714] shadow-[0_8px_24px_rgba(13,17,23,0.06)]"
					style={ previewStyle }
				>
					{ hasGrowth && bannerEnabled ? (
						<div
							className="px-3 py-2 text-center text-[11px] leading-4 text-white"
							style={ { background: normalizeHex( bannerColor, '#0D1117' ) } }
						>
							{ bannerText || '🎉 Free delivery on all orders this month' }
						</div>
					) : null }

					{ /* Store header */ }
					<div className="flex items-center gap-3 bg-[#0D1117] px-4 py-3">
						{ branding.logoUrl ? (
							<img
								src={ branding.logoUrl }
								alt=""
								className="h-7 w-auto max-w-[72px] rounded object-contain"
							/>
						) : (
							<span className="inline-flex h-7 min-w-[72px] items-center justify-center rounded-full bg-[#5B616B] px-3 text-[10px] font-semibold text-white/80">
								{ String( brandLabel ).slice( 0, 8 ) }
							</span>
						) }

						{ ! isMobile ? (
							<div className="flex min-w-0 flex-1 items-center justify-center gap-3">
								{ Array.from( { length: 5 } ).map( ( _, index ) => (
									<span
										key={ `nav-${ index }` }
										className="h-4 w-10 shrink-0 rounded-full bg-[#FFFFFF]/[0.20]"
									/>
								) ) }
							</div>
						) : (
							<div className="flex-1" />
						) }

						<div className="flex shrink-0 items-center gap-2.5 text-white/80">
							<span className="relative inline-flex text-white/70">
								<BagIcon height={ 16 } width={ 16 } />
								<span
									className="absolute -right-1.5 -top-1.5 inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-1 text-[7px] font-bold leading-none text-white"
									style={ { background: accent } }
								>
									2
								</span>
							</span>
							<span className="inline-block h-6 w-6 rounded-full bg-[#5B616B]" />
						</div>
					</div>

					{ /* Breadcrumb */ }
					<div className="flex items-center gap-1.5 bg-[#0D1117] px-4 py-2 text-[11px] leading-4 text-white/75">
						<span>Home</span>
						<span className="inline-flex items-center text-white/60">
							<BreadcrumbCaret />
						</span>
						<span>My Account</span>
					</div>

					{ /* Account layout */ }
					<div
						className={ [
							'bg-white',
							isMobile ? 'flex flex-col' : 'flex min-h-[360px]',
						].join( ' ' ) }
					>
						<aside
							className={ [
								'border-[#0D11171A] bg-white',
								isMobile
									? 'flex gap-2 overflow-x-auto border-b px-3 py-3'
									: 'flex w-[148px] shrink-0 flex-col gap-3 border-r py-4',
							].join( ' ' ) }
						>
							

							{ [ 0, 1, 2, 3, 4, 5 ].map( ( index ) => {
								if ( index === 2 ) {
									return (
										<div
											key={ `side-${ index }` }
											className={ [
												'flex items-center',
												isMobile
													? 'rounded-lg px-2 py-2'
													: 'w-full px-3 py-2.5',
											].join( ' ' ) }
											style={ { background: accent } }
										>
											<span className="h-5 w-[90%] rounded-full bg-white" />
										</div>
									);
								}

								return (
									<div
										key={ `side-${ index }` }
										className={ isMobile ? '' : 'px-3 py-2.5' }
									>
										<span
											className={ [
												'block rounded-full bg-[#E5E7EB]',
												isMobile
													? 'h-2.5 min-w-[56px] shrink-0'
													: 'h-5 w-[90%]',
											].join( ' ' ) }
										/>
									</div>
								);
							} ) }
						</aside>

						<div
							className={ [
								'min-w-0 flex-1 bg-[#F3F4F6]',
								isMobile ? 'p-4' : 'p-5',
							].join( ' ' ) }
						>
							{ /*
							  Main content stack — matches design:
							  header pills → bordered card (2 panes) → text lines
							*/ }
							<div
								className="flex w-full max-w-[600px] flex-col items-stretch"
								style={ { gap: '20px' } }
							>
								<div className="flex w-full items-center justify-between gap-3">
									<span className="h-6 w-28 rounded-full bg-[#E5E7EB]" />
									<span className="h-6 w-14 rounded-full bg-[#E5E7EB]" />
								</div>

								<div
									className="flex w-full flex-col overflow-hidden rounded-2xl border border-[#0D11171A] bg-white"
									style={ {
										borderRight: '1px solid rgba(13, 17, 23, 0.10)',
									} }
								>
									<div className="min-h-[72px] w-full border-b border-[#0D11171A] bg-white" />
									<div className="min-h-[132px] w-full bg-white" />
								</div>

								<div className="flex w-full flex-col gap-2.5">
									<span className="h-2 w-[70%] rounded-full bg-[#E5E7EB]" />
									<span className="h-2 w-[56%] rounded-full bg-[#E5E7EB]" />
									<span className="h-2 w-[62%] rounded-full bg-[#E5E7EB]" />
									<span className="h-2 w-[38%] rounded-full bg-[#E5E7EB]" />
								</div>
							</div>

							{ previewScope === 'multi' ? (
								<div
									className="mt-5 flex w-full max-w-[600px] flex-col opacity-70"
									style={ { gap: '12px' } }
								>
									<span className="h-10 w-full rounded-xl border border-dashed border-[#0D11171A] bg-white/80" />
									<span className="h-10 w-full rounded-xl border border-dashed border-[#0D11171A] bg-white/80" />
								</div>
							) : null }
						</div>
					</div>
				</div>

				{ previewScope === 'multi' && ! hasGrowth ? (
					<p className="mt-3 text-center text-xs text-stayilo-muted">
						Multi-subscription preview
					</p>
				) : null }
			</div>
		</aside>
	);
}
