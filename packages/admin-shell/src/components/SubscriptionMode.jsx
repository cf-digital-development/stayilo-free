const MODE_OPTIONS = [
	{
		value: 'single',
		title: 'Single subscription',
		description:
			'Customers cannot start another subscription while one is already active. Subscriptions already on the account stay as they are.',
	},
	{
		value: 'multiple',
		title: 'Multiple subscriptions',
		description:
			'Customers can hold several active subscriptions simultaneously. Each appears as a separate card in the portal with its own controls.',
	},
];

export function SubscriptionMode( { settings, setSettings } ) {
	const mode = settings?.subscriptionMode === 'multiple' ? 'multiple' : 'single';

	const selectMode = ( value ) => {
		if ( ! setSettings ) {
			return;
		}
		setSettings( ( current ) => ( {
			...( current || {} ),
			subscriptionMode: value,
		} ) );
	};

	return (
		<section className="w-full max-w-[860px]">
			<h2 className="text-base font-semibold text-stayilo-ink capitalize">
				Subscription Mode
			</h2>
			<p className="mt-1 text-sm text-[#474C57] leading-5">
				Control whether customers can hold one or multiple active subscriptions simultaneously.
			</p>

			<div className="mt-5 space-y-4 rounded-xl border border-[#0D111714] bg-white p-4">
				{ MODE_OPTIONS.map( ( option ) => {
					const selected = mode === option.value;
					return (
						<button
							key={ option.value }
							type="button"
							onClick={ () => selectMode( option.value ) }
							className={ [
								'flex w-full items-start gap-4 rounded-xl border bg-white p-5 text-left transition-colors',
								selected
									? 'border-stayilo-ink'
									: 'border-[#0D11171A] hover:border-stayilo-ink',
							].join( ' ' ) }
						>
							<span
								className={ [
									'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-white',
									selected
										? 'border-stayilo-ink'
										: 'border-[#7C849499]',
								].join( ' ' ) }
								aria-hidden="true"
							>
								{ selected ? (
									<span
										className="block rounded-full bg-stayilo-ink"
										style={ { width: 10, height: 10 } }
									/>
								) : null }
							</span>
							<div className="min-w-0">
								<p className="text-base leading-6 font-semibold text-stayilo-ink">
									{ option.title }
								</p>
								<p className="mt-1 text-sm text-[#7C8494] leading-5">
									{ option.description }
								</p>
							</div>
						</button>
					);
				} ) }
			</div>
		</section>
	);
}
