import {
	formatSubscriptionStatusLabel,
	subscriptionStatusColors,
} from '../subscriptionStatus.js';

export function StatusBadge( {
	status,
	children,
	className = '',
} ) {
	const colors = subscriptionStatusColors( status );
	const label =
		children ?? formatSubscriptionStatusLabel( status );

	return (
		<span
			className={ [
				'inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold',
				className,
			]
				.filter( Boolean )
				.join( ' ' ) }
			style={ {
				color: colors.color,
				backgroundColor: colors.backgroundColor,
				borderColor: colors.borderColor,
			} }
		>
			{ label }
		</span>
	);
}
