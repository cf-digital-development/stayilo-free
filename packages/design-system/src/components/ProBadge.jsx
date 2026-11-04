const BADGE_VARIANTS = {
	core: 'bg-[#2B7FFF33] text-[#2B7FFF]',
	growth: 'bg-[#AD46FF33] text-[#C27AFF]',
  };

export function ProBadge( { children = 'Core' } ) {
	return (
		<span className={`inline-flex items-center gap-1 rounded-[58px] ${BADGE_VARIANTS[children]} px-2.5 py-0.5 text-xs leading-4 font-bold capitalize`}>
			{ children }
		</span>
	);
}
