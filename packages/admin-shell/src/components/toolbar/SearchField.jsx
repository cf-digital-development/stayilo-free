import { ReactComponent as SearchIcon } from '../../assets/svg/MagnifyingGlass.svg';

/**
 * White search field with leading magnifying glass.
 * Default width is 240px; pass `className` to override the wrapper.
 * Pass `inputClassName` to override input radius, border, and other styles (use `!` utilities).
 *
 * @param {{
 *   value: string,
 *   onChange: (value: string) => void,
 *   placeholder?: string,
 *   className?: string,
 *   inputClassName?: string,
 * }} props
 */
export function SearchField( {
	value,
	onChange,
	placeholder = 'Search…',
	className = ' w-full lg:w-[240px]',
	inputClassName = '',
} ) {
	const hasCustomRadius = /(^|\s)!?rounded/.test( inputClassName );

	return (
		<label className={ [ 'relative block', className ].filter( Boolean ).join( ' ' ) }>
			<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
				<SearchIcon
					width={ 20 }
					height={ 20 }
					aria-hidden="true"
					className="[&_path]:stroke-current"
				/>
			</span>
			<input
				type="search"
				value={ value }
				onChange={ ( event ) => onChange( event.target.value ) }
				placeholder={ placeholder }
				className={ [
					'!m-0 box-border w-full appearance-none !h-10 !min-h-0 !border !border-solid !border-[#0D11171A] !bg-white !py-0 !pl-10 !pr-3 text-sm !text-stayilo-ink !shadow-none !outline-none placeholder:!text-[#0D1117]/50 focus:!shadow-none focus:!outline-none',
					hasCustomRadius ? '' : '!rounded-xl',
					inputClassName,
				]
					.filter( Boolean )
					.join( ' ' ) }
			/>
		</label>
	);
}
