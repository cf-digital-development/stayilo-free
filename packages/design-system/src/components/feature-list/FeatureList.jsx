import { __ } from '../../i18n.js';
import { ReactComponent as CheckIcon } from '../../assets/svg/Check.svg';
import { ArrowRightIcon } from '../buttons/button';

/** Default feature lists for the Welcome step. */
export const CORE_FEATURES = [
	__( 'Full customer self-service portal', 'stayilo' ),
	__( 'Skip, pause, edit & reschedule deliveries', 'stayilo' ),
	__( 'Basic branding — logo, colour & font', 'stayilo' ),
	__( 'Automated email notifications', 'stayilo' ),
	__( 'Guided setup wizard', 'stayilo' ),
	__( 'Subscriber list & activity', 'stayilo' ),
];

export const GROWTH_FEATURES = [
	__( 'Cancellation flow with retention offers', 'stayilo' ),
	__( 'Rules engine for skips, pauses & cancellations', 'stayilo' ),
	__( 'Retention & revenue reporting', 'stayilo' ),
	__( 'Full event timeline', 'stayilo' ),
	__( 'Klaviyo & webhook integrations', 'stayilo' ),
	__( 'Custom CSS for complete control', 'stayilo' ),
];

/** @deprecated Use {@link GROWTH_FEATURES} */
export const PRO_FEATURES = GROWTH_FEATURES;

/** Small "✦ PRO" pill badge (used elsewhere in the wizard). */
export function ProBadge( { text = __( 'PRO', 'stayilo' ) } ) {
	return (
		<span className="inline-flex items-center gap-[2.5px] whitespace-nowrap rounded-full bg-stayilo-core-soft px-1.5 py-px font-inter text-[9px] font-black uppercase leading-[13.5px] tracking-[0.22px] text-stayilo-core">
			{ text }
		</span>
	);
}

/**
 * Plan comparison card for the Welcome step (Core vs Growth).
 *
 * @param {object} props
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {string[]} props.items
 * @param {'core'|'growth'} [props.variant='core']
 * @param {string} [props.badge]
 * @param {string} [props.actionLabel]
 * @param {() => void} [props.onAction]
 * @param {string} [props.className]
 */
export default function FeatureList( {
	title,
	subtitle,
	items = [],
	variant = 'core',
	badge,
	actionLabel,
	onAction,
	className = '',
} ) {
	if ( ! items.length ) {
		return null;
	}

	const isGrowth = variant === 'growth';

	const cardClasses = [
		'relative box-border flex h-full flex-col rounded-[20px] border  p-5 font-inter bg-white',
		isGrowth ? 'border-[#8200DB]' : 'border-[#EAEAEA]',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	return (
		<div className={ cardClasses }>
			{ badge ? (
				<span className="absolute -top-3 right-4 inline-flex items-center text-[#8200DB] rounded-full border border-[#8200DB66] bg-[#F3E8FF] px-3 py-[2px] font-inter text-sm font-bold leading-5 ">
					{ badge }
				</span>
			) : null }

			{ title ? (
				<p
					className={ `stayilo-type-label-caps-sm ${ subtitle ? 'mb-4' : 'mb-7' }` }
				>
					{ title }
				</p>
			) : null }

			{ subtitle ? (
				<p className="stayilo-type-label-caps-sm mb-3 !text-sm !font-bold !leading-5">{ subtitle }</p>
			) : null }

			<ul className="stayilo-stack-12 m-0 flex-1 list-none p-0">
				{ items.map( ( item, index ) => {
					const label = typeof item === 'string' ? item : item.label;

					return (
						<li
							key={ label + index }
							className="stayilo-type-body flex items-start gap-2.5 text-stayilo-ink"
						>
							<span
								className="inline-flex shrink-0 items-center justify-center pt-0.5"
								aria-hidden="true"
							>
								<CheckIcon className="block h-4 w-4 text-[#6366F1]" />
							</span>
							<span>{ label }</span>
						</li>
					);
				} ) }
			</ul>

			{ actionLabel ? (
				<div className="mt-6">
					{ isGrowth ? (
						<button
							type="button"
							className="inline-flex w-fit items-center gap-2  bg-[#8200DB] rounded-[12px] border-0  px-6 py-3 font-inter text-base font-bold leading-5 text-white transition-opacity hover:opacity-90"
							onClick={ onAction }
						>
							<span>{ actionLabel }</span>
							<ArrowRightIcon />
						</button>
					) : (
						<button
							type="button"
							className="inline-flex gap-2 w-fit items-center justify-center rounded-[12px] border border-[#2B7FFF66] bg-[#EFF5FF]  text-[#2B7FFF] px-6 py-3 font-inter text-base font-semibold leading-5"
							disabled
							aria-disabled="true"
						>
							{ actionLabel }
						</button>
					) }
				</div>
			) : null }
		</div>
	);
}
