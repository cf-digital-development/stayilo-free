
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as CheckIcon } from '@stayilo/design-system/assets/svg/CheckCircle.svg';
import { ReactComponent as XIcon } from '@stayilo/design-system/assets/svg/X.svg';

// const STORAGE_KEY = 'stayiloSetupChecklistDismissed';

function isDismissed() {
	if ( typeof window === 'undefined' ) {
		return false;
	}
	try {
		// return window.localStorage.getItem( STORAGE_KEY ) === '1';
	} catch {
		return false;
	}
}

function readChecklistItems( admin = {} ) {
	const branding = admin.branding || {};

	return [
		{
			id: 'portal',
			label: 'Portal live',
			done: Boolean( admin.setupComplete ),
			to: '/settings',
		},
		{
			id: 'branding',
			label: 'Branding configured',
			done: Boolean( branding.logoUrl || branding.brandColor ),
			to: '/templates',
		},
		{
			id: 'offers',
			label: 'Configure cancellation offers',
			done: false,
			to: '/flows',
		},
		{
			id: 'klaviyo',
			label: 'Connect Klaviyo',
			done: false,
			to: '/integrations',
		},
	];
}

function StepIcon( { done } ) {
	if ( done ) {
		return (
			<span className="flex shrink-0 items-center justify-center rounded-full dash">
				<CheckIcon width={ 16 } height={ 16 } className="text-white" aria-hidden="true" />
			</span>
		);
	}

	return (
		<span
			className="inline-block h-4 w-4 shrink-0 rounded-full border border-[#7C8494] bg-white"
			aria-hidden="true"
		/>
	);
}

export function SetupChecklist() {
	const [ hidden, setHidden ] = useState( isDismissed );
	const admin =
		typeof window !== 'undefined' ? window.stayiloAdmin || {} : {};
	const items = readChecklistItems( admin );
	const doneCount = items.filter( ( item ) => item.done ).length;
	const total = items.length;
	const percent = total ? Math.round( ( doneCount / total ) * 100 ) : 0;

	if ( hidden ) {
		return null;
	}

	const dismiss = () => {
		try {
			setHidden( true );
		} catch {
			// Ignore private-mode quota errors.
		}
		setHidden( true );
	};

	return (
		<section className="rounded-2xl border border-[#0D111714] bg-white px-5 py-4">
			<div className="flex items-center justify-between gap-3">
				<div className="flex min-w-0 flex-wrap items-baseline gap-3">
					<h2 className="text-sm text-[#7C8494] font-semibold leadiong-5 m-0">
						Setup checklist
					</h2>
					<p className="m-0 text-sm font-medium text-[#16A34A] leading-5">
						{ doneCount }/{ total } complete
					</p>
				</div>
				<button
					type="button"
					onClick={ dismiss }
					className="shrink-0 border-0 bg-transparent p-0 text-[#7C8494] transition-colors hover:text-stayilo-ink"
					aria-label="Dismiss setup checklist"
				>
					<XIcon width={ 20 } height={ 20 } aria-hidden="true" />
				</button>
			</div>

			<div
				className="mt-3 h-1 overflow-hidden rounded-full bg-[#EDEEF2]"
				role="progressbar"
				aria-valuemin={ 0 }
				aria-valuemax={ 100 }
				aria-valuenow={ percent }
				aria-label="Setup progress"
			>
				<div
					className="h-full rounded-full bg-[#16A34A] transition-[width]"
					style={ { width: `${ percent }%` } }
				/>
			</div>

			<ul className="m-0 mt-4 flex list-none flex-wrap items-center justify-between gap-x-6 gap-y-3 p-0">
				{ items.map( ( item ) => {
					const className = [
						'inline-flex items-center gap-2 text-sm  leading-5 font-normal no-underline shadow-none',
						item.done
							? 'text-stayilo-ink'
							: 'text-[#7C8494] hover:text-stayilo-ink',
					].join( ' ' );

					return (
						<li key={ item.id }>
							<Link to={ item.to } className={ className }>
								<StepIcon done={ item.done } />
								{ item.label }
							</Link>
						</li>
					);
				} ) }
			</ul>
		</section>
	);
}