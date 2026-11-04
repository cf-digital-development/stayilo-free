
import { Link, useNavigate } from 'react-router-dom';
import { LockedBadge } from '@stayilo/design-system';
import { hasTierAccess } from '../utils/tier.js';
import { LockedFeature } from './LockedFeature.jsx';
import { ReactComponent as FlowIcon } from '../assets/svg/FlowArrow.svg';
import { ReactComponent as ExternalLinkIcon } from '../assets/svg/ArrowSquareOut.svg';
import { ReactComponent as ChartBoardIcon } from '../assets/svg/PresentationChart.svg';
import { ReactComponent as PeopleIcon } from '../assets/svg/Users.svg';
import { ReactComponent as OfferIcon } from '../assets/svg/SealPercent.svg';
import { ReactComponent as NetworkIcon } from '../assets/svg/LineSegments.svg';

const ACTIONS = [
	{
		id: 'edit-flow',
		label: 'Edit cancellation flow',
		Icon: FlowIcon,
		// primary: true,
		minTier: 'core',
		to: '/flows',
	},
	{
		id: 'preview-portal',
		label: 'Preview portal',
		Icon: ExternalLinkIcon,
		minTier: 'free',
		to: 'portal',
	},
	{
		id: 'view-reports',
		label: 'View reports',
		Icon: ChartBoardIcon,
		minTier: 'growth',
		to: '/reports',
	},
	{
		id: 'manage-subscribers',
		label: 'Manage subscribers',
		Icon: PeopleIcon,
		minTier: 'free',
		to: '/subscribers',
	},
	{
		id: 'configure-offers',
		label: 'Configure offers',
		Icon: OfferIcon,
		minTier: 'core',
		to: '/flows',
	},
	{
		id: 'flow-analytics',
		label: 'Flow analytics',
		Icon: NetworkIcon,
		minTier: 'growth',
		to: '/reports',
	},
];

function openPortal( navigate ) {
	const admin = typeof window !== 'undefined' ? window.stayiloAdmin || {} : {};
	if ( admin.portalUrl ) {
		window.open( admin.portalUrl, '_blank', 'noopener,noreferrer' );
		return;
	}
	navigate( '/templates' );
}

function ActionRow( { action, locked = false, showBadge = false, forcePrimary = false } ) {
	const navigate = useNavigate();
	// Free: locked primary still paints black (forcePrimary). Core/Growth unchanged.
	const isPrimary = ( Boolean( action.primary ) || forcePrimary ) && ( ! locked || forcePrimary );
	const className = [
		'relative flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium no-underline shadow-none transition-colors',
		isPrimary
			? 'bg-[#0D1117] !text-white'
			: 'bg-[#F0F1F5]',
		locked
			? isPrimary
				? 'cursor-default shadow-[0_4px_14px_rgba(13,17,23,0.22)]'
				: 'cursor-default text-[#0D1117]/20'
			: isPrimary
				? 'hover:opacity-90'
				: 'text-[#0D1117] hover:bg-[#0D1117] hover:!text-white',
	].join( ' ' );

	const content = (
		<>
			<span className="inline-flex items-center justify-center gap-2">
				<action.Icon
					width={ 20 }
					height={ 20 }
					className="shrink-0 [&_path]:stroke-current"
					aria-hidden="true"
				/>
				<span>{ action.label }</span>
			</span>
			{ showBadge ? (
				<span className="absolute right-3 top-1/2 -translate-y-1/2">
					<LockedBadge size="sm">{ action.minTier }</LockedBadge>
				</span>
			) : null }
		</>
	);

	if ( locked ) {
		return (
			<div className={ className } aria-disabled="true">
				{ content }
			</div>
		);
	}

	if ( action.to === 'portal' ) {
		return (
			<button type="button" onClick={ () => openPortal( navigate ) } className={ className }>
				{ content }
			</button>
		);
	}

	return (
		<Link to={ action.to } className={ className }>
			{ content }
		</Link>
	);
}

/**
 * Quick actions card — Free wraps heading + rows in Core overlay; Core/Growth use per-row badges.
 */
export function QuickActions( { tier = 'free' } ) {
	const isFree = tier === 'free';
	const primary = ACTIONS[ 0 ];
	const secondary = ACTIONS.slice( 1 );

	const header = (
		<div className="border-b border-[#0D111714] px-[22.5px] py-[15px]">
			<h2 className="text-sm font-semibold uppercase leading-5 text-[#474C57]">
				Quick actions
			</h2>
		</div>
	);

	if ( isFree ) {
		return (
			<div className="overflow-hidden rounded-2xl border border-[#0D111714] bg-white">
				<LockedFeature tier="core" softShadow={ false } className="rounded-2xl">
					{ header }
					<div className="space-y-2 p-[15px]">
						<ActionRow action={ primary } locked forcePrimary />
						{ secondary.map( ( action ) => (
							<ActionRow key={ action.id } action={ action } locked />
						) ) }
					</div>
				</LockedFeature>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-[#0D111714] bg-white">
			{ header }
			<div className="space-y-2 p-[15px]">
				{ ACTIONS.map( ( action ) => {
					const locked = ! hasTierAccess( tier, action.minTier );
					return (
						<ActionRow
							key={ action.id }
							action={ action }
							locked={ locked }
							showBadge={ locked }
						/>
					);
				} ) }
			</div>
		</div>
	);
}