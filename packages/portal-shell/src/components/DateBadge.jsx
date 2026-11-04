import { parseDateId } from '../utils/monthCalendar.js';
import { toDateParts } from '../utils/validation/deliveryDates.js';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Compact calendar date badge — weekday / day / month.
 *
 * @param {object} props
 * @param {string} [props.weekday='MON'] - Abbreviated weekday (e.g. MON).
 * @param {string|number} [props.day=17] - Day of month.
 * @param {string} [props.month='SEPT'] - Abbreviated month (e.g. SEPT).
 * @param {Date|string|number} [props.date] - Optional Date; fills weekday/day/month when provided.
 * @param {boolean} [props.selected=false]
 * @param {boolean} [props.disabled=false]
 * @param {() => void} [props.onClick]
 * @param {string} [props.backgroundColor]
 * @param {string} [props.className]
 */
export function DateBadge( {
	weekday,
	day,
	month,
	date,
	selected = false,
	disabled = false,
	onClick,
	backgroundColor,
	className = '',
} ) {
	const resolved = resolveDateParts( { weekday, day, month, date } );
	const isButton = typeof onClick === 'function';
	const Tag = isButton ? 'button' : 'time';

	return (
		<Tag
			type={ isButton ? 'button' : undefined }
			disabled={ isButton ? disabled : undefined }
			className={ [
				'portal-date-badge',
				selected ? 'portal-date-badge--selected' : '',
				isButton ? 'portal-date-badge--interactive' : '',
				disabled ? 'portal-date-badge--disabled' : '',
				className,
			].filter( Boolean ).join( ' ' ) }
			style={ backgroundColor && ! selected ? { backgroundColor } : undefined }
			dateTime={ isButton ? undefined : resolved.dateTime }
			aria-label={ resolved.ariaLabel }
			aria-pressed={ isButton ? selected : undefined }
			onClick={ disabled ? undefined : onClick }
		>
			<span className="portal-date-badge__weekday">{ resolved.weekday }</span>
			<span className="portal-date-badge__day">{ resolved.day }</span>
			<span className="portal-date-badge__month">{ resolved.month }</span>
		</Tag>
	);
}

function resolveDateParts( { weekday, day, month, date } ) {
	const parsed = parseDateId( date );
	if ( parsed ) {
		const parts = toDateParts( parsed );
		return {
			weekday: weekday ?? parts.weekday,
			day: day ?? parts.day,
			month: month ?? parts.month,
			dateTime: parts.id,
			ariaLabel: parsed.toLocaleDateString( ( typeof document !== 'undefined' && document.documentElement.lang ) || undefined, {
				weekday: 'long',
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			} ),
		};
	}

	const weekdayValue = weekday ?? __( 'MON', 'stayilo' );
	const dayValue = day ?? 17;
	const monthValue = month ?? __( 'SEPT', 'stayilo' );

	return {
		weekday: weekdayValue,
		day: dayValue,
		month: monthValue,
		dateTime: undefined,
		ariaLabel: `${ weekdayValue } ${ dayValue } ${ monthValue }`,
	};
}
