import { __ } from '@stayilo/design-system/i18n';
import { ReactComponent as SkipIcon } from '@stayilo/design-system/assets/svg/skip.svg';
import { ReactComponent as UpdateIcon } from '@stayilo/design-system/assets/svg/update.svg';

/** Read-only customer portal mockup for step 3 preview. */
export default function FreePlanPortalPreview() {
	return (
		<section
			className="overflow-hidden rounded-[15px] border-2 border-stayilo-ink-alpha bg-[#F8F8F8] p-[18.75px] max-[600px]:p-4"
			aria-label={ __( 'Customer portal preview', 'stayilo' ) }
		>
			<div className="mx-auto max-w-[400px] rounded-2xl border border-stayilo-ink-alpha bg-white p-5 shadow-[0px_1px_3px_0px_#0000000A]">
				<div className="mb-[13.25px] flex items-center justify-between gap-3">
					<div className="flex min-w-0 items-center gap-2">
						<span className="inline-flex h-[22.5px] w-[22.5px] shrink-0 items-center justify-center rounded-[3.75px] bg-stayilo-ink  font-bold font-inter text-[9px] !leading-[13.5px] font-black text-white">
							St
						</span>
						<span className="truncate font-inter text-[13px] font-semibold leading-5 text-stayilo-ink">
							{ __( 'Stayilo Portal', 'stayilo' ) }
						</span>
					</div>
					<span className="shrink-0 font-inter text-xs font-normal leading-4 text-[#7C8494]">
						{ __( 'Default branding', 'stayilo' ) }
					</span>
				</div>

				<p className="m-0 mb-[10px] font-inter text-xs font-normal leading-[18px] text-[#7C8494]">
					{ __( 'Hi Sarah, manage your subscription:', 'stayilo' ) }
				</p>

				<div className="stayilo-stack-8 !space-y-1">
					<div
						className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-0 bg-stayilo-ink px-4 py-[11px] font-inter text-xs font-semibold leading-[18px] text-white"
						aria-hidden="true"
					>
						<SkipIcon className="block h-[13px] w-[13px]" />
						<span>{ __( 'Skip delivery', 'stayilo' ) }</span>
					</div>
					<div
						className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-stayilo-ink-alpha bg-stayilo-chip px-4 py-[10px] font-inter text-xs font-semibold leading-[18px] text-stayilo-ink"
						aria-hidden="true"
					>
						<UpdateIcon className="block h-[13px] w-[13px]" />
						<span>{ __( 'Update payment', 'stayilo' ) }</span>
					</div>
				</div>
                       <div className='mt-3 mb-2 border-t border-stayilo-ink-alpha'></div>
				<p className=" text-center font-inter text-[10px] font-normal leading-[14px] text-[#7C8494] capitalize">
					{ __( 'Powered by stayilo', 'stayilo' ) }
				</p>
			</div>
		</section>
	);
}
