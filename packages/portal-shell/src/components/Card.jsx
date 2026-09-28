import {
	DEFAULT_MEAL_IMAGE,
	resolveMediaUrl,
} from '../utils/mediaPlaceholders.js';
import { CardBoxStatus } from './CardBoxStatus.jsx';
import { CardStatItem } from './CardStatItem.jsx';
import { ContentHeader } from './ContentHeader.jsx';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Portal content card with image, metadata, and box status.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {string} [props.imageUrl]
 * @param {string} [props.imageAlt='']
 * @param {Array<{ icon?: 'timer'|'flame'|'protein'|import('react').ComponentType, label: string }>} [props.stats]
 * @param {string} [props.boxStatus]
 * @param {() => void} [props.onClick]
 * @param {string} [props.titleClassName] - Forwarded to ContentHeader title.
 * @param {string} [props.className]
 */
export function Card( {
	title,
	description,
	imageUrl,
	imageAlt = '',
	stats = [],
	boxStatus,
	onClick,
	titleClassName = '',
	className = '',
} ) {
	const isClickable = typeof onClick === 'function';
	const displayImageUrl = resolveMediaUrl( imageUrl, DEFAULT_MEAL_IMAGE );
	const isPlaceholder = displayImageUrl === DEFAULT_MEAL_IMAGE;
	const displayStats = Array.isArray( stats ) ? stats : [];

	const classes = [
		'portal-card',
		isClickable ? 'cursor-pointer transition-shadow hover:shadow-stayilo-sm' : '',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	return (
		<article
			className={ classes }
			onClick={ onClick }
			onKeyDown={
				isClickable
					? ( event ) => {
						if ( event.key === 'Enter' || event.key === ' ' ) {
							event.preventDefault();
							onClick?.();
						}
					}
					: undefined
			}
			role={ isClickable ? 'button' : undefined }
			tabIndex={ isClickable ? 0 : undefined }
		>
			<div
				className={ [
					'portal-card-media',
					'order',
					! isPlaceholder ? 'portal-card-media--cover' : '',
				].filter( Boolean ).join( ' ' ) }
			>
				<img
					src={ displayImageUrl }
					alt={ imageAlt || title }
				/>
			</div>

			<div className="flex flex-1 flex-col p-5">
				<ContentHeader
					variant="card"
					title={ title }
					subtitle={ description }
					titleClassName={ titleClassName }
				/>

				{ displayStats.length > 0 ? (
					<div className=" mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
						{ displayStats.map( ( stat, index ) => (
							<CardStatItem
								key={ `${ stat.label }-${ index }` }
								icon={ stat.icon }
								label={ stat.label }
							/>
						) ) }
					</div>
				) : null }

				<CardBoxStatus status={ boxStatus } className="mt-auto pt-9" />
			</div>
		</article>
	);
}
