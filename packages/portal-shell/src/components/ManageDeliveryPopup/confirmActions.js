import { __ } from '@stayilo/design-system/i18n';
/**
 * Shared Back + Confirm action pair for delivery confirm steps.
 *
 * @param {object} options
 * @param {() => void} [options.onBack]
 * @param {() => void} [options.onConfirm]
 * @param {boolean} [options.confirmLoading]
 * @param {boolean} [options.disabled]
 * @param {string} [options.confirmLabel='Confirm']
 * @param {string} [options.loadingLabel]
 */
export function buildConfirmActions( {
	onBack,
	onConfirm,
	confirmLoading = false,
	disabled = false,
	confirmLabel = 'Confirm',
	loadingLabel = 'Saving…',
} ) {
	return [
		{
			label: __( 'Back', 'stayilo' ),
			variant: 'secondary',
			showIcon: false,
			onClick: onBack,
			disabled: confirmLoading || disabled,
			className: '!border-[#000000]',
		},
		{
			label: confirmLoading ? loadingLabel : confirmLabel,
			variant: 'primary',
			onClick: onConfirm,
			loading: confirmLoading,
			disabled: disabled,
		},
	];
}
