import { useSyncExternalStore } from 'react';
import { ReactComponent as AccountArrowIcon } from '@stayilo/design-system/assets/svg/account-arrow.svg';
import { ReactComponent as SealCheckIcon } from '@stayilo/design-system/assets/svg/SealCheck.svg';
import { ReactComponent as GlobeIcon } from '@stayilo/design-system/assets/svg/Globe.svg';
import { ReactComponent as FireIcon } from '../../../admin-shell/src/assets/svg/Fire-account.svg';
import { ReactComponent as KeyIcon } from '../../../admin-shell/src/assets/svg/Key.svg';
import { ReactComponent as ClockIcon } from '../../../admin-shell/src/assets/svg/Clock.svg';
import { ReactComponent as CalendarIcon } from '../../../admin-shell/src/assets/svg/CalendarCheck.svg';
import { ReactComponent as CrownIcon } from '@stayilo/design-system/assets/svg/Crown.svg';
import {
	LockedFeature,
	PremiumLoadingState,
	hasTierAccess,
	subscribePremium,
	getPremiumSnapshot,
	useMerchantTier,
} from '@stayilo/admin-shell';
import { getStayiloRegistry } from '@stayilo/extension-sdk';
import { resolveSubscriberCap } from '@stayilo/design-system/validation';
import { getUpgradeUrl } from '@stayilo/admin-shell';
import { ReactComponent as FlowIcon } from '@stayilo/design-system/assets/svg/account-flow.svg';
import { ReactComponent as UsersIcon } from '@stayilo/design-system/assets/svg/account-user.svg';
import { ReactComponent as PaintIcon } from '../../../admin-shell/src/assets/svg/PaintBrushHousehold.svg';
import { ReactComponent as EnvelopeIcon } from '../../../admin-shell/src/assets/svg/EnvelopeSimple.svg';
import { ReactComponent as LinkIcon } from '../../../admin-shell/src/assets/svg/LinkSimpleHorizontal.svg';
import { ReactComponent as SkipIcon } from '../assets/svg/account-skip.svg';
import { ReactComponent as ShippingIcon } from '../assets/svg/account-shipping.svg';
import { ReactComponent as TemplatesIcon } from '../../../admin-shell/src/assets/svg/Templates.svg';
import { ReactComponent as RulesIcon } from '../assets/svg/account-rules.svg';
import { ReactComponent as BellIcon } from '../assets/svg/account-bell.svg';

const admin = typeof window !== 'undefined' ? window.stayiloAdmin || {} : {};
const subscriberCap = resolveSubscriberCap( admin.freeSubscriberCap );
const freeCapFeature =
	subscriberCap > 0 ? `${ subscriberCap } subscribers` : 'Customer portal';

const LICENCE_SLOT_ID = 'account-licence';

const FEATURE_ICONS = {
	'Cancellation flows': FlowIcon,
	'Up to 500 subscribers': UsersIcon,
	'No subscriber cap': UsersIcon,
	'Customer portal': UsersIcon,
	[ freeCapFeature ]: UsersIcon,
	'Unlimited subscribers': UsersIcon,
	'Portal branding': PaintIcon,
	'Customer emails': EnvelopeIcon,
	'1 webhook endpoint': LinkIcon,
	'Skip delivery': SkipIcon,
	'Update address': ShippingIcon,
	'Templates (Classic / Minimal)': TemplatesIcon,
	'Cancellation flows + A/B offers': FlowIcon,
	'Rules engine': RulesIcon,
	'Klaviyo + Zapier': LinkIcon,
	'Priority support': BellIcon,
};

const PLAN_COPY = {
	free: {
		name: 'Stayilo Free',
		priceLine:
			subscriberCap > 0
				? `Free · ${ subscriberCap } active subscriber cap`
				: 'Free',
		features: [
			'Skip delivery',
			'Update address',
			'Portal branding',
			freeCapFeature,
		],
		cta: 'Upgrade to Core',
		upsellTitle: 'What you unlock with Core',
		upsellBody:
			subscriberCap > 0
				? 'Full portal actions · Customer emails · No subscriber cap · Priority support'
				: 'Full portal actions · Customer emails · Priority support',
	},
	core: {
		name: 'Stayilo Core',
		priceLine: '£99.00 / month',
		features: [
			'Cancellation flows',
			'No subscriber cap',
			'Portal branding',
			'Customer emails',
			'1 webhook endpoint',
		],
		cta: 'Upgrade to Growth',
		upsellTitle: 'What you unlock with Growth',
		upsellBody:
			'Unlimited subscribers · A/B test offers · Klaviyo + Zapier · Priority support',
	},
	growth: {
		name: 'Stayilo Growth',
		priceLine: '£179.00 / month',
		features: [
			'Unlimited subscribers',
			'Cancellation flows + A/B offers',
			'Rules engine',
			'Klaviyo + Zapier',
			'Priority support',
		],
		cta: 'Manage plan',
		upsellTitle: 'You are on Growth',
		upsellBody: 'All retention features unlocked for this store.',
	},
};

function Field( { label, value } ) {
	return (
		<div>
			<p className="text-[12px] leading-4 font-semibold uppercase tracking-[1.1px] text-[#7C8494]">
				{ label }
			</p>
			<div className="mt-1 text-sm leading-5 text-stayilo-ink">{ value }</div>
		</div>
	);
}

function nextPaymentValue( tier ) {
	const key = String( tier || 'free' ).toLowerCase();
	// Match CurrentPlanCard: anything that isn't a paid plan reads as Free.
	if ( key !== 'core' && key !== 'growth' ) {
		return 'Free';
	}

	const amount = key === 'growth' ? '£179' : '£99';
	const renews = admin.planRenewsAt || admin.license?.renewsAt;

	if ( ! renews ) {
		return amount;
	}

	return (
		<span className="inline-flex flex-wrap items-center gap-2">
			<span>{ amount }</span>
			<span className="inline-flex items-center gap-1.5 text-stayilo-muted">
				<CalendarIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
				<span>{ renews }</span>
			</span>
		</span>
	);
}

function CurrentPlanCard( { tier } ) {
	const copy = PLAN_COPY[ tier ] || PLAN_COPY.free;
	const renews = admin.planRenewsAt || admin.license?.renewsAt;
	const priceLine = renews
		? `${ copy.priceLine } · renews ${ renews }`
		: copy.priceLine;
	const upgradeUrl = getUpgradeUrl( 'account_cta' );
	const compareUrl = getUpgradeUrl( 'account_compare' );

	return (
		<section className="rounded-2xl border border-[#0D11171A] bg-white p-5">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<p className="text-sm  font-semibold text-[#474C57] leading-5">Current plan</p>
					<h2 className="mt-1 text-2xl font-bold leading-8 text-stayilo-ink">
						{ copy.name }
					</h2>
					<p className="mt-2 text-sm text-[#7C8494] leading-5">{ priceLine }</p>
				</div>
				{ tier === 'growth' ? (
					<span className="inline-flex items-center gap-2 rounded-lg bg-[#6366F1] px-5 py-3 text-sm font-bold leading-5 text-white">
						<CrownIcon aria-hidden="true" />
						Growth
					</span>
				) : (
					<a
						href={ upgradeUrl }
						className="inline-flex items-center gap-2 rounded-xl bg-[#8200DB] px-6 py-3 text-base leading-6 font-bold !text-white no-underline transition-opacity hover:opacity-90 hover:!text-white focus:!text-white active:!text-white visited:!text-white"
					>
						{ copy.cta }
						<AccountArrowIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
					</a>
				) }
			</div>

			<ul className="mt-5 flex list-none flex-wrap gap-2 p-0">
				{ copy.features.map( ( feature ) => {
					const Icon = FEATURE_ICONS[ feature ] || FlowIcon;
					return (
						<li
							key={ feature }
							className=" !mb-0 inline-flex items-center gap-1.5 rounded-full border border-[#0D111714] bg-white px-3 py-[7px] text-xs leading-4 font-medium text-stayilo-ink"
						>
							<Icon className="shrink-0 text-stayilo-muted" style={{ color: '#7C8494' }} aria-hidden="true" />
							{ feature }
						</li>
					);
				} ) }
			</ul>

			{ tier !== 'growth' ? (
				<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#0D111714] pt-4">
					<div className="flex min-w-0 items-start gap-1.5">
						<FireIcon className=" h-6 w-6 shrink-0" aria-hidden="true" />
						<div className="min-w-0">
							<p className="text-base  leading-6 font-semibold text-stayilo-ink">
								{ copy.upsellTitle }
							</p>
							<p className="mt-1 text-sm text-[#7C8494] leading-5">
								{ copy.upsellBody }
							</p>
						</div>
					</div>
					<a
						href={ compareUrl }
						className="inline-flex shrink-0 items-center gap-1 text-base leading-6 font-semibold !text-[#6366F1] no-underline hover:!text-[#6366F1] focus:!text-[#6366F1] active:!text-[#6366F1] visited:!text-[#6366F1]"
					>
						Compare plans
						<AccountArrowIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
					</a>
				</div>
			) : null }
		</section>
	);
}

function AccountDetailsCard( { tier } ) {
	const accountUrl = getUpgradeUrl( 'account_manage' );
	const isFree = String( tier || 'free' ).toLowerCase() === 'free';

	return (
		<section className="rounded-2xl border border-[#0D111714] bg-white py-3">
			<h2 className=" px-5 text-sm font-semibold text-[#474C57] leading-5 pb-3 border-b border-[#0D111714]">Account</h2>
			<div className="px-5 grid gap-6 sm:grid-cols-2 mt-5">
				<Field label="Store name" value={ admin.siteName || 'Your store' } />
				<Field
					label="Owner email"
					value={
						admin.merchantEmail ||
						admin.adminEmail ||
						admin.ownerEmail ||
						'—'
					}
				/>
				<Field label="Platform" value="WooCommerce" />
				{ ! isFree ? (
					<>
						<Field
							label="Member since"
							value={ admin.memberSince || admin.installedAt || '—' }
						/>
						<Field label="Next payment" value={ nextPaymentValue( tier ) } />
					</>
				) : null }
			</div>
			{ ! isFree ? (
				<a
					href={ accountUrl }
					className="mt-5 ml-5 mb-2 inline-flex items-center gap-2 rounded-xl bg-stayilo-ink px-6 py-[10px] text-base leading-6 font-bold text-white no-underline transition-opacity hover:text-white"
				>
					Manage My Stayilo Account
					<AccountArrowIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
				</a>
			) : null }
		</section>
	);
}

function LicencePlaceholderField( { label, value, icon: Icon, status = false } ) {
	return (
		<div>
			<p className="text-[12px] leading-4 font-semibold uppercase tracking-[1.1px] text-[#7C8494]">
				{ label }
			</p>
			{ status ? (
				<div className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-[#16A34A1A] px-3 py-3 text-sm leading-5 font-semibold text-[#16A34A]">
					<SealCheckIcon className="h-4 w-4" aria-hidden="true" />
					{ value }
				</div>
			) : (
				<div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-[#0D11171A] bg-[#F0F1F5] px-3 py-3">
					{ Icon ? (
						<Icon
							className="h-4 w-4 shrink-0 text-stayilo-muted"
							aria-hidden="true"
						/>
					) : null }
					<span className="min-w-0 flex-1 truncate font-mono text-sm text-stayilo-ink">
						{ value }
					</span>
					<span className="shrink-0 text-xs leading-4 font-medium text-[#7C8494]">
						Copy
					</span>
				</div>
			) }
		</div>
	);
}

/**
 * Placeholder Licence card — same layout as Core LicenceCard,
 * shown behind LockedFeature on Free (Core-locked overlay like Dashboard).
 */
function LicencePlaceholderCard() {
	return (
		<div className="!p-5">
			{ /* Slight blur/fade so the title sits in the locked treatment like Dashboard KPIs */ }
			<h2 className="text-sm font-medium text-[#474C57] pb-3 border-b border-[#0D111714] !px-5">
				Licence
			</h2>
			<div className="mt-5 grid gap-5 sm:grid-cols-2 px-5">
				<LicencePlaceholderField
					label="Licence key"
					value="STAY-CORE-4F9A-BX2K-7PLQ"
					icon={ KeyIcon }
				/>
				<LicencePlaceholderField label="Status" value="Active" status />
				<LicencePlaceholderField
					label="Licensed site"
					value="yourstore.example.com"
					icon={ GlobeIcon }
				/>
				<LicencePlaceholderField
					label="Last heartbeat"
					value="Today 09:14"
					icon={ ClockIcon }
				/>
			</div>
		</div>
	);
}

/**
 * Licence section: Core LockedFeature placeholder on Free;
 * registry widget when Core/Growth has registered `account-licence`.
 */
function LicenceSection( { tier } ) {
	useSyncExternalStore( subscribePremium, getPremiumSnapshot, () => null );

	const Registered = getStayiloRegistry().getDashboardWidget( LICENCE_SLOT_ID );
	const hasCore = hasTierAccess( tier, 'core' );

	if ( Registered ) {
		return <Registered />;
	}

	if ( hasCore ) {
		return <PremiumLoadingState title="Licence" />;
	}

	return (
		<section
			className="overflow-hidden rounded-2xl border border-[#0D111714] bg-white p-0" 
		>
			<LockedFeature tier="core" softShadow={ false }>
				<LicencePlaceholderCard />
			</LockedFeature>
		</section>
	);
}

/**
 * Free-owned Account page.
 * Licence block is a registry slot filled by Core/Growth (`account-licence`).
 */
export default function Account() {
	const tier = useMerchantTier();

	return (
		<>
		<div className=' md:px-10 px-4 py-4 border-b border-[#0D11171A]'>
				<h1 className="!text-[20px] leading-7 tracking-[-0.45px] font-semibold text-stayilo-ink">
					Account
				</h1>
				<p className="mt-0.5 text-sm text-[#474C57] leading-5">
					Access your account management options here.
				</p>
		</div>
		<div className="mx-auto max-w-[860px]  space-y-5 py-6 px-4 lg:px-0">

			<CurrentPlanCard tier={ tier } />

			<LicenceSection tier={ tier } />

			<AccountDetailsCard tier={ tier } />
		</div>
		</>
	);
}
