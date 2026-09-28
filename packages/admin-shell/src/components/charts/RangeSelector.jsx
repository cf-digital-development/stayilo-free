import { RANGE_OPTIONS } from './chart-theme.js';

export function RangeSelector( {
	value = '15d',
	onChange,
	options = RANGE_OPTIONS,
} ) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			{ options.map( ( option ) => {
				const selected = option.id === value;
				return (
					<button
						key={ option.id }
						type="button"
						onClick={ () => onChange?.( option.id ) }
						className={ [
							'border-0 bg-transparent p-0 text-xs shadow-none',
							selected
								? 'font-semibold text-stayilo-ink'
								: 'font-medium text-stayilo-muted hover:text-stayilo-ink',
						].join( ' ' ) }
					>
						{ option.label }
					</button>
				);
			} ) }
		</div>
	);
}
