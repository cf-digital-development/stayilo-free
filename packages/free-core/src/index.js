export { default as App } from './App.jsx';
export { DashboardSlot } from '@stayilo/admin-shell';
export {
	FreePlanWizard,
	FREE_PLAN_STEPS,
	FREE_PLAN_STEP_INDEX,
	FREE_PLAN_STEP_COUNT,
} from './free-setup';
/** @deprecated Use FreePlanWizard */
export { FreePlanWizard as FreeSetupWizard } from './free-setup';
export { mountStayiloFreeAdmin } from './mount-admin.jsx';
export { mountStayiloFreeSetup } from './mount-setup.jsx';
export { ADMIN_MOUNT_ID, SETUP_MOUNT_ID } from './mount-config.js';
