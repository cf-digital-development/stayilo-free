/**
 * Flexible card header — left brand/content and optional right menu.
 *
 * Pass any React node for `left` / `right`, or use the convenience props
 * (`logoName`, `brandName`, `links`) for the common logo + nav pattern.
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.left] - Full left-side content (overrides logo/logoName/brandName)
 * @param {import('react').ReactNode} [props.right] - Full right-side content (overrides links)
 * @param {import('react').ReactNode} [props.logo] - Optional custom logo content; overrides logoName
 * @param {string} [props.logoName] - Text shown inside the logo badge
 * @param {string} [props.brandName] - Brand text next to logo
 * @param {Array<{ label: string, href?: string, onClick?: () => void }>} [props.links] - Nav items when `right` is omitted
 * @param {boolean} [props.showRight=true] - Hide the entire right side when false
 * @param {string} [props.className]
 */
export default function CardHeader( {
	left,
	right,
	logo,
	logoName,
	brandName,
	links,
	showRight = true,
	className = '',
} ) {
	const resolvedLogo = logo ?? logoName;

	const logoClasses =
		'stayilo-card-header__logo inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[11.25px] bg-white/20 font-inter text-[10px] font-black uppercase leading-[15px] text-white';
	const linkClasses =
		'appearance-none m-0 border-0 bg-transparent p-0 font-inter text-sm font-normal capitalize leading-5 text-inherit no-underline cursor-pointer whitespace-nowrap hover:opacity-85 focus-visible:opacity-85 focus-visible:outline-none max-[600px]:text-xs';

	const leftContent =
		left ??
		( resolvedLogo || brandName ? (
			<>
				{ resolvedLogo ? (
					<span className={ logoClasses } aria-hidden={ ! brandName }>
						{ resolvedLogo }
					</span>
				) : null }
				{ brandName ? (
					<span className="stayilo-card-header__brand-name overflow-hidden whitespace-nowrap text-ellipsis font-inter text-base font-bold leading-6 max-[600px]:text-sm">
						{ brandName }
					</span>
				) : null }
			</>
		) : null );

	const rightContent =
		right ??
		( Array.isArray( links ) && links.length > 0 ? (
			<nav
				className="flex items-center gap-4 max-[600px]:gap-2 !text-[#FFFFFFCC]"
				aria-label="Site"
			>
				{ links.map( ( item ) => {
					const key = item.label;
					if ( item.href ) {
						return (
							<a
								key={ key }
								className={ linkClasses }
								href={ item.href }
								onClick={ item.onClick }
							>
								{ item.label }
							</a>
						);
					}
					return (
						<button
							key={ key }
							type="button"
							className={ linkClasses }
							onClick={ item.onClick }
						>
							{ item.label }
						</button>
					);
				} ) }
			</nav>
		) : null );

	const hasRight = showRight && rightContent != null && rightContent !== false;

	const classes = [
		'stayilo-card-header flex w-full items-center gap-4 box-border py-[15px] px-[22.5px]',
		'bg-stayilo-accent text-white max-[600px]:py-3 max-[600px]:px-4',
		hasRight ? 'justify-between' : 'justify-start',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	return (
		<header className={ classes }>
			<div className="flex min-w-0 items-center gap-[11.25px]">{ leftContent }</div>

			{ hasRight ? (
				<div className="flex shrink-0 items-center">{ rightContent }</div>
			) : null }
		</header>
	);
}
