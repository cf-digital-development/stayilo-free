import AdminWpNotices from '../admin-wp-notices/AdminWpNotices';

/**
 * Resolve step label to match Stepper numbering.
 * - index: STEP 0, STEP 1, ... (same as Stepper numbering="index")
 * - absolute: STEP 1, STEP 2, ... (same as Stepper numbering="absolute")
 *
 * @param {number} stepIndex
 * @param {'index'|'absolute'|'remaining'} numbering
 * @returns {string}
 */
function formatStepText( stepIndex, numbering = 'index' ) {
	const number = numbering === 'absolute' ? stepIndex + 1 : stepIndex;
	return `STEP ${ number }`;
}

/**
 * Step header block — step label, title, description, optional icon.
 * Pass `stepIndex` (+ optional `numbering`) to auto-build "STEP N" from the stepper.
 *
 * @param {object} props
 * @param {number} [props.stepIndex]    - Current step index (0-based); builds stepText automatically
 * @param {'index'|'absolute'|'remaining'} [props.numbering='index'] - Must match Stepper numbering
 * @param {string} [props.stepText]     - Optional override (skips auto text when set)
 * @param {import('react').ReactNode} [props.badge] - Optional badge beside the step label
 * @param {string} [props.title]        - Main heading
 * @param {string} [props.description]  - Supporting text below
 * @param {string} [props.descriptionClassName='mt-3'] - Extra classes on the description (e.g. `mt-1`)
 * @param {import('react').ReactNode} [props.icon] - Icon inside gray box (optional)
 * @param {boolean} [props.showIcon]    - Force hide icon even if passed
 * @param {string} [props.className]
 */
export default function StepHeader( {
	stepIndex,
	numbering = 'index',
	stepText,
	badge,
	title,
	description,
	descriptionClassName = 'mt-3',
	icon,
	showIcon = true,
	className = '',
} ) {
	const resolvedStepText =
		stepText ??
		( typeof stepIndex === 'number' ? formatStepText( stepIndex, numbering ) : undefined );

	const hasIcon = showIcon && icon !== undefined && icon !== null && icon !== false;

	const isWpAdmin =
		typeof window !== 'undefined' && Boolean( window.stayiloAdmin );

	return (
		<header className={ className }>
			<div className="flex items-start gap-3 max-[600px]:flex-col max-[600px]:gap-4">
				{ hasIcon ? (
					<div
						className="stayilo-icon-well [&_img]:block [&_img]:w-6 [&_img]:h-6 [&_svg]:block [&_svg]:w-6 [&_svg]:h-6"
						aria-hidden="true"
					>
						{ icon }
					</div>
				) : null }

				<div className="flex-1 min-w-0">
					{ resolvedStepText || badge ? (
						<div className="flex items-center flex-wrap gap-2 ">
							{ resolvedStepText ? (
								<p className="stayilo-type-label-caps">{ resolvedStepText }</p>
							) : null }
							{ badge ? (
								<span className="stayilo-pill-pro !text-[#6366F1] !bg-[#6366F126]">{ badge }</span>
							) : null }
						</div>
					) : null }
					{ title ? (
						<div
							className="stayilo-type-title-lg"
							role="heading"
							aria-level={ 2 }
						>
							{ title }
						</div>
					) : null }
				</div>
			</div>

			{ ! isWpAdmin ? <AdminWpNotices /> : null }

			{ description ? (
				<p className={ `stayilo-type-body-muted ${ descriptionClassName }` }>{ description }</p>
			) : null }
		</header>
	);
}
