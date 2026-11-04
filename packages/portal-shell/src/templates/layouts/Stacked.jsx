/**
 * Classic home composition — same outer wrapper as the designed pages.
 * Region props render in order with no extra wrappers.
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.hero]
 * @param {import('react').ReactNode} [props.list]
 * @param {import('react').ReactNode} [props.detail]
 * @param {import('react').ReactNode} [props.children]
 */
export function Stacked( { hero, list, detail, children } ) {
	return (
		<div className="w-full">
			{ hero }
			{ list }
			{ detail }
			{ children }
		</div>
	);
}
