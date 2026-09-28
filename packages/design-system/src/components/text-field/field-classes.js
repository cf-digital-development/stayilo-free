/**
 * Shared control classes for TextField and SelectField.
 * Extra classes can override with a leading `!`.
 *
 * @param {{ success?: boolean, invalid?: boolean, className?: string, typography?: 'mono'|'inter' }} props
 */
export function getFieldControlClasses( {
	success = false,
	invalid = false,
	className = '',
	typography = 'mono',
} = {} ) {
	const isInter = typography === 'inter';

	return [
		'stayilo-text-field__input w-full box-border !border !py-[11px] !px-4',
		isInter
			? 'stayilo-text-field__input--inter !rounded-[10px] font-inter text-sm font-normal leading-5 tracking-normal placeholder:font-inter placeholder:font-normal placeholder:text-[#0D111780]'
			: '!rounded-xl font-mono text-base font-medium leading-6 tracking-normal placeholder:font-mono placeholder:font-normal placeholder:text-[#0D111780]',
		'outline-none transition-[border-color,background-color,color] duration-150 ease-[ease]',
		'focus:!shadow-none focus:!outline-none',
		'disabled:cursor-not-allowed disabled:opacity-60',
		success
			? 'stayilo-text-field__input--success !border-stayilo-accent !bg-[#F0FDF4] !text-stayilo-accent'
			: invalid
				? 'stayilo-text-field__input--invalid !border-[#FF6467] !bg-[#FEF2F2] !text-[#FF6467] placeholder:!text-[#FF646780]'
				: '!border-stayilo-ink-alpha-strong !bg-stayilo-surface-soft !text-stayilo-ink',
		className,
	]
		.filter( Boolean )
		.join( ' ' );
}
