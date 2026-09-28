import logoUrl from '../../assets/svg/Logo.svg';

/**
 * Top bar shown above the wizard on every step.
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.logo] - Logo node; pass your own to replace the default
 * @param {string} [props.subtitle='Setup wizard'] - Right side label
 * @param {number} [props.currentStep] - Current step index (0-based)
 * @param {number} [props.totalSteps] - Total number of steps
 * @param {boolean} [props.logoOnly=false] - Center the logo and hide step/subtitle
 * @param {string} [props.className]
 */
export default function WizardHeader( {
	logo,
	subtitle = 'Setup wizard',
	currentStep,
	totalSteps,
	logoOnly = false,
	className = '',
} ) {
	const classes = [
		'flex items-center w-full box-border bg-white px-10 py-4 max-[600px]:px-5 max-[350px]:block',
		logoOnly ? 'justify-center' : 'justify-between gap-2',
		className,
	].filter( Boolean ).join( ' ' );

	const hasStepInfo = ! logoOnly && currentStep !== undefined && totalSteps !== undefined;

	return (
		<header className={ classes }>
			<div className="flex items-center min-w-0">
				{ logo ?? (
					<span className="inline-flex items-center gap-[10px]">
						<img src={ logoUrl } alt="Stayilo" />
					</span>
				) }
			</div>

			{ logoOnly ? null : (
				<div className="font-inter font-medium text-sm leading-5 tracking-normal text-[#545C6C] whitespace-nowrap max-[350px]:mt-5">
					{ subtitle }
					{ hasStepInfo ? (
						<>
							{ '\u00A0\u00B7\u00A0' }
							Step { currentStep } of { totalSteps }
						</>
					) : null }
				</div>
			) }
		</header>
	);
}
