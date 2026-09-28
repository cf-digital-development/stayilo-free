import { ReactComponent as CrownIcon } from '../assets/svg/Crown_sidebar.svg';

const PLAN_LABELS = {
	free: 'Free',
	core: 'Core',
	growth: 'Growth',
};

function PlanIcon() {
	return (
		<span
			className="flex p-1.5  shrink-0 items-center justify-center rounded-lg bg-[#FFFFFF0D]"
			aria-hidden="true"
		>
			<CrownIcon width={16 } height={ 16 } className="text-white" />
		</span>
	);
}

function GrowthPlanCard( { planLabel } ) {
	return (
		<div className="rounded-[10px] border border-[#6366F11A] bg-[#FFFFFF0D] p-4">
			<div className="flex items-start gap-2">
				<PlanIcon />
				<div className="min-w-0">
					<p className="text-xs font-medium leading-4 uppercase text-[#FFFFFF59]">
						Plan
					</p>
					<p className="mt-0.5 text-base leading-6 font-semibold text-white">
						{ planLabel }
					</p>
				</div>
			</div>
			<p className="mt-0.5 text-sm leading-5 text-[#F7F8FA66]">All features unlocked</p>
		</div>
	);
}

function UpgradePlanCard( { planLabel, nextPlan, tier, onUpgrade } ) {
	return (
		<div
			className="rounded-[10px]  border border-[#6366F11A] p-4"
			style={ {
				background: 'linear-gradient(180deg, rgba(28, 57, 142, 0.4) 0%, rgba(89, 22, 139, 0.4) 100%)',
			} }
		>
			<p className="text-base font-semibold leading-6 text-[#F7F8FA]">
				{ tier === 'free' ? 'Unlock everything' : `Upgrade to ${ nextPlan }` }
			</p>

			<div className="mt-2 flex items-start gap-2">
				<PlanIcon />
				<div className="min-w-0">
					<p className="text-xs font-medium leading-4 uppercase text-[#FFFFFF59]">
						Current plan
					</p>
					<p className="mt-0.5 text-base leading-6 font-semibold text-white">
						{ planLabel }
					</p>
				</div>
			</div>

			<button
				type="button"
				onClick={ onUpgrade }
				className="mt-2 w-full rounded-xl px-4 py-2.5 text-base leading-6 font-semibold text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
				style={ { background: '#FFFFFF1A' } }
			>
				Upgrade now
			</button>
		</div>
	);
}

export function SidebarPlanCard( { tier = 'free', onUpgrade } ) {
	const planLabel = PLAN_LABELS[ tier ] || 'Free';

	if ( tier === 'growth' ) {
		return <GrowthPlanCard planLabel={ planLabel } />;
	}

	return (
		<UpgradePlanCard
			tier={ tier }
			planLabel={ planLabel }
			nextPlan={ tier === 'core' ? 'Growth' : 'Core' }
			onUpgrade={ onUpgrade }
		/>
	);
}
