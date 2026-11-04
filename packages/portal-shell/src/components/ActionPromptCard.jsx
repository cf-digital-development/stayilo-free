import { ReactComponent as TruckIcon } from '@stayilo/design-system/assets/svg/Truck.svg';
import { Button } from './Button.jsx';

function DefaultTruckIcon() {
	return (
		<TruckIcon
			width={ 48 }
			height={ 48 }
			aria-hidden="true"
			className="text-[#E36A2E] [&_path]:stroke-current"
		/>
	);
}

/**
 * Centered prompt card — icon, title, body, and CTA.
 * Pass any icon / copy / button props to reuse across portal flows.
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.icon] - Custom icon node; defaults to orange truck.
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {string} [props.actionLabel='Edit Subscription']
 * @param {() => void} [props.onAction]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.showActionIcon=true]
 * @param {import('react').ReactNode} [props.actionIcon]
 * @param {'primary'|'secondary'|'chip'} [props.actionVariant='secondary']
 * @param {string} [props.className]
 */
export function ActionPromptCard( {
	icon,
	title = 'Get fewer orders',
	description = 'Make a quick change to your subscription without waiting on support.',
	actionLabel = 'Edit Subscription',
	onAction,
	disabled = false,
	showActionIcon = true,
	actionIcon,
	actionVariant = 'secondary',
	className = '',
} ) {
	return (
		<article
			className={ [
				'portal-action-prompt',
				className,
			].filter( Boolean ).join( ' ' ) }
		>
			{ icon !== null ? (
				<div className="portal-action-prompt__icon" aria-hidden={ ! icon ? undefined : true }>
					{ icon ?? <DefaultTruckIcon /> }
				</div>
			) : null }

			{ title ? (
				<h3 className="portal-action-prompt__title">{ title }</h3>
			) : null }

			{ description ? (
				<p className="portal-action-prompt__body">{ description }</p>
			) : null }

			{ actionLabel ? (
				<div className="portal-action-prompt__action-wrap">
					<Button
						label={ actionLabel }
						variant={ actionVariant }
						showIcon={ showActionIcon }
						icon={ actionIcon }
						onClick={ onAction }
						disabled={ disabled }
						className="portal-action-prompt__action action_btn  !text-base !font-semibold !leading-6"
					/>
				</div>
			) : null }
		</article>
	);
}
