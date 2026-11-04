import { LockedBadge } from '@stayilo/design-system';
import { normalizeHex } from '../../branding.js';
import { ColorSwatch, HexField } from './ColorControls.jsx';
import { BANNER_INPUT_CLASS } from './constants.js';

function BannerControls( {
	enabled,
	text,
	color,
	link,
	onToggle,
	onChangeText,
	onChangeColor,
	onCommitColor,
	onChangeLink,
} ) {
	return (
		<section className="!mt-5">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-sm font-semibold leading-5 text-stayilo-ink">Announcement Banner</h2>
				<div className="flex items-center gap-2">
					<button
						type="button"
						role="switch"
						aria-checked={ enabled }
						aria-label={ enabled ? 'Turn announcement banner off' : 'Turn announcement banner on' }
						onClick={ onToggle }
						className={ [
							'relative h-[13.5px] w-[22.5px] shrink-0 rounded-full border-[1.25px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-stayilo-ink focus-visible:ring-offset-2',
							enabled
								? 'border-stayilo-accent bg-stayilo-accent'
								: 'border-[#0D1117]/40 bg-transparent',
						].join( ' ' ) }
					>
						<span
							className={ [
								'absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full transition-all',
								enabled
									? 'left-[11px] bg-white'
									: 'left-[2px] bg-transparent border-[1.25px] border-[#0D1117]/40',
							].join( ' ' ) }
						/>
					</button>
					<span className="text-sm font-semibold leading-5 text-stayilo-ink">
						{ enabled ? 'On' : 'Off' }
					</span>
				</div>
			</div>
			<div
				className={ [
					'mt-3 rounded-2xl border border-[#0D111714] bg-white p-3',
					! enabled && 'pointer-events-none opacity-60',
				].join( ' ' ) }
			>
				<label className="text-xs font-medium text-stayilo-ink leading-4" htmlFor="stayilo-banner-text">
					Banner text
				</label>
				<input
					id="stayilo-banner-text"
					type="text"
					disabled={ ! enabled }
					value={ text }
					onChange={ ( event ) => onChangeText( event.target.value ) }
					placeholder="🎉 Free delivery on all orders this month"
					className={ BANNER_INPUT_CLASS }
				/>
				<div className="mt-3 grid gap-4 sm:grid-cols-2">
					<div>
						<p className="text-xs font-medium text-stayilo-muted">Background colour</p>
						<div className="mt-1.5 flex items-center gap-2">
							<ColorSwatch
								label="Background colour"
								value={ color }
								disabled={ ! enabled }
								onChange={ onChangeColor }
							/>
							<HexField
								label="Background colour hex"
								value={ color }
								disabled={ ! enabled }
								onChange={ onChangeColor }
								onCommit={ ( value ) => onCommitColor( normalizeHex( value, color ) ) }
							/>
						</div>
					</div>
					<div>
						<label className="text-xs font-medium text-stayilo-muted" htmlFor="stayilo-banner-link">
							Link URL (optional)
						</label>
						<input
							id="stayilo-banner-link"
							type="url"
							disabled={ ! enabled }
							value={ link }
							onChange={ ( event ) => onChangeLink( event.target.value ) }
							placeholder="https://..."
							className={ BANNER_INPUT_CLASS }
						/>
					</div>
				</div>
			</div>
		</section>
	);
}

function LockedBannerControls() {
	return (
		<>
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-sm font-semibold text-stayilo-ink">Announcement Banner</h2>
			</div>
			<div className="relative mt-3 overflow-hidden rounded-xl border border-stayilo-border bg-white">
				<div className="pointer-events-none select-none p-4 opacity-40">
					<label className="text-xs font-medium text-stayilo-muted">
						Banner text
					</label>
					<div className={ `${ BANNER_INPUT_CLASS } mt-1 flex items-center text-stayilo-muted` }>
						🎉 Free delivery on all orders this month
					</div>
				</div>
				<div className="absolute inset-0 flex items-center justify-center bg-[#FFFFFFB2]">
					<LockedBadge>growth</LockedBadge>
				</div>
			</div>
		</>
	);
}

export function BannerSection( {
	hasGrowth,
	enabled,
	text,
	color,
	link,
	onToggle,
	onChangeText,
	onChangeColor,
	onCommitColor,
	onChangeLink,
} ) {
	if ( ! hasGrowth ) {
		return (
			<section>
				<LockedBannerControls />
			</section>
		);
	}

	return (
		<section>
			<BannerControls
				enabled={ enabled }
				text={ text }
				color={ color }
				link={ link }
				onToggle={ onToggle }
				onChangeText={ onChangeText }
				onChangeColor={ onChangeColor }
				onCommitColor={ onCommitColor }
				onChangeLink={ onChangeLink }
			/>
		</section>
	);
}
