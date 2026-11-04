import { Button } from '../buttons';

/**
 * Wizard step card — white rounded container with body content
 * and a built-in Back / Continue footer.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children - Card body
 * @param {() => void} [props.onBack] - Back button handler (hidden when omitted or showBack=false)
 * @param {() => void} [props.onContinue] - Continue button handler
 * @param {boolean} [props.continueActive=true] - Whether Continue is enabled
 * @param {string} [props.continueLabel='Continue'] - Continue button text
 * @param {boolean} [props.showBack=true] - Show Back when onBack is provided
 * @param {boolean} [props.showFooter=true] - Render footer at all
 * @param {import('react').ReactNode} [props.footer] - Optional custom footer override
 * @param {string} [props.className]
 */
export default function StepCard( {
	children,
	onBack,
	onContinue,
	continueActive = true,
	continueLabel = 'Continue',
	showBack = true,
	showFooter = true,
	footer,
	className = '',
} ) {
	const classes = [ 'stayilo-card--step max-[600px]:p-5', className ].filter( Boolean ).join( ' ' );

	const defaultFooter = (
		<>
			{ showBack && typeof onBack === 'function' ? (
				<Button
					text="Back"
					direction="back"
					variant="text"
					onClick={ onBack }
					className="stayilo-btn--back mr-auto"
				/>
			) : null }
			{ typeof onContinue === 'function' ? (
				<Button
					text={ continueLabel }
					direction="next"
					active={ continueActive }
					onClick={ onContinue }
				/>
			) : null }
		</>
	);

	const footerContent = showFooter ? ( footer ?? defaultFooter ) : null;

	return (
		<section className={ classes }>
			<div className="stayilo-stack-24">{ children }</div>
			{ footerContent ? (
				<div className="flex justify-end items-center gap-3 mt-6">{ footerContent }</div>
			) : null }
		</section>
	);
}
