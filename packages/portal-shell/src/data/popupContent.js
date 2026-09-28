/** Cancel / retention popup step copy. */

import { __, _n, sprintf } from '@stayilo/design-system/i18n';
import {
	formatDeliveryFrequency,
	getSelectableFrequencyOptions,
	getSubscriptionFrequencyOptionId,
} from '../utils/delivery/frequency.js';

const DEFAULT_CANCEL_REASON_OPTIONS = [
	{ id: 'too-expensive', label: __( 'Too expensive for me', 'stayilo' ) },
	{ id: 'no-longer-need', label: __( 'No longer need', 'stayilo' ) },
	{ id: 'vacation-or-move', label: __( 'Going to vacation or move to another place', 'stayilo' ) },
	{ id: 'not-happy', label: __( 'Not happy with products', 'stayilo' ) },
	{ id: 'others', label: __( 'Others', 'stayilo' ) },
];

/**
 * Merchant-configured reasons (Growth cancellation-flow builder /
 * STAYILO_Pro_Cancellation_Flow_Service), localized onto
 * window.stayiloPortal.cancellationFlow. Free has plain cancel only —
 * no offers — and falls back to the built-in reason list when Pro isn't
 * active or the merchant hasn't configured anything yet.
 *
 * The "others" free-text option is always present — CancelSubscriptionPopup
 * shows a textarea for free-text reason ids.
 */
function getConfiguredCancellationFlow() {
	const configured =
		typeof window !== 'undefined' ? window.stayiloPortal?.cancellationFlow : null;
	if ( Array.isArray( configured ) && configured.length ) {
		return configured;
	}
	// wp_localize_script can turn a list into a plain object.
	if ( configured && typeof configured === 'object' ) {
		const rows = Object.values( configured ).filter(
			( row ) => row && typeof row === 'object'
		);
		return rows.length ? rows : null;
	}
	return null;
}

function normalizeReasonId( id ) {
	const raw = String( id || '' );
	return raw === 'other' ? 'others' : raw;
}

/** Ids that unlock the free-text textarea on the reasons step. */
export function isFreeTextReasonId( id ) {
	const key = normalizeReasonId( id );
	return key === 'others' || key === 'other';
}

/**
 * wp_localize_script sometimes turns numeric arrays into objects.
 * @param {unknown} value
 * @returns {object[]}
 */
function asOfferList( value ) {
	if ( Array.isArray( value ) ) {
		return value.filter( ( row ) => row && typeof row === 'object' );
	}
	if ( value && typeof value === 'object' ) {
		return Object.values( value ).filter( ( row ) => row && typeof row === 'object' );
	}
	return [];
}

/**
 * @param {object} row
 * @returns {object|null}
 */
function normalizeOffer( row ) {
	if ( ! row || typeof row !== 'object' ) {
		return null;
	}
	if ( ! ( row.id || row.type || row.summary || row.label ) ) {
		return null;
	}
	return {
		...row,
		id: String( row.id || `offer-${ row.type || 'retain' }` ),
		type: String( row.type || '' ),
		label: String( row.label || row.type || __( 'Offer', 'stayilo' ) ),
		summary: String( row.summary || row.label || '' ).trim(),
		percent: row.percent ?? '',
		renewals: row.renewals ?? '',
	};
}

/**
 * Headline + body for a retention offer step.
 *
 * @param {object} offer
 * @returns {{ title: string, description: string }}
 */
function buildOfferStepCopy( offer ) {
	const type = String( offer.type || '' );
	const summary = String( offer.summary || '' ).trim();
	const label = String( offer.label || '' ).trim();
	const pct = offer.percent === '' || offer.percent == null ? null : Number( offer.percent );
	const renewals =
		offer.renewals === '' || offer.renewals == null ? null : Number( offer.renewals );

	if ( type === 'discount' && pct ) {
		if ( summary ) {
			return {
				title: summary,
				description:
					renewals && ! summary.toLowerCase().includes( 'renewal' )
						? sprintf(
							_n(
								'Applies to your next %d renewal.',
								'Applies to your next %d renewals.',
								renewals,
								'stayilo'
							),
							renewals
						)
						: __( 'You can skip or cancel anytime.', 'stayilo' ),
			};
		}
		if ( renewals ) {
			return {
				title: sprintf(
					_n(
						'Get %1$d%% off your next %2$d renewal',
						'Get %1$d%% off your next %2$d renewals',
						renewals,
						'stayilo'
					),
					pct,
					renewals
				),
				description: __( 'You can skip or cancel anytime.', 'stayilo' ),
			};
		}
		return {
			title: sprintf( __( 'Get %d%% off your next subscription', 'stayilo' ), pct ),
			description: __( 'You can skip or cancel anytime.', 'stayilo' ),
		};
	}

	if ( summary ) {
		return {
			title: summary,
			description:
				label && label !== summary
					? label
					: __( 'Keep your subscription with this offer — you can skip or cancel anytime.', 'stayilo' ),
		};
	}

	if ( label ) {
		return {
			title: label,
			description: __( 'Keep your subscription with this offer — you can skip or cancel anytime.', 'stayilo' ),
		};
	}

	return {
		title: __( 'Keep your subscription', 'stayilo' ),
		description: __( 'Keep your subscription with this offer — you can skip or cancel anytime.', 'stayilo' ),
	};
}

/**
 * Offers attached to the selected reason(s), in merchant order.
 * Never falls back to another reason's offers.
 * Free (no merchant flow) never returns offers — cancel goes straight
 * through after the reason step.
 *
 * @param {string[]} [selectedReasonIds]
 * @returns {object[]}
 */
export function listOffersForReasons( selectedReasonIds = [] ) {
	const configured = getConfiguredCancellationFlow();

	// Free tier / no Core+ cancellation flow — no retention offers.
	if ( ! configured ) {
		return [];
	}

	const selected = ( selectedReasonIds || [] ).map( ( id ) => normalizeReasonId( id ) );
	if ( ! selected.length ) {
		return [];
	}

	const offers = [];
	for ( const reason of configured ) {
		const id = normalizeReasonId( reason?.id );
		if ( ! selected.includes( id ) ) {
			continue;
		}
		for ( const row of asOfferList( reason.offers ) ) {
			const offer = normalizeOffer( row );
			if ( offer ) {
				offers.push( offer );
			}
		}
	}
	return offers;
}

export function buildCancelReasonOptions() {
	const configured = getConfiguredCancellationFlow();

	if ( ! configured ) {
		return DEFAULT_CANCEL_REASON_OPTIONS;
	}

	const options = configured
		.filter( ( reason ) => reason?.id && ( reason.label || reason.title ) )
		.map( ( reason ) => ( {
			id: normalizeReasonId( reason.id ),
			label: reason.label || reason.title,
		} ) );

	if ( ! options.length ) {
		return DEFAULT_CANCEL_REASON_OPTIONS;
	}

	if ( ! options.some( ( option ) => isFreeTextReasonId( option.id ) ) ) {
		options.push( { id: 'others', label: __( 'Others', 'stayilo' ) } );
	}

	return options;
}

/**
 * Build the retention-offer popup step for the offer at `offerIndex`.
 *
 * @param {string[]} [selectedReasonIds]
 * @param {number} [offerIndex=0]
 */
export function resolveOfferStep( selectedReasonIds = [], offerIndex = 0 ) {
	const configured = getConfiguredCancellationFlow();
	const offers = listOffersForReasons( selectedReasonIds );
	const offer = offers[ Math.max( 0, offerIndex ) ] || null;

	// No offer for this reason (Free, or Core+ reason with an empty list).
	// CancelSubscriptionPopup skips this step via shouldShowOfferAfterReasons;
	// this is only a safe fallback if the offer step is opened anyway.
	if ( ! offer ) {
		return {
			title: __( 'Continue cancelling?', 'stayilo' ),
			description: configured
				? __( 'No retention offer is configured for the reason you selected.', 'stayilo' )
				: __( 'Your subscription will be cancelled.', 'stayilo' ),
			actions: [
				{
					id: 'cancel-anyway',
					label: __( 'Yes, cancel my subscription', 'stayilo' ),
					variant: 'danger',
				},
			],
			offer: null,
			offerCount: 0,
			offerIndex: 0,
		};
	}

	const type = String( offer.type || '' );
	const { title, description } = buildOfferStepCopy( offer );

	let keepLabel = 'Yes, Keep My Subscription';
	if ( type === 'discount' ) {
		keepLabel = 'Yes, Apply My Discount';
	} else if ( type === 'pause' ) {
		keepLabel = 'Yes, Pause My Subscription';
	} else if ( type === 'skip' || type === 'delay-renewal' ) {
		keepLabel = 'Yes, Skip Next Order';
	} else if ( type === 'change-frequency' ) {
		keepLabel = 'Yes, Change Frequency';
	} else if ( type === 'reduce-qty' ) {
		keepLabel = 'Yes, Reduce My Quantity';
	}

	return {
		title,
		description,
		actions: [
			{ id: 'keep', label: keepLabel, variant: 'success' },
			{
				id: 'cancel-anyway',
				label: __( 'No thanks, continue cancelling', 'stayilo' ),
				variant: 'dangerOutline',
			},
		],
		offer,
		offerCount: offers.length,
		offerIndex: Math.max( 0, offerIndex ),
	};
}

/**
 * Whether the retention step should run after reasons.
 * Free: never (no offers / no offer popups).
 * Core+: only when the selected reason has at least one configured offer;
 * otherwise cancel immediately after the reason step.
 *
 * @param {string[]} [selectedReasonIds]
 * @returns {boolean}
 */
export function shouldShowOfferAfterReasons( selectedReasonIds = [] ) {
	return listOffersForReasons( selectedReasonIds ).length > 0;
}

/**
 * Offer types that need a customer choice before apply.
 *
 * @param {object|null|undefined} offer
 * @returns {boolean}
 */
export function offerNeedsCustomerChoice( offer ) {
	const type = String( offer?.type || '' );
	return (
		type === 'reduce-qty' ||
		type === 'change-frequency' ||
		type === 'delay-renewal'
	);
}

/**
 * Configure-step options for an offer + live subscription.
 *
 * @param {object|null|undefined} offer
 * @param {object|null|undefined} subscription
 * @returns {{
 *   title: string,
 *   description: string,
 *   options: Array<{ id: string, label: string, value?: object }>,
 *   confirmLabel: string,
 *   choiceKey: 'quantity'|'frequency'|'delay_weeks'|null,
 * }}
 */
export function buildOfferConfigureStep( offer, subscription ) {
	const type = String( offer?.type || '' );

	if ( type === 'reduce-qty' ) {
		const maxQty = Math.max(
			0,
			...( Array.isArray( subscription?.lineItems )
				? subscription.lineItems.map( ( line ) =>
						Math.max( 1, Number( line.quantity ) || 1 )
				  )
				: [ 0 ] )
		);
		const options = [];
		for ( let qty = 1; qty < maxQty; qty += 1 ) {
			options.push( {
				id: `qty-${ qty }`,
				label: sprintf( _n( '%d item per product', '%d items per product', qty, 'stayilo' ), qty ),
				value: { quantity: qty },
			} );
		}
		return {
			title: __( 'Choose a smaller quantity', 'stayilo' ),
			description:
				maxQty > 1
					? sprintf( __( 'Your largest line is currently %d. Pick a lower quantity to keep your subscription.', 'stayilo' ), maxQty )
					: __( 'This subscription is already at the minimum quantity, so this offer can’t be applied.', 'stayilo' ),
			options,
			confirmLabel: __( 'Apply new quantity', 'stayilo' ),
			choiceKey: 'quantity',
		};
	}

	if ( type === 'change-frequency' ) {
		const currentId = getSubscriptionFrequencyOptionId( subscription );
		const currentDays = frequencyDays(
			subscription?.billingInterval,
			subscription?.billingPeriod
		);
		const options = getSelectableFrequencyOptions( subscription )
			.filter( ( option ) => {
				if ( option.id === currentId ) {
					return false;
				}
				// Retention offer = deliver less often (extend interval).
				return frequencyDays( option.interval, option.period ) > currentDays;
			} )
			.map( ( option ) => ( {
				id: option.id,
				label: option.label,
				value: {
					billingInterval: option.interval,
					billingPeriod: option.period,
				},
			} ) );

		return {
			title: __( 'Choose a new order frequency', 'stayilo' ),
			description: currentId
				? sprintf( __( 'Current: %s. Pick a less frequent schedule.', 'stayilo' ), formatDeliveryFrequency( subscription ) )
				: __( 'Pick how often you want orders.', 'stayilo' ),
			options,
			confirmLabel: __( 'Apply new frequency', 'stayilo' ),
			choiceKey: 'frequency',
		};
	}

	if ( type === 'delay-renewal' ) {
		const options = [ 1, 2, 3, 4 ].map( ( weeks ) => ( {
			id: `delay-${ weeks }`,
			label: sprintf( _n( 'Delay by %d week', 'Delay by %d weeks', weeks, 'stayilo' ), weeks ),
			value: { delayWeeks: weeks },
		} ) );
		return {
			title: __( 'Delay your next renewal', 'stayilo' ),
			description: __( 'Push your next payment and order out by the number of weeks you choose.', 'stayilo' ),
			options,
			confirmLabel: __( 'Delay my renewal', 'stayilo' ),
			choiceKey: 'delay_weeks',
		};
	}

	return {
		title: __( 'Keep your subscription', 'stayilo' ),
		description: __( 'Confirm to apply this offer.', 'stayilo' ),
		options: [],
		confirmLabel: __( 'Apply offer', 'stayilo' ),
		choiceKey: null,
	};
}

/**
 * @param {number|string|undefined} interval
 * @param {string|undefined} period
 * @returns {number}
 */
function frequencyDays( interval, period ) {
	const step = Math.max( 1, Number( interval ) || 1 );
	const unit = String( period || 'week' ).toLowerCase();
	if ( unit === 'day' ) return step;
	if ( unit === 'week' ) return step * 7;
	if ( unit === 'month' ) return step * 30;
	if ( unit === 'year' ) return step * 365;
	return step * 7;
}

/**
 * Success copy after an offer was applied.
 *
 * @param {object|null|undefined} offer
 * @param {object|null|undefined} applied
 * @returns {{ title: string, description: string }}
 */
export function buildOfferAppliedStep( offer, applied ) {
	const type = String( applied?.type || offer?.type || '' );

	if ( type === 'discount' ) {
		const pct = Number( applied?.percent || offer?.percent || 0 );
		const renewals = Number( applied?.renewals || offer?.renewals || 1 );
		return {
			title: __( 'Discount applied', 'stayilo' ),
			description: pct
				? sprintf(
					_n(
						'You’ll get %1$d%% off your next %2$d renewal. Your subscription total has been updated.',
						'You’ll get %1$d%% off your next %2$d renewals. Your subscription total has been updated.',
						renewals,
						'stayilo'
					),
					pct,
					renewals
				)
				: __( 'Your retention discount is saved on this subscription.', 'stayilo' ),
		};
	}
	if ( type === 'skip' ) {
		return {
			title: __( 'Next order skipped', 'stayilo' ),
			description: __( 'Your next payment date was moved forward by one billing period.', 'stayilo' ),
		};
	}
	if ( type === 'pause' ) {
		return {
			title: __( 'Subscription paused', 'stayilo' ),
			description: __( 'You can resume anytime from your account.', 'stayilo' ),
		};
	}
	if ( type === 'delay-renewal' ) {
		const weeks = Number( applied?.delay_weeks || 0 );
		return {
			title: __( 'Renewal delayed', 'stayilo' ),
			description: weeks
				? sprintf(
					_n(
						'Your next renewal was pushed out by %d week.',
						'Your next renewal was pushed out by %d weeks.',
						weeks,
						'stayilo'
					),
					weeks
				)
				: __( 'Your next renewal date was updated.', 'stayilo' ),
		};
	}
	if ( type === 'reduce-qty' ) {
		return {
			title: __( 'Quantity updated', 'stayilo' ),
			description: applied?.quantity
				? sprintf( __( 'Your subscription quantity is now %s.', 'stayilo' ), applied.quantity )
				: __( 'Your subscription quantity was reduced.', 'stayilo' ),
		};
	}
	if ( type === 'change-frequency' ) {
		return {
			title: __( 'Frequency updated', 'stayilo' ),
			description: __( 'Your order schedule was changed. You can adjust it again later from your subscription.', 'stayilo' ),
		};
	}

	return {
		title: __( 'Your subscription is active now', 'stayilo' ),
		description: __( 'Great choice — your subscription stays active with the offer applied.', 'stayilo' ),
	};
}

export const CANCEL_POPUP_STEPS = {
	reasons: {
		title: __( 'Cancel Subscription', 'stayilo' ),
		description: __(
			'Please share your reasons for cancelling your current subscription.',
			'stayilo'
		),
		get options() {
			return buildCancelReasonOptions();
		},
		actions: [
			{ id: 'continue', label: __( 'No thanks, continue cancelling', 'stayilo' ), variant: 'danger' },
		],
	},
	confirm: {
		title: __( 'Cancel Subscription', 'stayilo' ),
		description: __(
			'Are you sure you want to cancel? You can always pause your subscription and pick up right where you left off anytime!',
			'stayilo'
		),
		actions: [
			{ id: 'keep-subscription', label: __( 'No, Keep my subscription', 'stayilo' ), variant: 'success' },
			{ id: 'yes-cancel', label: __( 'Yes, Cancel', 'stayilo' ), variant: 'danger' },
		],
	},
	// Placeholder only — live offer UI uses resolveOfferStep(). Free never shows offers.
	offer: {
		title: __( 'Continue cancelling?', 'stayilo' ),
		description: __( 'Your subscription will be cancelled.', 'stayilo' ),
		actions: [
			{
				id: 'cancel-anyway',
				label: __( 'Yes, cancel my subscription', 'stayilo' ),
				variant: 'danger',
			},
		],
		offer: null,
	},
	canceled: {
		title: __( 'Your subscription is now cancelled.', 'stayilo' ),
		description: __(
			'We’re sorry to see you go. You can resubscribe anytime from your account.',
			'stayilo'
		),
		actions: [],
	},
	active: {
		title: __( 'Your subscription is active now', 'stayilo' ),
		description: __(
			'Great choice — your subscription stays active with the offer applied.',
			'stayilo'
		),
		actions: [],
	},
};

/** Manage delivery popup — sample dates + copy. */
export const DEFAULT_DELIVERY_TIME_WINDOW = '';

export const DEFAULT_SKIP_TIME_WINDOW = '';

/** @deprecated Use formatDeliveryEstimateLabel() with live subscription date. */
export const MANAGE_DELIVERY_ESTIMATE = 'Sun, Aug 17';

/** @deprecated Use formatDeliverySkipLabel() with live subscription date. */
export const SKIP_DELIVERY_WINDOW = 'Thu, Sep 20';
