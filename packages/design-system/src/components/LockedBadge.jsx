import { ReactComponent as LockIcon } from '../assets/svg/Lock.svg';

const BADGE_VARIANTS = {
	core: 'text-[#2B7FFF] border-[#2B7FFF66] bg-[#CEE0FB]',
	growth: 'text-[#8200DB] border-[#8200DB66] bg-[#F3E8FF]',
};

const BADGE_SIZES = {
	md: ' py-1 text-sm leading-5',
	sm: 'py-0.5 text-[12px] font leading-4',
};

export function LockedBadge( { children = 'core', size = 'md' } ) {

	return (
		<span
			className={ `inline-flex items-center rounded-full border capitalize gap-1 px-3 font-bold ${
				BADGE_VARIANTS[ children ] || BADGE_VARIANTS.core
			} ${ BADGE_SIZES[ size ] || BADGE_SIZES.md }` }
		>
			<LockIcon width={ 14 } height={ 14 } viewBox="0 0 14 14" aria-hidden="true" />
			<span className="font-bold capitalize">
				{ children }
			</span>
		</span>
	);
}
