import { ReactComponent as PackageIcon } from '@stayilo/design-system/assets/svg/PackageIcon.svg';

function DefaultBoxIcon() {
	return (
		<PackageIcon
			width={ 32 }
			height={ 32 }
			aria-hidden="true"
			className="text-[#101010] [&_path]:stroke-current"
		/>
	);
}

/**
 * Compact beige action tile — icon + label (e.g. Change subscription size).
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.icon]
 * @param {string} props.label - Supports line breaks via `\n` or `lines`.
 * @param {string[]} [props.lines] - Explicit label lines; overrides `\n` split.
 * @param {() => void} [props.onClick]
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.backgroundColor]
 * @param {string} [props.className]
 */
export function QuickActionCard( {
	icon,
	label = 'Change\nsubscription size',
	lines,
	onClick,
	disabled = false,
	backgroundColor,
	className = '',
} ) {
	const labelLines = lines?.length
		? lines
		: String( label ).split( '\n' );

	const isButton = typeof onClick === 'function';
	const Tag = isButton ? 'button' : 'div';

	return (
		<Tag
			type={ isButton ? 'button' : undefined }
			disabled={ isButton ? disabled : undefined }
			onClick={ onClick }
			className={ [
				'portal-quick-action',
				isButton ? 'portal-quick-action--interactive' : '',
				className,
			].filter( Boolean ).join( ' ' ) }
			style={ backgroundColor ? { backgroundColor } : undefined }
		>
			<div className="portal-quick-action__icon" aria-hidden="true">
				{ icon ?? <DefaultBoxIcon /> }
			</div>
			<span className="portal-quick-action__label">
				{ labelLines.map( ( line ) => (
					<span key={ line } className="block">
						{ line }
					</span>
				) ) }
			</span>
		</Tag>
	);
}
