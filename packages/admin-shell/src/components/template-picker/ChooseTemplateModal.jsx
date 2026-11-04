import { useEffect, useState } from 'react';
import { LayoutCard } from '@stayilo/design-system';
import { AdminCenterModal } from '../AdminCenterModal.jsx';
import { ReactComponent as ArrowRightIcon } from '../../assets/svg/ArrowRight.svg';
import { TemplateThumb } from './TemplateThumb.jsx';
import {
	getSelectableTemplateOptions,
	getTemplateDemoUrl,
} from './templateOptions.js';

export function ChooseTemplateModal( {
	open,
	onClose,
	value,
	onConfirm,
} ) {
	const [ draft, setDraft ] = useState( value || 'classic' );

	useEffect( () => {
		if ( open ) {
			setDraft( value || 'classic' );
		}
	}, [ open, value ] );

	return (
		<AdminCenterModal
			open={ open }
			onClose={ onClose }
			title="Choose a portal template"
			description="Pick a layout — you can fine-tune branding in the next step."
			panelClassName="max-w-[920px]"
			footerClassName="justify-start"
			footer={
				<button
					type="button"
					onClick={ () => onConfirm( draft ) }
					className="inline-flex items-center gap-2 rounded-xl bg-stayilo-ink px-5 py-3 text-sm font-semibold text-white"
				>
					Confirm Template
					<ArrowRightIcon className="h-4 w-4 text-white" aria-hidden="true" />
				</button>
			}
		>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{ getSelectableTemplateOptions().map( ( option ) => (
					<LayoutCard
						key={ option.value }
						title={ option.title }
						description={ option.description }
						preview={ <TemplateThumb template={ option.value } /> }
						selected={ draft === option.value }
						onClick={ () => setDraft( option.value ) }
						onViewDemo={ () =>
							window.open(
								getTemplateDemoUrl( option.value ),
								'_blank',
								'noopener,noreferrer'
							)
						}
					/>
				) ) }
			</div>
		</AdminCenterModal>
	);
}
