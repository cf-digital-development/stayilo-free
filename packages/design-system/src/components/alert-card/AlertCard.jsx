import { ReactComponent as FailIcon } from '../../assets/svg/error.svg';

const VARIANTS = {
	error: {
		wrapper: 'border border border-solid border-[#FFC9C9] bg-[#FEF2F2]',
		title: 'text-[#C10007]',
		body: 'text-[#E7000B]',
		iconClass: 'text-[#FB2C36]',
	},
	warning: {
		wrapper: 'border border-[#F59E0B66] bg-[#FFFBEB]',
		title: 'text-[#92400E]',
		body: 'text-[#92400E]',
		iconClass: 'text-[#92400E]',
	},
};

/**
 * Inline alert card for step-level errors and notices.
 *
 * @param {object} props
 * @param {'error'|'warning'} [props.variant='error']
 * @param {string} props.title
 * @param {import('react').ReactNode} [props.children]
 * @param {import('react').ReactNode} [props.icon]
 * @param {string} [props.className]
 */
export default function AlertCard( {
	variant = 'error',
	title,
	children,
	icon,
	className = '',
} ) {
	const styles = VARIANTS[ variant ] || VARIANTS.error;

	const classes = [
		'flex items-start gap-3 px-4 py-[15.5px] rounded-xl box-border',
		styles.wrapper,
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	return (
		<div className={ classes } role="alert">
			<div className="shrink-0 flex items-center justify-center w-5 h-5" aria-hidden="true">
				{ icon ?? (
					<FailIcon
						className={ `block h-5 w-5 ${ styles.iconClass }` }
						aria-hidden="true"
					/>
				) }
			</div>
			<div className="min-w-0 flex-1">
				{ title ? (
					<p className={ `stayilo-type-title-md m-0 ${ styles.title }` }>{ title }</p>
				) : null }
				{ children ? (
					<div className={ `stayilo-type-body m-0 !mt-0.5 !text-sm !font-normal !leading-5 ${ styles.body }` }>{ children }</div>
				) : null }
			</div>
		</div>
	);
}
