/**
 * Segmented filter tabs.
 * `muted` matches Activity Log chips; `outline` matches Subscribers status pills.
 * Pass `className` to override tab radius, border, or other styles (use `!` utilities).
 *
 * @param {{
 *   options: { id: string, label: string, count?: number }[],
 *   value: string,
 *   onChange: (id: string) => void,
 *   variant?: 'muted' | 'outline',
 *   className?: string,
 * }} props
 */
export function FilterTabs( {
	options = [],
	value,
	onChange,
	variant = 'muted',
	className = '',
} ) {
	const isOutline = variant === 'outline';

	return (
		<div className="flex flex-wrap items-center gap-2">
			{ options.map( ( option ) => {
				const selected = option.id === value;
				const count = option.count;
				const tabClass = isOutline
					? [
							'inline-flex h-[34px] items-center gap-1.5 rounded-full px-4 py-1.5 font-medium !shadow-none',
							selected
								? '!border-0 !bg-stayilo-ink !text-white text-sm leading-5'
								: '!border  text-[13px] leading-[19.5px] !border-solid !border-[#0D111714] !bg-white !text-[#717680] hover:!text-stayilo-ink',
							className,
					  ]
							.filter( Boolean )
							.join( ' ' )
					: [
							'inline-flex h-10 items-center !rounded-[10px]  px-[17px] text-xs  leading-4  font-semibold !shadow-none ',
							selected
								? '!bg-stayilo-ink !text-white'
								: '!bg-[#0D111714] !text-[#7C8494] hover:!text-stayilo-ink !border-[#0D111714]',
							className,
					  ]
							.filter( Boolean )
							.join( ' ' );

				return (
					<button
						key={ option.id }
						type="button"
						onClick={ () => onChange( option.id ) }
						className={ tabClass }
					>
						{ option.label }
						{ count != null ? (
							<span
								className={
									selected
										? isOutline
											? 'text-[#FFFFFF99] font-mono text-xs leading-4 font-medium'
											: undefined
										: 'font-normal !text-[#7C849499] font-mono text-xs leading-4'
								}
							>
								{ count }
							</span>
						) : null }
					</button>
				);
			} ) }
		</div>
	);
}
