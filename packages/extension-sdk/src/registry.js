/**
 * @typedef {import('react').ComponentType<any>} RegistryComponent
 */

const REGISTRY_KEY = 'StayiloRegistry';

/**
 * @typedef {object} StayiloRegistry
 * @property {number} apiVersion
 * @property {Record<string, RegistryComponent>} dashboardWidgets
 * @property {Record<string, RegistryComponent>} adminPages
 * @property {Record<string, RegistryComponent>} portalTemplates
 * @property {Record<string, RegistryComponent>} portalActions
 * @property {Record<string, RegistryComponent>} wizardSteps
 * @property {Record<string, RegistryComponent>} portalRoutes
 * @property {Array<object>} portalActionCards
 * @property {(slotId: string, component: RegistryComponent) => void} registerDashboardWidget
 * @property {(routeId: string, component: RegistryComponent) => void} registerAdminPage
 * @property {(templateId: string, component: RegistryComponent) => void} registerPortalTemplate
 * @property {(actionId: string, component: RegistryComponent) => void} registerPortalAction
 * @property {(afterStepId: string, component: RegistryComponent) => void} registerWizardStep
 * @property {(path: string, component: RegistryComponent) => void} registerPortalRoute
 * @property {(card: object) => void} registerPortalActionCard
 * @property {(tier: 'free'|'core'|'growth'|null|undefined) => void} setMerchantTier
 * @property {() => 'free'|'core'|'growth'} getMerchantTier
 * @property {(slotId: string) => RegistryComponent | undefined} getDashboardWidget
 * @property {(routeId: string) => RegistryComponent | undefined} getAdminPage
 * @property {(templateId: string) => RegistryComponent | undefined} getPortalTemplate
 * @property {(actionId: string) => RegistryComponent | undefined} getPortalAction
 * @property {(afterStepId: string) => RegistryComponent | undefined} getWizardStep
 * @property {(path: string) => RegistryComponent | undefined} getPortalRoute
 * @property {() => Array<object>} getPortalActionCards
 */

/**
 * Create the shared Stayilo extension registry.
 *
 * @returns {StayiloRegistry}
 */
export function createStayiloRegistry() {
	let merchantTier = 'free';

	/** @type {StayiloRegistry} */
	const registry = {
		apiVersion: 1,
		dashboardWidgets: {},
		adminPages: {},
		portalTemplates: {},
		portalActions: {},
		wizardSteps: {},
		portalRoutes: {},
		portalActionCards: [],
		portalApis: {},
		portalRecipes: {},

		setMerchantTier( tier ) {
			const raw = String( tier || '' ).toLowerCase();
			const next =
				raw === 'growth'
					? 'growth'
					: raw === 'core' || raw === 'pro'
						? 'core'
						: 'free';
			if ( next === merchantTier ) {
				return;
			}
			merchantTier = next;
			if ( typeof window !== 'undefined' ) {
				window.dispatchEvent( new CustomEvent( 'stayilo-premium-loaded' ) );
			}
		},

		getMerchantTier() {
			return merchantTier;
		},

		registerDashboardWidget( slotId, component ) {
			registry.dashboardWidgets[ slotId ] = component;
		},

		registerAdminPage( routeId, component ) {
			registry.adminPages[ routeId ] = component;
		},

		registerPortalTemplate( templateId, component ) {
			registry.portalTemplates[ templateId ] = component;
		},

		registerPortalRecipe( templateId, recipe ) {
			registry.portalRecipes[ templateId ] = recipe;
		},

		registerPortalAction( actionId, component ) {
			registry.portalActions[ actionId ] = component;
		},

		registerWizardStep( afterStepId, component ) {
			registry.wizardSteps[ afterStepId ] = component;
		},

		registerPortalRoute( path, component ) {
			registry.portalRoutes[ path ] = component;
		},

		registerPortalApi( name, fn ) {
			registry.portalApis[ name ] = fn;
		},

		registerPortalActionCard( card ) {
			const id = card && card.id;
			registry.portalActionCards = registry.portalActionCards.filter(
				( existing ) => ! id || existing.id !== id
			);
			registry.portalActionCards.push( card );
		},

		getDashboardWidget( slotId ) {
			return registry.dashboardWidgets[ slotId ];
		},

		getAdminPage( routeId ) {
			return registry.adminPages[ routeId ];
		},

		getPortalTemplate( templateId ) {
			return registry.portalTemplates[ templateId ];
		},

		getPortalRecipe( templateId ) {
			return registry.portalRecipes[ templateId ];
		},

		getPortalAction( actionId ) {
			return registry.portalActions[ actionId ];
		},

		getWizardStep( afterStepId ) {
			return registry.wizardSteps[ afterStepId ];
		},

		getPortalRoute( path ) {
			return registry.portalRoutes[ path ];
		},

		getPortalRoutes() {
			return registry.portalRoutes;
		},

		getPortalApi( name ) {
			return registry.portalApis[ name ];
		},

		getPortalActionCards() {
			return registry.portalActionCards;
		},
	};

	return registry;
}

/**
 * Attach the registry to `window` for paid bundles loaded after Free.
 *
 * @param {StayiloRegistry} [registry]
 * @returns {StayiloRegistry}
 */
export function initStayiloRegistry( registry = createStayiloRegistry() ) {
	if ( typeof window !== 'undefined' ) {
		window[ REGISTRY_KEY ] = registry;
	}
	return registry;
}

/**
 * Read the global registry (creates one if missing).
 *
 * @returns {StayiloRegistry}
 */
export function getStayiloRegistry() {
	if ( typeof window !== 'undefined' && window[ REGISTRY_KEY ] ) {
		return window[ REGISTRY_KEY ];
	}
	return initStayiloRegistry();
}
