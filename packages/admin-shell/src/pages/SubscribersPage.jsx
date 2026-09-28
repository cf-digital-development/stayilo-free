import { useState } from 'react';
import { StatusBadge } from '@stayilo/design-system';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader.jsx';
import { ExportButton } from '../components/toolbar/ExportButton.jsx';
import { FilterDropdown } from '../components/toolbar/FilterDropdown.jsx';
import { FilterTabs } from '../components/toolbar/FilterTabs.jsx';
import { SearchField } from '../components/toolbar/SearchField.jsx';
import { UpgradeBanner } from '../components/UpgradeBanner.jsx';
import { hasTierAccess } from '../utils/tier.js';
import { buildCsv, downloadCsv } from '../utils/downloadCsv.js';
import { useMerchantTier } from '../premium.js';
import { useSubscribers } from '../hooks/useAdminData.js';
import { ReactComponent as PaginationArrowIcon } from '../assets/svg/pagination-arrow.svg';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/ArrowRight.svg';

const STATUS_OPTIONS = [
	{ id: 'all', label: 'Status: All', menuLabel: 'All' },
	{ id: 'active', label: 'Status: Active', menuLabel: 'Active' },
	{ id: 'on-hold', label: 'Status: On hold', menuLabel: 'On hold' },
	{
		id: 'pending-cancel',
		label: 'Status: Pending cancellation',
		menuLabel: 'Pending cancellation',
	},
	{ id: 'cancelled', label: 'Status: Cancelled', menuLabel: 'Cancelled' },
	{ id: 'expired', label: 'Status: Expired', menuLabel: 'Expired' },
	{ id: 'payment-failed', label: 'Status: Payment failed', menuLabel: 'Payment failed' },
];

const STATUS_TABS = [
	{ id: 'all', label: 'All', countKey: 'all' },
	{ id: 'active', label: 'Active', countKey: 'active' },
	{ id: 'on-hold', label: 'On hold', countKey: 'on-hold' },
	{ id: 'pending-cancel', label: 'Pending cancellation', countKey: 'pending-cancel' },
	{ id: 'cancelled', label: 'Cancelled', countKey: 'cancelled' },
	{ id: 'expired', label: 'Expired', countKey: 'expired' },
	{ id: 'payment-failed', label: 'Payment failed', countKey: 'payment-failed' },
];

function PaginationButton( { current, disabled, onClick, ariaLabel, children } ) {
	return (
		<button
			type="button"
			aria-label={ ariaLabel }
			aria-current={ current ? 'page' : undefined }
			disabled={ disabled }
			onClick={ onClick }
			className={ [
				'inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg px-[7px] text-sm font-medium !shadow-none leading-5',
				current
					? '!border-0 !bg-stayilo-ink !text-white'
					: '!border !border-solid !border-[#0D111714] !bg-white text-[#7C8494] disabled:opacity-40',
			].join( ' ' ) }
		>
			{ children }
		</button>
	);
}

/**
 * @param {{ tier?: 'free'|'core'|'growth' }} props
 */
export function SubscribersPage( { tier: tierProp } ) {
	const merchantTier = useMerchantTier();
	const tier = tierProp ?? merchantTier;
	const isFree = tier === 'free';
	const hasCore = hasTierAccess( tier, 'core' );
	const [ bannerDismissed, setBannerDismissed ] = useState( false );
	const [ search, setSearch ] = useState( '' );
	const [ status, setStatus ] = useState( 'all' );
	const [ page, setPage ] = useState( 1 );

	const { items, filteredItems, total, perPage, totalPages, loading, counts } = useSubscribers( {
		page,
		perPage: 10,
		search,
		status,
	} );

	const rangeStart = total ? ( page - 1 ) * perPage + 1 : 0;
	const rangeEnd = Math.min( page * perPage, total );
	const columnCount = hasCore ? 7 : 6;
	const statusCounts = counts || { all: total };

	const setStatusFilter = ( next ) => {
		setStatus( next );
		setPage( 1 );
	};

	const exportSubscribersCsv = () => {
		const rows = filteredItems?.length ? filteredItems : items;
		const headers = hasCore
			? [
					'Name',
					'Email',
					'Product',
					'Status',
					'Next renewal',
					'MRR',
					'Last activity',
			  ]
			: [ 'Name', 'Email', 'Product', 'Status', 'Next renewal', 'MRR' ];

		const csv = buildCsv( headers, rows, ( sub ) => {
			const base = [
				sub.name,
				sub.email,
				sub.product,
				sub.status,
				sub.nextRenewal,
				sub.mrr || sub.price,
			];
			return hasCore ? [ ...base, sub.lastActivity || '—' ] : base;
		} );

		const stamp = new Date().toISOString().slice( 0, 10 );
		downloadCsv( csv, `stayilo-subscribers-${ stamp }.csv` );
	};

	return (
		<>
		<div className="w-full min-w-0 border-b border-[#0D11171A] md:px-10 px-4 py-4 bg-[#F7F8FAE5]">
			<PageHeader
				title="Subscribers"
				subtitle={ `${ total } total · ${ items.length } shown` }
				actions={
					<div className="flex min-w-0 w-full max-w-full flex-wrap items-center gap-2">
						<SearchField
							value={ search }
							onChange={ ( next ) => {
								setSearch( next );
								setPage( 1 );
							} }
							placeholder="Search name or email"
							className="min-w-0 w-full sm:w-[240px] sm:max-w-full"
						/>
						<FilterDropdown
							variant="outline"
							options={ STATUS_OPTIONS }
							value={ status }
							onChange={ setStatusFilter }
							ariaLabel="Filter by status"
						/>
						<ExportButton
							disabled={ loading || ( filteredItems?.length ?? items.length ) === 0 }
							onClick={ exportSubscribersCsv }
						/>
					</div>
				}
			/>
		</div>

		<div className=" md:px-10 px-4 py-6 space-y-6">
			{ isFree && ! bannerDismissed ? (
				<UpgradeBanner
					title="You're seeing the native WooCommerce subscriber list"
					description="Upgrade to unlock Stayilo's subscriber management UI — with rich profiles, event timelines, manual overrides, and filtering."
					actionLabel="Upgrade now"
					actionClassName="bg-[#9810FA]" 
					onDismiss={ () => setBannerDismissed( true ) }
				/>
			) : null }

			<div className="space-y-6">
				{ hasCore ? (
					<FilterTabs
						variant="outline"
						value={ status }
						onChange={ setStatusFilter }
						options={ STATUS_TABS.map( ( tab ) => ( {
							id: tab.id,
							label: tab.label,
							count: statusCounts[ tab.countKey ] ?? 0,
						} ) ) }
					/>
				) : (
					<span className="inline-flex h-8 items-center gap-2 rounded-full bg-stayilo-ink px-4 text-sm font-medium text-white">
						All
						<span className="font-medium text-[#FFFFFF99] font-mono text-xs leading-4">{ statusCounts.all ?? total }</span>
					</span>
				) }

				<div className="overflow-hidden rounded-2xl border border-[#0D11171A] bg-white">
					<div className="overflow-x-auto">
						<table className="w-full min-w-[720px] text-left text-sm">
							<thead>
								<tr className="border-b border-[#0D11171A] text-[13px] font-semibold text-[#717680]">
									<th className="max-w-[180px] px-4 py-3.5 font-semibold">Subscriber Name</th>
									<th className="max-w-[220px] px-4 py-3.5 font-semibold">Product</th>
									<th className="px-4 py-3.5 font-semibold">Status</th>
									<th className="px-4 py-3.5 font-semibold">Next renewal</th>
									<th className="px-4 py-3.5 font-semibold">MRR</th>
									{ hasCore ? (
										<th className="px-4 py-3.5 font-semibold">Last activity</th>
									) : null }
									<th className="px-4 py-3.5 font-semibold">Action</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[#ECECEC]">
								{ loading ? (
									<tr>
										<td colSpan={ columnCount } className="px-4 py-3.5 text-center text-[#717680]">
											Loading subscribers…
										</td>
									</tr>
								) : items.length === 0 ? (
									<tr>
										<td colSpan={ columnCount } className="px-4 py-3.5 text-center text-[#717680]">
											No subscribers found.
										</td>
									</tr>
								) : (
									items.map( ( sub ) => (
										<tr key={ sub.id }>
											<td className="max-w-[180px] px-4 py-4">
												<div className="min-w-0">
													<p className="break-words font-semibold capitalize text-base leading-6 text-stayilo-ink">
														{ sub.name }
													</p>
													<p className="mt-0.5 break-words text-sm leading-5 text-[#474C57]">
														{ sub.email }
													</p>
												</div>
											</td>
											<td className="max-w-[220px] whitespace-normal break-words px-4 py-4 text-sm font-medium leading-5 text-stayilo-ink">
												{ sub.product }
											</td>
											<td className="px-4 py-4">
												<StatusBadge
													status={ sub.raw?.status || sub.status }
													className=" !py-1.5 !px-5"
												>
													{ sub.status }
												</StatusBadge>
											</td>
											<td className="px-4 py-4 text-stayilo-ink text-sm leading-5 font-medium">{ sub.nextRenewal }</td>
											<td className="px-4 py-4 text-stayilo-ink text-sm leading-5 font-medium">{ sub.mrr || sub.price }</td>
											{ hasCore ? (
												<td className="px-4 py-4 text-stayilo-ink text-sm leading-5 font-medium">
													{ sub.lastActivity || '—' }
												</td>
											) : null }
											<td className="px-5 py-4">
												{ hasCore ? (
													<Link	className="text-sm leading-5 font-medium inline-flex items-center gap-1 font-medium !text-[#7C8494] hover:!text-stayilo-ink"
														to={ `/subscribers/${ sub.id }` }
													>
														View
														<ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
													</Link>
												) : (
													<a
														href={ sub.editUrl || '#' }
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center gap-1 font-medium !text-[#155DFC] text-sm leading-5"
													>
														WooCommerce
														<ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
													</a>
												) }
											</td>
										</tr>
									) )
								) }
							</tbody>
						</table>
					</div>
				</div>

				<div className="flex items-center justify-between pt-1 text-sm text-stayilo-muted !mt-[17px]">
					<span>Showing { rangeStart }–{ rangeEnd } of { total }</span>
					<div className="flex items-center gap-1.5">
						<PaginationButton
							ariaLabel="Previous page"
							disabled={ page <= 1 }
							onClick={ () => setPage( ( prev ) => Math.max( 1, prev - 1 ) ) }
						>
							<PaginationArrowIcon width={ 16 } height={ 16 } aria-hidden="true" />
						</PaginationButton>
						{ Array.from( { length: totalPages }, ( _, index ) => index + 1 ).map( ( pageNum ) => (
							<PaginationButton
								key={ pageNum }
								current={ pageNum === page }
								onClick={ () => setPage( pageNum ) }
							>
								{ pageNum }
							</PaginationButton>
						) ) }
						<PaginationButton
							ariaLabel="Next page"
							disabled={ page >= totalPages }
							onClick={ () => setPage( ( prev ) => Math.min( totalPages, prev + 1 ) ) }
						>
							<PaginationArrowIcon
								width={ 16 }
								height={ 16 }
								className="rotate-180"
								aria-hidden="true"
							/>
						</PaginationButton>
					</div>
				</div>
			</div>
		</div>
		</>
	);
}

export default SubscribersPage;
