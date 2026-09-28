import { ReactComponent as CheckIcon } from '../../assets/svg/Check.svg';

/**
 * Reusable summary row for a completed setup choice.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {import('react').ReactNode} props.value
 * @param {() => void} [props.onEdit]
 * @param {string} [props.editLabel='Edit']
 * @param {import('react').ReactNode} [props.icon]
 * @param {string} [props.className]
 */
export default function SummaryRow( {
	label,
	value,
	onEdit,
	editLabel = 'Edit',
	icon,
	className = '',
} ) {
	const classes = [
		'grid grid-cols-[auto_minmax(120px,auto)_minmax(0,1fr)_auto] items-center gap-2',
		'w-full min-h-12 box-border rounded-xl px-4 py-3',
		'bg-stayilo-surface-soft font-inter',
		'max-[600px]:grid-cols-[auto_minmax(0,1fr)_auto]',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	return (
		<div className={ classes }>
			<span
				className="flex shrink-0 items-center justify-center rounded-full bg-stayilo-accent-soft p-[2px] text-stayilo-accent"
				aria-hidden="true"
			>
				{ icon ?? (
					<CheckIcon
						className="block text-stayilo-accent"
						aria-hidden="true"
					/>
				) }
			</span>

			<span className="stayilo-type-body-muted">{ label }</span>
			<span className="stayilo-type-mono-sm overflow-hidden truncate font-medium max-[600px]:[grid-column:2/-1] max-[600px]:[grid-row:2]">
				{ value }
			</span>

			{ typeof onEdit === 'function' ? (
				<button
					type="button"
					className="stayilo-link-pro !text-[#6366F1] cursor-pointer border-0 bg-transparent py-0.5 capitalize focus-visible:rounded-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-stayilo-pro focus-visible:outline-offset-2"
					aria-label={ `${ editLabel } ${ label }` }
					onClick={ onEdit }
				>
					{ editLabel }
				</button>
			) : null }
		</div>
	);
}
