/**
 * Green action-page band + overlapping content used by account/subscription flows.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} [props.subtitleClassName]
 * @param {string} [props.bandClassName]
 * @param {string} [props.contentClassName]
 * @param {import('react').ReactNode} props.children
 */
export function ActionPageHero( {
	title,
	subtitle,
	subtitleClassName = 'mx-auto mt-2 max-w-[1080px] text-base font-normal leading-[26px] text-[#000000]/80',
	bandClassName = 'action_bg_band lg:min-h-[340px] pt-12 pb-12 lg:pt-[83px] lg:pb-5 px-5',
	contentClassName = 'portal-content relative z-[1] mx-auto mt-10 lg:mt-[-124px]',
	children,
} ) {
	return (
		<div className="portal-subscription-actions">
			<section
				className="portal-subscription-actions__band"
				aria-label={ title }
			>
				<div className={ bandClassName }>
					<div className="portal-content mx-auto text-center">
						<h1 className="m-0 text-xl font-bold leading-8 sm:text-[40px] sm:leading-[100%]">
							{ title }
						</h1>
						{ subtitle ? (
							<p className={ subtitleClassName }>{ subtitle }</p>
						) : null }
					</div>
				</div>
				<div className={ contentClassName }>{ children }</div>
			</section>
		</div>
	);
}
