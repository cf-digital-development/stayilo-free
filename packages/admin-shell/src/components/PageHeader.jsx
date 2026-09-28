/**
 * Reusable admin page header — title, optional subtitle/meta, and action buttons.
 */
export function PageHeader( { title, subtitle, meta, actions } ) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-4 w-full">
			<div className="min-w-0">
				<h1 className="!text-[20px] !p-0 !leading-7 !font-semibold  tracking-[-0.45px] text-[#0D1117]">
					{ title }
				</h1>
				{ subtitle ? (
					<p className="mt-0.5 text-sm leading-5 text-[#474C57]">{ subtitle }</p>
				) : null }
				{ meta ? (
					<p className="mt-0.5 text-xs leading-4 text-[#474C57]">{ meta }</p>
				) : null }
			</div>
			{ actions ? (
				<div className="flex min-w-0 w-full flex-wrap items-center gap-2 sm:w-auto">
					{ actions }
				</div>
			) : null }
		</div>
	);
}
