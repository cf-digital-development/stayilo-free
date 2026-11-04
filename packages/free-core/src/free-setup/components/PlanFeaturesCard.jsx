import { ReactComponent as CheckIcon } from '@stayilo/design-system/assets/svg/Check.svg';
import { ReactComponent as CrownIcon } from '@stayilo/design-system/assets/svg/free-crown.svg';
import { ReactComponent as ArrowRightIcon } from '@stayilo/design-system/assets/svg/ArrowRight.svg';
import {
	CORE_FEATURES,
	GROWTH_FEATURES,
} from '@stayilo/design-system/feature-list';

/**
 * Crown header + two-column plan feature list (Free wizard live step card).
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string[]} [props.coreItems]
 * @param {string[]} [props.growthItems]
 * @param {string} [props.actionLabel]
 * @param {() => void} [props.onAction]
 * @param {string} [props.className]
 */
export default function PlanFeaturesCard( {
	title,
	coreItems = CORE_FEATURES,
	growthItems = GROWTH_FEATURES,
	actionLabel,
	onAction,
	className = '',
} ) {
	const showAction = Boolean( actionLabel && onAction );

	return (
		<div
			className={ [
				'w-full rounded-2xl border border-[#BFDBFE] p-5',
				className,
			]
				.filter( Boolean )
				.join( ' ' ) }
			style={ {
				background: 'linear-gradient(135deg, #EFF6FF 0%, #FAF5FF 100%)',
			} }
		>
			<div className="mb-4 flex items-center justify-center gap-[10px] text-[#193CB8]">
				<CrownIcon
					aria-hidden="true"
					className="block shrink-0 [&_path]:stroke-current"
				/>
				<p className="text-sm font-semibold leading-5 m-0 text-[#193CB8]">
					{ title }
				</p>
			</div>

			<div className="grid grid-cols-2 gap-x-6 gap-y-2 max-[600px]:grid-cols-1">
				<ul className="stayilo-stack-12 m-0 list-none p-0">
					{ coreItems.map( ( feature ) => (
						<li
							key={ feature }
							className="stayilo-type-body flex items-start gap-2"
						>
							<CheckIcon
								className="mt-0.5 block h-4 w-4 shrink-0 text-[#6366F1]"
								aria-hidden="true"
							/>
							<span>{ feature }</span>
						</li>
					) ) }
				</ul>
				<ul className="stayilo-stack-12 m-0 list-none p-0">
					{ growthItems.map( ( feature ) => (
						<li
							key={ feature }
							className="stayilo-type-body flex items-start gap-2"
						>
							<CheckIcon
								className="mt-0.5 block h-4 w-4 shrink-0 text-[#6366F1]"
								aria-hidden="true"
							/>
							<span>{ feature }</span>
						</li>
					) ) }
				</ul>
			</div>

			{ showAction ? (
				<button
					type="button"
					className="mt-4 mx-auto inline-flex w-fit items-center justify-center gap-2 rounded-xl border-0 bg-[#155DFC] px-6 py-3 font-inter text-base font-bold leading-6 text-white cursor-pointer transition-opacity hover:opacity-90"
					onClick={ onAction }
				>
					<span>{ actionLabel }</span>
					<ArrowRightIcon aria-hidden="true" />
				</button>
			) : null }
		</div>
	);
}
