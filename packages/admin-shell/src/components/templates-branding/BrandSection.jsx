import { useState } from 'react';
import { ReactComponent as CaretDownIcon } from '../../assets/svg/CaretDown.svg';
import { ReactComponent as ExportIcon } from '../../assets/svg/export.svg';
import { PORTAL_ICON_FIELDS, SURFACE_COLOR_ROWS } from '../../branding.js';
import { ColorRow } from './ColorControls.jsx';
import { FontSelect } from './FontSelect.jsx';

function fileLabel( url, fallback = 'SVG, JPG, or PNG' ) {
	if ( ! url ) {
		return fallback;
	}
	const name = url.split( '/' ).pop()?.split( '?' )[ 0 ] || fallback;
	try {
		return decodeURIComponent( name );
	} catch {
		return name;
	}
}

function SectionToggle( { title, open, onToggle, onReset, resetLabel } ) {
	return (
		<div className="flex w-full items-center gap-2 py-1">
			<button
				type="button"
				className="flex min-w-0 flex-1 items-center text-left"
				aria-expanded={ open }
				onClick={ onToggle }
			>
				<span className="text-sm font-semibold capitalize leading-5 text-stayilo-ink">
					{ title }
				</span>
			</button>
			{ onReset ? (
				<button
					type="button"
					className="shrink-0 rounded-full bg-[#EDEEF2] px-2 py-0.5 text-[11px] font-medium leading-4 text-stayilo-ink"
					onClick={ onReset }
				>
					{ resetLabel || 'Reset' }
				</button>
			) : null }
			<button
				type="button"
				className="inline-flex shrink-0 items-center justify-center"
				aria-label={ open ? `Collapse ${ title }` : `Expand ${ title }` }
				aria-expanded={ open }
				onClick={ onToggle }
			>
				<CaretDownIcon
					width={ 16 }
					height={ 16 }
					aria-hidden="true"
					className={ `transition-transform duration-1000 ease-out ${ open ? 'rotate-180' : 'rotate-0' }` }
				/>
			</button>
		</div>
	);
}

function Collapsible( { open, children } ) {
	return (
		<div
			className="grid"
			style={ {
				gridTemplateRows: open ? '1fr' : '0fr',
				transition: 'grid-template-rows 1000ms ease',
			} }
		>
			<div className={ open ? 'overflow-hidden' : 'pointer-events-none overflow-hidden' }>
				{ children }
			</div>
		</div>
	);
}

function ClassicBrand( {
	branding,
	template,
	logoName,
	saving,
	onChangeLogo,
	onUpdateColor,
	onCommitColor,
	onChangeFont,
	onChangeIcon,
	onDeleteIcon,
	onResetColors,
	onResetIcons,
} ) {
	const [ coloursOpen, setColoursOpen ] = useState( true );
	const [ iconsOpen, setIconsOpen ] = useState( true );
	const logoUrl = branding.icons?.[ template ]?.logo || branding.logoUrl;

	return (
		<section>
			<h2 className="text-sm font-semibold capitalize leading-5 text-stayilo-ink">Brand</h2>
			<div className="mt-3 space-y-3">
				<div className="flex items-center gap-3 rounded-xl border border-[#0D11171A] bg-white px-3 py-3">
					<span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#EDEEF2] text-stayilo-muted">
						{ logoUrl ? (
							<img
								src={ logoUrl }
								alt=""
								className="h-full w-full object-contain"
							/>
						) : (
							<ExportIcon width={ 20 } height={ 20 } aria-hidden="true" />
						) }
					</span>
					<div className="min-w-0 flex-1">
						<p className="text-sm font-medium leading-5 text-stayilo-ink">Logo</p>
						<p className="mt-1 truncate text-xs leading-4 text-[#7C8494]">{ logoName }</p>
					</div>
					<button
						type="button"
						className="shrink-0 text-sm font-medium leading-5 text-[#6366F1]"
						onClick={ onChangeLogo }
						disabled={ saving }
					>
						{ logoUrl ? 'Change' : 'Upload' }
					</button>
				</div>

				<div>
					<SectionToggle
						title="Global colour"
						open={ coloursOpen }
						onToggle={ () => setColoursOpen( ( open ) => ! open ) }
						onReset={ onResetColors }
						resetLabel="Reset"
					/>
					<Collapsible open={ coloursOpen }>
						<div className="mt-3 overflow-hidden rounded-xl border border-[#0D11171A] bg-white">
							{ SURFACE_COLOR_ROWS.map( ( row, index ) => (
								<div key={ row.key }>
									{ index > 0 ? <div className="mx-4 h-px bg-stayilo-border" /> : null }
									<ColorRow
										label={ row.label }
										hint={ row.hint }
										value={ branding[ row.key ] }
										onChange={ ( value ) => onUpdateColor( row.key, value ) }
										onCommit={ ( value ) => onCommitColor( row.key, value ) }
									/>
								</div>
							) ) }
						</div>
					</Collapsible>
				</div>

				<div className="flex items-center justify-between gap-3 rounded-xl border border-[#0D11171A] bg-white p-3">
					<div className="flex min-w-0 items-center gap-3">
						<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDEEF2] text-lg font-semibold text-stayilo-ink">
							T
						</span>
						<p className="text-sm font-medium leading-5 text-stayilo-ink">Font</p>
					</div>
					<FontSelect value={ branding.font } onChange={ onChangeFont } />
				</div>

				<div>
					<SectionToggle
						title="Icons"
						open={ iconsOpen }
						onToggle={ () => setIconsOpen( ( open ) => ! open ) }
						onReset={ onResetIcons }
						resetLabel="Reset"
					/>
					<Collapsible open={ iconsOpen }>
						<div className="mt-3 space-y-3">
							{ PORTAL_ICON_FIELDS.filter( ( field ) => field.id !== 'logo' ).map( ( field ) => {
								const url = branding.icons?.[ template ]?.[ field.id ] || '';
								return (
									<div
										key={ field.id }
										className="flex items-center gap-3 rounded-xl border border-[#0D11171A] bg-white px-3 py-3"
									>
										<span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#EDEEF2] text-stayilo-muted">
											{ url ? (
												<img src={ url } alt="" className="h-6 w-6 object-contain" />
											) : (
												<ExportIcon width={ 20 } height={ 20 } aria-hidden="true" />
											) }
										</span>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-medium leading-5 text-stayilo-ink">
												{ field.label }
											</p>
											<p className="mt-1 truncate text-xs leading-4 text-[#7C8494]">
												{ fileLabel( url ) }
											</p>
										</div>
										{ url ? (
											<button
												type="button"
												className="shrink-0 text-sm font-medium leading-5 text-[#7C8494]"
												onClick={ () => onDeleteIcon( field.id ) }
												disabled={ saving }
											>
												Delete
											</button>
										) : null }
										<button
											type="button"
											className="shrink-0 text-sm font-medium leading-5 text-[#6366F1]"
											onClick={ () => onChangeIcon( field.id, field.label ) }
											disabled={ saving }
										>
											{ url ? 'Change' : 'Add' }
										</button>
									</div>
								);
							} ) }
						</div>
					</Collapsible>
				</div>
			</div>
		</section>
	);
}

export function BrandSection( {
	branding,
	logoName,
	saving,
	template = 'classic',
	onChangeLogo,
	onUpdateColor,
	onCommitColor,
	onChangeFont,
	onChangeIcon,
	onDeleteIcon,
	onResetColors,
	onResetIcons,
} ) {
	return (
		<ClassicBrand
			branding={ branding }
			template={ template }
			logoName={ logoName }
			saving={ saving }
			onChangeLogo={ onChangeLogo }
			onUpdateColor={ onUpdateColor }
			onCommitColor={ onCommitColor }
			onChangeFont={ onChangeFont }
			onChangeIcon={ onChangeIcon }
			onDeleteIcon={ onDeleteIcon }
			onResetColors={ onResetColors }
			onResetIcons={ onResetIcons }
		/>
	);
}
