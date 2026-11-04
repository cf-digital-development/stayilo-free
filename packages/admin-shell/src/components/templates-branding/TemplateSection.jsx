import { ReactComponent as CheckIcon } from '@stayilo/design-system/assets/svg/Check.svg';
import { ReactComponent as TemplatesIcon } from '../../assets/svg/SidebarSimple.svg';
import { getSelectableTemplateOptions } from '../template-picker/templateOptions.js';

function TemplateOption( { title, selected, onClick, preview } ) {
	return (
		<button
			type="button"
			onClick={ onClick }
			aria-pressed={ selected }
			className={ [
				'flex flex-col items-center rounded-2xl border-2 px-5 py-3 text-center transition-colors',
				selected
					? 'border-[#6366F1] bg-[#6366F10D] text-[#6366F1]'
					: 'border-[#0D111714] bg-white text-[#7C8494]',
			].join( ' ' ) }
		>
			<div className="h-[45px] w-[45px] overflow-hidden rounded-xl bg-white p-1.5 shadow-[0px_1px_2px_-1px_#0000001A] ring-1 ring-black/5">
				{ preview }
			</div>
			<span className="mt-1.5 inline-flex items-center gap-1.5 text-xs leading-[18px] font-semibold capitalize">
				{ title }
				{ selected ? <CheckIcon width={ 14 } height={ 14 } aria-hidden="true" /> : null }
			</span>
		</button>
	);
}

const PREVIEWS = {
	classic: (
		<div className="flex h-full w-full flex-col overflow-hidden rounded-lg bg-white">
			<div className="h-3 bg-[#0D1117]" />
			<div className="flex flex-1 flex-col gap-1 p-1.5">
				<div className="h-1.5 rounded bg-[#E5E7EB]" />
				<div className="h-1.5 w-2/3 rounded bg-[#E5E7EB]" />
			</div>
		</div>
	),
	minimal: (
		<div className="flex h-full w-full flex-col overflow-hidden rounded-lg bg-white">
			<div className="h-1 bg-[#E5E7EB]" />
			<div className="flex flex-1 flex-col justify-between p-1.5">
				<div className="h-1.5 rounded bg-[#E5E7EB]" />
				<div className="h-2 rounded bg-[#16A34A]" />
			</div>
		</div>
	),
};

export function TemplateSection( { template, onSelect, onOpenPicker } ) {
	const options = getSelectableTemplateOptions();

	return (
		<section>
			<h2 className="text-sm font-semibold text-stayilo-ink leading-5">Template</h2>
			<div className="mt-3 grid gap-3 sm:grid-cols-2">
				{ options.map( ( option ) => (
					<TemplateOption
						key={ option.value }
						title={ option.title }
						selected={ template === option.value }
						onClick={ () => onSelect( option.value ) }
						preview={ PREVIEWS[ option.value ] || PREVIEWS.classic }
					/>
				) ) }
			</div>
			<p className="mt-3 text-xs text-[#474C57] leading-4 max-w-[100%] xl:max-w-[374px] ">
				Changing template never loses branding settings — tokens apply across both.
			</p>
			<button
				type="button"
				onClick={ onOpenPicker }
				className="mt-3 inline-flex items-center gap-2.5 rounded-xl border border-[#0D11171A] bg-white px-3 py-[9px] text-sm leading-5 font-medium text-stayilo-ink"
			>
				<TemplatesIcon
					width={ 16 }
					height={ 16 }
					className="[&_g]:opacity-100 [&_path]:stroke-current"
					aria-hidden="true"
				/>
				View all templates
			</button>
		</section>
	);
}
