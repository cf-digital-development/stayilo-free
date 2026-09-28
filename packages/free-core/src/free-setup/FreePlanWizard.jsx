import { useEffect, useState } from 'react';
import { __, sprintf } from '@stayilo/design-system/i18n';
import { Formik, useFormikContext } from 'formik';
import { saveSubscriptionMode } from '@stayilo/admin-shell';
import { Stepper } from '@stayilo/design-system/stepper';
import { StepCard } from '@stayilo/design-system/step-card';
import { StepHeader } from '@stayilo/design-system/step-header';
import { WizardHeader } from '@stayilo/design-system/wizard-header';
import shieldIconUrl from '@stayilo/design-system/assets/svg/ShieldCheck.svg';
import {
	FREE_PLAN_STEPS,
	FREE_PLAN_STEP_COUNT,
	FREE_PLAN_STEP_INDEX,
} from './config/constants';
import {
	EnvironmentStep,
	ConnectStoreStep,
	PreviewStep,
	SubscriptionModeStep,
} from './steps';
import LivePortalStep, { LIVE_PORTAL_STEP_CARD_CLASS } from './steps/LivePortalStep';
import {
	buildEnvironmentChecks,
	errorsToTouched,
	getFreePlanInitialValues,
	resolveFreeWizardStep,
	validateFreePlanStep,
	writeFreeWizardStep,
} from './validation';

const admin = window.stayiloAdmin || {};
const initialValues = getFreePlanInitialValues( admin );

function formatStepLabel( stepIndex ) {
	return sprintf(
		/* translators: %d: step number. */
		__( 'STEP %d', 'stayilo' ),
		stepIndex + 1
	);
}

function FreePlanWizardForm() {
	const { values, setErrors, setTouched } = useFormikContext();
	const [ currentStep, setCurrentStep ] = useState( () =>
		resolveFreeWizardStep( admin, initialValues )
	);
	const [ checks ] = useState( buildEnvironmentChecks );
	const [ isContinuing, setIsContinuing ] = useState( false );

	useEffect( () => {
		writeFreeWizardStep( currentStep, admin );
	}, [ currentStep ] );

	const isFirst = currentStep === FREE_PLAN_STEP_INDEX.environment;
	const isLiveStep = currentStep === FREE_PLAN_STEP_INDEX.live;
	const isModeStep = currentStep === FREE_PLAN_STEP_INDEX.mode;
	const envPassed = checks.every( ( row ) => row.status === 'valid' );

	const goNext = () => {
		setCurrentStep( ( step ) => Math.min( step + 1, FREE_PLAN_STEPS.length - 1 ) );
	};

	const goBack = () => {
		setCurrentStep( ( step ) => Math.max( step - 1, FREE_PLAN_STEP_INDEX.environment ) );
	};

	const onContinue = async () => {
		setIsContinuing( true );
		try {
			const stepErrors = await validateFreePlanStep( currentStep, values );
			if ( Object.keys( stepErrors ).length > 0 ) {
				setErrors( stepErrors );
				setTouched( errorsToTouched( stepErrors ), false );
				return;
			}

			if ( isModeStep ) {
				try {
					await saveSubscriptionMode( values.mode );
				} catch {
					// Live step completion persists mode as a fallback.
				}
			}

			goNext();
		} finally {
			setIsContinuing( false );
		}
	};

	let title = '';
	let description = '';
	let icon = null;
	let content = null;
	let continueActive = true;
	let continueLabel = __( 'Continue', 'stayilo' );

	if ( currentStep === FREE_PLAN_STEP_INDEX.environment ) {
		title = __( 'Environment check', 'stayilo' );
		description = __(
			"Verifying that your server meets Stayilo's requirements. This runs automatically — no action needed if everything passes.",
			'stayilo'
		);
		icon = <img src={ shieldIconUrl } alt="" aria-hidden="true" width={ 24 } height={ 24 } />;
		content = <EnvironmentStep checks={ checks } />;
		continueActive = envPassed;
	}

	if ( currentStep === FREE_PLAN_STEP_INDEX.connect ) {
		title = __( 'Connect your store', 'stayilo' );
		description = __(
			'Enter your store URL and Stayilo will connect automatically using the WooCommerce REST API.',
			'stayilo'
		);
		icon = <img src={ shieldIconUrl } alt="" aria-hidden="true" width={ 24 } height={ 24 } />;
		content = <ConnectStoreStep />;
		continueActive =
			Boolean( values.storeConnected ) &&
			Boolean( String( values.adminEmail || '' ).trim() );
	}

	if ( currentStep === FREE_PLAN_STEP_INDEX.preview ) {
		title = __( 'Your portal is ready', 'stayilo' );
		description = __(
			'The subscriber portal is live with default Stayilo styling. Here’s what your customers will see:',
			'stayilo'
		);
		icon = <img src={ shieldIconUrl } alt="" aria-hidden="true" width={ 24 } height={ 24 } />;
		content = <PreviewStep />;
		continueActive = true;
	}

	if ( isModeStep ) {
		title = __( 'Subscription mode', 'stayilo' );
		description = __( 'How many active subscriptions can one customer hold at a time?', 'stayilo' );
		icon = <img src={ shieldIconUrl } alt="" aria-hidden="true" width={ 24 } height={ 24 } />;
		content = <SubscriptionModeStep />;
		continueActive = Boolean( values.mode );
	}

	if ( isLiveStep ) {
		content = (
			<LivePortalStep
				storeUrl={ values.storeUrl }
				dashboardUrl={ admin.dashboardUrl }
				plansUrl={ admin.plansUrl || admin.upgradeUrl }
				subscriptionMode={ values.mode }
				storeConnected={ values.storeConnected }
				subscriberCount={ values.subscriberCount }
				adminEmail={ values.adminEmail }
				marketingOptIn={ values.marketingOptIn }
			/>
		);
	}

	return (
		<div className="stayilo-free-plan-setup">
			<WizardHeader
				subtitle={ __( 'Free plan setup', 'stayilo' ) }
				currentStep={ currentStep }
				totalSteps={ FREE_PLAN_STEP_COUNT }
			/>

			<Stepper
				steps={ FREE_PLAN_STEPS }
				currentStep={ currentStep }
				numbering="absolute"
				align="center"
			/>

			<StepCard
				className={ isLiveStep ? LIVE_PORTAL_STEP_CARD_CLASS : '' }
				onBack={ goBack }
				onContinue={ onContinue }
				showBack={ ! isFirst && ! isLiveStep }
				continueActive={ continueActive && ! isContinuing }
				continueLabel={ continueLabel }
				showFooter={ ! isLiveStep }
			>
				{ ! isLiveStep ? (
					<StepHeader
						stepText={ formatStepLabel( currentStep ) }
						title={ title }
						description={ description }
						icon={ icon }
					/>
				) : null }

				{ content }
			</StepCard>
		</div>
	);
}

/**
 * Free plan onboarding: environment → connect → preview → mode → live.
 */
export default function FreePlanWizard() {
	return (
		<Formik
			initialValues={ initialValues }
			onSubmit={ () => {} }
			validateOnBlur={ false }
			validateOnChange={ false }
		>
			<FreePlanWizardForm />
		</Formik>
	);
}
