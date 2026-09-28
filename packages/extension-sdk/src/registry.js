/**
 * @typedef {import('react').ComponentType<any>} RegistryComponent
 */

const REGISTRY_KEY = 'StayiloRegistry';

/**
 * @typedef {object} StayiloRegistry
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
	/** @type {StayiloRegistry} */
	const registry = {
		dashboardWidgets: {},
		adminPages: {},
		portalTemplates: {},
		portalActions: {},
		wizardSteps: {},
		portalRoutes: {},
		portalActionCards: [],

		registerDashboardWidget( slotId, component ) {
			registry.dashboardWidgets[ slotId ] = component;
		},

		registerAdminPage( routeId, component ) {
			registry.adminPages[ routeId ] = component;
		},

		registerPortalTemplate( templateId, component ) {
			registry.portalTemplates[ templateId ] = component;
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

		getPortalAction( actionId ) {
			return registry.portalActions[ actionId ];
		},

		getWizardStep( afterStepId ) {
			return registry.wizardSteps[ afterStepId ];
		},

		getPortalRoute( path ) {
			return registry.portalRoutes[ path ];
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
