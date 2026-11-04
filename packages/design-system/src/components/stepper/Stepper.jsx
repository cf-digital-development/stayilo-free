import { Fragment } from 'react';
import { ReactComponent as CheckIcon } from '../../assets/svg/Check.svg';
import './stepper.css';

const CIRCLE_VARIANT_CLASSES = {
	completed: 'bg-stayilo-accent text-white',
	active: 'bg-stayilo-ink text-white stayilo-stepper__circle--active',
	inactive: 'bg-[#EDEEF2] text-stayilo-muted',
};

const LABEL_VARIANT_CLASSES = {
	completed: 'text-stayilo-accent font-medium',
	active: 'text-stayilo-ink font-semibold',
	inactive: 'text-stayilo-muted font-medium',
};

function getStepStatus( index, currentStep ) {
	if ( index < currentStep ) {
		return 'completed';
	}
	if ( index === currentStep ) {
		return 'active';
	}
	return 'inactive';
}

/**
 * Horizontal step progress indicator.
 *
 * @param {object} props
 * @param {{ label: string }[]} props.steps - Step labels (1–11+)
 * @param {number} props.currentStep - Active step index (0-based)
 * @param {'absolute'|'remaining'|'index'} [props.numbering='absolute'] - Circle number style ('index' = zero-based)
 * @param {boolean} [props.compact=false] - Smaller layout for many steps
 * @param {'center'|'start'} [props.align='start'] - Below 1200px: free (few steps) stays centered; long wizards start-align
 * @param {string} [props.className]
 */
export default function Stepper( {
	steps = [],
	currentStep = 0,
	numbering = 'absolute',
	compact = false,
	align = 'start',
	className = '',
} ) {
	if ( ! steps.length ) {
		return null;
	}

	const safeCurrent = Math.max( 0, Math.min( currentStep, steps.length - 1 ) );

	function getDisplayNumber( index, status ) {
		if ( status === 'completed' ) {
			return null;
		}
		if ( numbering === 'remaining' ) {
			return index - safeCurrent + 1;
		}
		if ( numbering === 'index' ) {
			return index;
		}
		return index + 1;
	}

	const rootClass = [
		'flex items-center justify-center w-full box-border py-[11.5px] px-5 gap-x-2.5',
		'bg-white border-b border-t border-stayilo-ink-alpha-strong mb-8',
		'max-[1200px]:overflow-x-auto max-[1200px]:gap-5',
		align === 'center'
			? 'max-[1200px]:justify-center'
			: 'max-[1200px]:justify-start',
		'max-[1200px]:[scrollbar-width:none] max-[1200px]:[&::-webkit-scrollbar]:hidden',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	return (
		<nav className={ rootClass } aria-label="Progress">
			{ steps.map( ( step, index ) => {
				const status = getStepStatus( index, safeCurrent );
				const displayNumber = getDisplayNumber( index, status );
				const lineComplete = index <= safeCurrent;

				return (
					<Fragment key={ step.label + index }>
						{ index > 0 && (
							<div
								className={ `flex-1 h-px max-w-[36px] rounded-[1px] ${
									lineComplete ? 'bg-stayilo-accent' : 'bg-stayilo-ink-alpha-strong'
								}` }
								aria-hidden="true"
							/>
						) }

						<div className="flex flex-col items-center flex-none min-w-0">
							<div
								className={ `flex items-center justify-center w-7 h-7 shrink-0 rounded-full font-inter text-xs font-bold leading-[18px] ${ CIRCLE_VARIANT_CLASSES[ status ] }` }
								aria-current={ status === 'active' ? 'step' : undefined }
							>
								{ status === 'completed' ? (
									<CheckIcon
										className="block h-4 w-4 text-white"
										aria-hidden="true"
									/>
								) : (
									<span>{ displayNumber }</span>
								) }
							</div>
							<span
								className={ `mt-1 font-inter text-xs leading-4 text-center max-w-[120px] capitalize break-words ${ LABEL_VARIANT_CLASSES[ status ] }` }
							>
								{ step.label }
							</span>
						</div>
					</Fragment>
				);
			} ) }
		</nav>
	);
}
