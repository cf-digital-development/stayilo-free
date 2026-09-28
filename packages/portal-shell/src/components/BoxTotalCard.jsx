import { useId, useState } from 'react';
import { ReactComponent as ReceiptIcon } from '@stayilo/design-system/assets/svg/receipt.svg';
import { NavArrowIcon } from './NavArrowIcon.jsx';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Collapsible box total bar — expands to show order summary.
 *
 * @param {object} props
 * @param {string} [props.label='Subscription total']
 * @param {string} [props.originalTotal]
 * @param {string} props.total
 * @param {string} [props.summaryTitle='Order summary']
 * @param {Array<{
 *   id: string,
 *   label: string,
 *   value: string,
 *   tone?: 'default'|'discount'|'total',
 * }>} [props.lines]
 * @param {boolean} [props.defaultOpen=false]
 * @param {string} [props.className]
 */
export function BoxTotalCard( {
	label = 'Subscription total',
	originalTotal,
	total,
	summaryTitle = 'Order summary',
	lines = [],
	defaultOpen = false,
	className = '',
} ) {
	const [ open, setOpen ] = useState( defaultOpen );
	const panelId = useId();

	return (
		<section
			className={ [
				'portal-box-total',
				open ? 'portal-box-total--open' : '',
				className,
			].filter( Boolean ).join( ' ' ) }
		>
			<div className="portal-box-total__header">
				<div className="portal-box-total__lead">
					<span className="portal-box-total__icon" aria-hidden="true">
						<ReceiptIcon width={48 } height={48 } />
					</span>
					<span className="portal-box-total__label">{ label }</span>
					<span className="portal-box-total__prices">
						{ originalTotal ? (
							<span className="portal-box-total__original">{ originalTotal }</span>
						) : null }
						<span className="portal-box-total__amount">{ total }</span>
					</span>
				</div>

				<button
					type="button"
					className="portal-box-total__toggle"
					aria-expanded={ open }
					aria-controls={ panelId }
					aria-label={ open ? __( 'Hide order summary', 'stayilo' ) : __( 'Show order summary', 'stayilo' ) }
					onClick={ () => setOpen( ( prev ) => ! prev ) }
				>
					<NavArrowIcon
						width={ 24}
						height={ 24 }
						className="portal-box-total__chevron text-[#101010]"
					/>
				</button>
			</div>

			<div
				id={ panelId }
				className="portal-box-total__collapse"
				aria-hidden={ ! open }
			>
				<div className="portal-box-total__panel">
					<h3 className="portal-box-total__summary-title">{ summaryTitle }</h3>
					<ul className="portal-box-total__lines" role="list">
						{ lines.map( ( line ) => (
							<li
								key={ line.id }
								className={ [
									'portal-box-total__line',
									line.tone === 'discount'
										? 'portal-box-total__line--discount'
										: '',
									line.tone === 'total'
										? 'portal-box-total__line--total'
										: '',
								].filter( Boolean ).join( ' ' ) }
							>
								<span>{ line.label }</span>
								<span className="portal-box-total__line-value">
									{ line.value }
								</span>
							</li>
						) ) }
					</ul>
				</div>
			</div>
		</section>
	);
}
