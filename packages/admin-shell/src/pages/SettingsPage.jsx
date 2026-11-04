import { Button, SettingToggleCard } from '@stayilo/design-system';
import { PageHeader } from '../components/PageHeader.jsx';
import { LockedSettingsCard } from '../components/LockedSettingsCard.jsx';
import { SubscriptionMode } from '../components/SubscriptionMode.jsx';
import { visibleLockedSettingsCards } from '../components/settings-locked-cards.js';
import { useMerchantTier } from '../tier.js';
import { usePortalSettings } from '../hooks/useAdminData.js';
import { ReactComponent as SaveIcon } from '../assets/svg/FloppyDisk.svg';

/**
 * @param {{ tier?: 'free'|'core'|'growth' }} props
 */
export function SettingsPage( { tier: tierProp } ) {
	const merchantTier = useMerchantTier();
	const tier = tierProp ?? merchantTier;
	const lockedCards = visibleLockedSettingsCards( tier );

	const { settings, setSettings, loading, saving, error, save } = usePortalSettings();

	return (
		<>
		<div className=" md:px-10 px-4 py-4 border-b border-[#0D11171A]">
			<PageHeader
				title="Settings"
				subtitle="Configure how Stayilo behaves across your store"
				actions={
					<Button
						variant="primary"
						onClick={ save }
						disabled={ loading || saving || ! settings }
						className="inline-flex items-center gap-2 rounded-xl bg-stayilo-ink px-4 py-[10px] text-sm leading-5 font-medium text-white !shadow-none disabled:opacity-60"
						>
						<SaveIcon width={ 16 } height={ 16 } aria-hidden="true" />
						{ saving ? 'Saving…' : 'Save changes' }
					</Button>
				}
			/>
		</div>
		<div className=" md:px-10 px-4 py-6 space-y-5">
			{ error ? (
				<p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
					{ error }
				</p>
			) : null }
<div className="">
    <h2 className="text-base font-semibold text-stayilo-ink leading-6 capitalize">Portal actions</h2>
				<p className="mt-1 text-sm leading-5 text-[#474C57]">
					Control what customers can do in the self-serve portal. Changes take effect immediately.
				</p>

</div>
			<section className=" !mt-5 rounded-2xl border border-[#0D111714] bg-white">
				<div className="py-3">
					<p className="text-sm font-semibold uppercase leading-5 text-[#7C8494] !px-5">
						Self-serve actions
					</p>
					{ settings ? (
						<div className="mt-3 space-y-0">
							<SettingToggleCard
								title="Skip delivery"
								description="Let customers skip their next scheduled delivery."
								checked={ settings.skipDelivery }
								onChange={ ( checked ) =>
									setSettings( ( prev ) => ( { ...prev, skipDelivery: checked } ) )
								}
								showStatus
								className="!rounded-none !border-x-0 !px-5 !border-b-0"
							/>
							<SettingToggleCard
								title="Update address"
								description="Let customers change their shipping address in the portal."
								checked={ settings.updateAddress }
								onChange={ ( checked ) =>
									setSettings( ( prev ) => ( { ...prev, updateAddress: checked } ) )
								}
								showStatus
								className="!rounded-none !border-x-0 !px-5 !border-b-0"
							/>
							<SettingToggleCard
								title="Storefront cart drawer"
								description="Show Stayilo’s mini-cart drawer on shop, product and cart pages for logged-in customers. On by default."
								checked={ settings.storefrontCartDrawer !== false }
								onChange={ ( checked ) =>
									setSettings( ( prev ) => ( {
										...prev,
										storefrontCartDrawer: checked,
									} ) )
								}
								showStatus
								className="!rounded-none !border-x-0 !px-5 !border-b-0"
							/>
						</div>
					) : (
						<p className=" !mt-3 !px-5 text-sm text-stayilo-muted">Loading portal settings...</p>
					) }
				</div>
			</section>

			{ settings ? (
				<SubscriptionMode settings={ settings } setSettings={ setSettings } />
			) : null }

			{ lockedCards.length ? (
				<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
					{ lockedCards.map( ( card ) => (
						<LockedSettingsCard
							key={ card.id }
							title={ card.title }
							subtitle={ card.subtitle }
							value={ card.value }
							tier={ card.tier }
						/>
					) ) }
				</div>
			) : null }
		</div>
		</>
	);
}

export default SettingsPage;
