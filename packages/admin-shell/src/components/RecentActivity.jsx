import { Link } from 'react-router-dom';
import { ReactComponent as SkipForwardIcon } from '@stayilo/design-system/assets/svg/SkipForward.svg';
import { ReactComponent as CreditCardIcon } from '@stayilo/design-system/assets/svg/CreditCard.svg';
import { ReactComponent as WarningIcon } from '@stayilo/design-system/assets/svg/Warning.svg';
import { LockedBadge } from '@stayilo/design-system';
import { ReactComponent as ArrowDiagonal } from '../assets/svg/arrow-diagonal.svg';

const EVENT_ICONS = {
	skip_delivery: {
		Icon: SkipForwardIcon,
		bg: 'bg-[#FFFBEB]',
	},
	payment_received: {
		Icon: CreditCardIcon,
		bg: 'bg-[#615FFF]',
	},
	payment_failed: {
		Icon: WarningIcon,
		bg: 'bg-[#FF6467]',
	},
	payment_failed_reminder: {
		Icon: WarningIcon,
		bg: 'bg-[#FF6467]',
	},
};

function ActivityIcon( { eventType } ) {
	const config = EVENT_ICONS[ eventType ] || EVENT_ICONS.skip_delivery;
	const { Icon, bg } = config;

	return (
		<span
			className={ `flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ bg }` }
		>
			<Icon width={ 16 } height={ 16 } aria-hidden="true" />
		</span>
	);
}

/**
 * Recent activity card — matches Figma free/core dashboard widget.
 */
export function RecentActivity( { items = [], hasGrowth = false } ) {
	return (
		<div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#0D11171A] bg-white">
			<div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#0D111714] px-5 py-4">
				<h2 className="text-sm leading-5 font-semibold uppercase text-[#474C57]">
					Recent activity
				</h2>
				{ hasGrowth ? (
					<Link
						to="/activity"
						className="inline-flex shrink-0 items-center gap-1 text-sm font-medium leading-5 text-[#7C8494] no-underline transition-colors hover:text-stayilo-ink"
					>
						View all
						<ArrowDiagonal width={ 14 } height={ 14 } aria-hidden="true" />
					</Link>
				) : null }
			</div>

			<ul className="min-h-0 flex-1 divide-y divide-stayilo-border">
				{ items.length === 0 ? (
					<li className="px-5 py-8 text-center text-sm text-stayilo-muted">
						No skip or address activity yet.
					</li>
				) : (
					items.map( ( item ) => (
						<li
							key={ item.id }
							className="flex items-center gap-4 px-5 py-3"
						>
							<ActivityIcon eventType={ item.eventType } />

							<div className="min-w-0 flex-1">
								<p className="truncate text-sm leading-5">
									<span className="font-semibold text-[#0D1117]">{ item.actor }</span>
									{ item.description ? (
										<span className="font-normal text-[#7C8494]">
											{ ' ' }
											{ item.description }
										</span>
									) : null }
								</p>
							</div>

							<div className="flex shrink-0 items-center gap-4">
								{ item.amountFormatted ? (
									<span className="text-sm font-medium text-stayilo-accent font-mono">
										{ item.amountFormatted }
									</span>
								) : null }
								<span className="text-xs text-[#7C8494] leading-4 font-normal font-mono">
									{ item.timeAgo }
								</span>
							</div>
						</li>
					) )
				) }
			</ul>

			{ ! hasGrowth ? (
				<div className="mt-auto flex shrink-0 flex-wrap items-center justify-between gap-4 bg-stayilo-surface-soft px-5 py-4">
					<p className="text-sm font-semibold text-stayilo-ink">
						Showing skip &amp; payment events only
					</p>
					<div className="flex items-center gap-4">
						<LockedBadge>growth</LockedBadge>
						<span className="font-mono text-xs leading-4 text-[#7C8494]">
							Full event log
						</span>
					</div>
				</div>
			) : null }
		</div>
	);
}
