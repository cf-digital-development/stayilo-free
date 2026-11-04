import { ReactComponent as CheckIcon } from '../../assets/svg/Check.svg';
import warningUrl from '../../assets/svg/Warning.svg';
import failUrl from '../../assets/svg/Fail.svg';
import emptyUrl from '../../assets/svg/Empty.svg';

const STATUS_ICONS = {
	valid: (
		<CheckIcon
			className="block w-4 h-4 text-stayilo-accent"
			aria-hidden="true"
		/>
	),
	warning: <img src={ warningUrl } alt="" aria-hidden="true" width={ 20 } height={ 20 } />,
	error: <img src={ failUrl } alt="" aria-hidden="true" width={ 20 } height={ 20 } />,
};

const STATUS_BG = {
	warning: 'bg-[#D977060A]',
	error: 'bg-[#DC26260A]',
	upgrade: 'bg-[#EEF2FF]',
};

const MESSAGE_COLOR = {
	warning: 'text-[#D97706]',
	error: 'text-[#DC2626]',
	upgrade: 'text-[#4F46E5]',
};

const UPGRADE_BTN_CLASS =
	'shrink-0 inline-flex items-center justify-center rounded-lg bg-[#6366F1] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2';

/**
 * Requirement / environment check row. Read-only: status comes from
 * the actual environment check, not user interaction.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} [props.version]
 * @param {string} [props.requirement]
 * @param {'valid'|'warning'|'error'|'upgrade'|null} [props.status=null] - null = pending/unknown
 * @param {string} [props.message] - Explanation shown under the subtitle
 * @param {string} [props.actionLabel] - CTA label for upgrade status
 * @param {string} [props.actionHref] - Optional link for the upgrade CTA
 * @param {import('react').ReactNode} [props.icon] - Custom status icon override
 * @param {string} [props.className]
 */
export default function RequirementCard( {
	title,
	subtitle,
	version,
	requirement,
	status = null,
	message,
	actionLabel,
	actionHref,
	icon,
	className = '',
} ) {
	const resolvedSubtitle = subtitle ?? version ?? requirement ?? '';
	const resolvedActionLabel =
		actionLabel || ( status === 'upgrade' ? 'Upgrade plan' : '' );

	const classes = [
		'flex items-center justify-between gap-3 px-4 py-3 rounded-xl box-border',
		STATUS_BG[ status ] ?? 'bg-stayilo-surface-soft',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	const messageClasses = [
		'mt-0.5 font-inter font-medium text-[13px] leading-[18px]',
		MESSAGE_COLOR[ status ] ?? '',
	]
		.filter( Boolean )
		.join( ' ' );

	let statusControl = (
		<div
			className="shrink-0 inline-flex items-center justify-center min-w-[24px] min-h-[24px] rounded-full select-none bg-stayilo-accent-soft"
			aria-label={ status ?? 'pending' }
		>
			{ icon ?? (
				status
					? STATUS_ICONS[ status ]
					: <img src={ emptyUrl } alt="" aria-hidden="true" width={ 22 } height={ 22 } />
			) }
		</div>
	);

	if ( status === 'upgrade' ) {
		statusControl = actionHref ? (
			<a
				href={ actionHref }
				className={ UPGRADE_BTN_CLASS }
				aria-label={ resolvedActionLabel }
			>
				{ resolvedActionLabel }
			</a>
		) : (
			<span className={ UPGRADE_BTN_CLASS } aria-label={ resolvedActionLabel }>
				{ resolvedActionLabel }
			</span>
		);
	}

	return (
		<div className={ classes } role="listitem">
			<div className="min-w-0">
				<div className="stayilo-type-title-md">{ title }</div>
				{ resolvedSubtitle ? (
					<div className="stayilo-type-body-muted">{ resolvedSubtitle }</div>
				) : null }
				{ message ? (
					<div className={ messageClasses }>{ message }</div>
				) : null }
			</div>
			{ statusControl }
		</div>
	);
}
