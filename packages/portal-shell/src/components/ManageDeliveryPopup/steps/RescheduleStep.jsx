import { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import { ReactComponent as NavArrowRightIcon } from '@stayilo/design-system/assets/svg/nav-arrow-right.svg';
import { Button } from '../../Button.jsx';
import { DateBadge } from '../../DateBadge.jsx';
import { NavArrowIcon } from '../../NavArrowIcon.jsx';
import { findDateIndex } from '../../../utils/delivery/index.js';
import {
	VISIBLE_DATES,
	getVisibleDateCount,
	rescheduleSchema,
} from '../rescheduleSchema.js';
import { __ } from '@stayilo/design-system/i18n';

export function RescheduleStep( {
	dates,
	initialDateId,
	minDateId,
	startIndex,
	onStartIndexChange,
	onCancel,
	onNext,
} ) {
	const floorId = minDateId || initialDateId || '';
	const minIndex = findDateIndex( dates, floorId );
	const [ visibleDatesCount, setVisibleDatesCount ] = useState( () =>
		typeof window !== 'undefined'
			? getVisibleDateCount( window.innerWidth )
			: VISIBLE_DATES
	);

	useEffect( () => {
		const updateVisibleCount = () => {
			setVisibleDatesCount( getVisibleDateCount( window.innerWidth ) );
		};

		updateVisibleCount();
		window.addEventListener( 'resize', updateVisibleCount );
		return () => window.removeEventListener( 'resize', updateVisibleCount );
	}, [] );

	const maxStartIndex = Math.max( 0, dates.length - visibleDatesCount );

	useEffect( () => {
		if ( startIndex > maxStartIndex ) {
			onStartIndexChange?.( maxStartIndex );
		}
	}, [ startIndex, maxStartIndex, onStartIndexChange ] );

	return (
		<Formik
			initialValues={ { selectedDateId: initialDateId || floorId || '' } }
			validationSchema={ rescheduleSchema }
			enableReinitialize
			onSubmit={ ( values ) => {
				onNext?.( values.selectedDateId );
			} }
		>
			{ ( { values, errors, touched, setFieldValue, submitForm } ) => {
				const canPrev = startIndex > minIndex;
				const canNext = startIndex + visibleDatesCount < dates.length;

				const visibleDates = dates.slice(
					startIndex,
					startIndex + visibleDatesCount
				);

				return (
					<>
						<Form className="w-full">
							<div className="portal-date-picker">
								<button
									type="button"
									className="portal-date-picker__nav"
									aria-label={ __( 'Previous dates', 'stayilo' ) }
									disabled={ ! canPrev }
									onClick={ () =>
										onStartIndexChange?.(
											Math.max( minIndex, startIndex - 1 )
										)
									}
								>
									<NavArrowRightIcon
										width={ 24 }
										height={ 24 }
										className="rotate-180"
										aria-hidden="true"
									/>
								</button>

								<div
									className="portal-date-picker__track"
									role="radiogroup"
									aria-label={ __( 'Available order dates', 'stayilo' ) }
								>
									{ visibleDates.map( ( item, offset ) => {
										const index = startIndex + offset;
										const isPast = index < minIndex;

										return (
											<DateBadge
												key={ item.id }
												weekday={ item.weekday }
												day={ item.day }
												month={ item.month }
												selected={
													item.id === values.selectedDateId
												}
												disabled={ isPast }
												onClick={ () => {
													if ( isPast ) {
														return;
													}
													setFieldValue(
														'selectedDateId',
														item.id
													);
												} }
											/>
										);
									} ) }
								</div>

								<button
									type="button"
									className="portal-date-picker__nav"
									aria-label={ __( 'Next dates', 'stayilo' ) }
									disabled={ ! canNext }
									onClick={ () =>
										onStartIndexChange?.(
											Math.min( maxStartIndex, startIndex + 1 )
										)
									}
								>
									<NavArrowRightIcon
										width={ 24 }
										height={ 24 }
										aria-hidden="true"
									/>
								</button>
							</div>

							{ touched.selectedDateId && errors.selectedDateId ? (
								<p className="mt-3 m-0 text-sm text-[#C00808]" role="alert">
									{ errors.selectedDateId }
								</p>
							) : null }
						</Form>

						<div className="portal-popup__actions">
							<Button
								label={ __( 'Cancel', 'stayilo' ) }
								variant="secondary"
								showIcon={ false }
								onClick={ onCancel }
								className="portal-popup__action !border-[#000000]"
							/>
							<Button
								label={ __( 'Next', 'stayilo' ) }
								variant="primary"
								disabled={ ! values.selectedDateId }
								onClick={ submitForm }
								icon={
									<NavArrowIcon
										width={ 24 }
										height={ 24 }
										className="text-white"
									/>
								}
								className="portal-popup__action"
							/>
						</div>
					</>
				);
			} }
		</Formik>
	);
}
