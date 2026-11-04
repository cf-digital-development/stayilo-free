import { useFormikContext } from 'formik';
import { __ } from '@stayilo/design-system/i18n';
import { SelectionCard } from '@stayilo/design-system/selection-card';
import multipleIconUrl from '@stayilo/design-system/assets/svg/multipleIcon.svg';

function MultipleIcon() {
	return (
		<img
			src={ multipleIconUrl }
			alt=""
			aria-hidden="true"
			className="block h-[23px] w-12"
		/>
	);
}

const MODE_OPTIONS = [
	{
		value: 'single',
		title: __( 'Single subscription', 'stayilo' ),
		description: __(
			'One active subscription per customer. Simplest portal experience — recommended for most stores.',
			'stayilo'
		),
	},
	{
		value: 'multiple',
		title: __( 'Multiple subscriptions', 'stayilo' ),
		description: __(
			'Customers can hold several active subscriptions simultaneously. Each appears as its own card in the portal.',
			'stayilo'
		),
		icon: <MultipleIcon />,
	},
];

export default function SubscriptionModeStep() {
	const { values, setFieldValue, errors, touched } = useFormikContext();
	const mode = values.mode;
	const showError = touched.mode && errors.mode ? errors.mode : undefined;

	return (
		<>
			<div className="flex flex-wrap gap-4 max-[620px]:flex-col max-[620px]:items-center max-[620px]:justify-center">
				{ MODE_OPTIONS.map( ( option ) => (
					<SelectionCard
						key={ option.value }
						title={ option.title }
						description={ option.description }
						icon={ option.icon }
						selected={ mode === option.value }
						onClick={ () => setFieldValue( 'mode', option.value ) }
					/>
				) ) }
			</div>

			{ showError ? (
				<p className="m-0 text-center text-xs leading-4 text-red-600">{ showError }</p>
			) : null }

			<p className="stayilo-type-body-muted text-center">
				{ __( 'You can change this later in Settings → Subscription Mode', 'stayilo' ) }
			</p>
		</>
	);
}
