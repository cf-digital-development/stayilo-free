import { __ } from '@stayilo/design-system/i18n';

/** Ordered steps for the Free plan onboarding flow. */
export const FREE_PLAN_STEPS = [
	{ id: 'environment', label: __( 'Environment', 'stayilo' ) },
	{ id: 'connect', label: __( 'Connect', 'stayilo' ) },
	{ id: 'preview', label: __( 'Preview', 'stayilo' ) },
	{ id: 'mode', label: __( 'Mode', 'stayilo' ) },
	{ id: 'live', label: __( 'Live', 'stayilo' ) },
];

export const FREE_PLAN_STEP_INDEX = Object.fromEntries(
	FREE_PLAN_STEPS.map( ( step, index ) => [ step.id, index ] )
);

export const FREE_PLAN_STEP_COUNT = FREE_PLAN_STEPS.length;

/** Maximum active subscribers managed on the Free plan. */
export { FREE_SUBSCRIBER_CAP as FREE_PLAN_SUBSCRIBER_LIMIT } from '@stayilo/design-system/validation';
