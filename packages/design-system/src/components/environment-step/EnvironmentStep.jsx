import { __ } from '../../i18n.js';
import { StatusCard, SuccessBadgeIcon } from '../status-card';
import { RequirementCard } from '../requirement-card';

/**
 * @param {object} props
 * @param {Array<{ id: string, title: string, version?: string, requirement?: string, status: string, message?: string, actionLabel?: string, actionHref?: string }>} props.checks
 */
export default function EnvironmentStep( { checks } ) {
	const allPassed = checks.every( ( row ) => row.status === 'valid' );

	return (
		<>
			<div className="flex flex-col gap-3">
				{ checks.map( ( item ) => (
					<RequirementCard
						key={ item.id }
						title={ item.title }
						version={ item.version }
						requirement={ item.requirement }
						status={ item.status }
						message={ item.message }
						actionLabel={ item.actionLabel }
						actionHref={ item.actionHref }
					/>
				) ) }
			</div>

			{ allPassed ? (
				<StatusCard
					title={ __( 'All checks passed — your environment is ready', 'stayilo' ) }
					icon={ <SuccessBadgeIcon /> }
					showProgress={ false }
				/>
			) : null }
		</>
	);
}
