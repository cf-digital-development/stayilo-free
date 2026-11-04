import { ReactComponent as AccountIcon } from './assets/svg/Account.svg';
import { ReactComponent as AccountActiveIcon } from './assets/svg/account-active.svg';
import { ReactComponent as ActivityLogIcon } from './assets/svg/ActivityLog.svg';
import { ReactComponent as ActivityLogActiveIcon } from './assets/svg/activitylog-active.svg';
import { ReactComponent as DashboardIcon } from './assets/svg/Dashboard.svg';
import { ReactComponent as DashboardActiveIcon } from './assets/svg/dashboard-active.svg';
import { ReactComponent as EmailIcon } from './assets/svg/Email.svg';
import { ReactComponent as EmailActiveIcon } from './assets/svg/email-active.svg';
import { ReactComponent as FlowsIcon } from './assets/svg/Flows.svg';
import { ReactComponent as FlowsActiveIcon } from './assets/svg/flow-active.svg';
import { ReactComponent as ReportsIcon } from './assets/svg/Reports.svg';
import { ReactComponent as ReportsActiveIcon } from './assets/svg/reports-active.svg';
import { ReactComponent as RulesIcon } from './assets/svg/Rules.svg';
import { ReactComponent as RulesActiveIcon } from './assets/svg/Rules-active.svg';
import { ReactComponent as SettingIcon } from './assets/svg/Setting.svg';
import { ReactComponent as SettingsActiveIcon } from './assets/svg/settings-active.svg';
import { ReactComponent as SubscriberIcon } from './assets/svg/Subscriber.svg';
import { ReactComponent as SubscribersActiveIcon } from './assets/svg/subscribers-active.svg';
import { ReactComponent as TemplatesIcon } from './assets/svg/Templates.svg';
import { ReactComponent as TemplatesActiveIcon } from './assets/svg/templates-active.svg';

const NAV_ICONS = {
	dashboard: { idle: DashboardIcon, active: DashboardActiveIcon },
	subscribers: { idle: SubscriberIcon, active: SubscribersActiveIcon },
	reports: { idle: ReportsIcon, active: ReportsActiveIcon },
	rules: { idle: RulesIcon, active: RulesActiveIcon },
	templates: { idle: TemplatesIcon, active: TemplatesActiveIcon },
	emails: { idle: EmailIcon, active: EmailActiveIcon },
	flows: { idle: FlowsIcon, active: FlowsActiveIcon },
	activity: { idle: ActivityLogIcon, active: ActivityLogActiveIcon },
	account: { idle: AccountIcon, active: AccountActiveIcon },
	settings: { idle: SettingIcon, active: SettingsActiveIcon },
};

export function SidebarNavIcon( { id, active = false } ) {
	const icons = NAV_ICONS[ id ];
	if ( ! icons ) {
		return null;
	}

	const IdleIcon = icons.idle;
	const ActiveIcon = icons.active;

	return (
		<span className="relative inline-flex h-6 w-6 shrink-0">
			<IdleIcon
				width={ 24 }
				height={ 24 }
				aria-hidden="true"
				className={ active ? 'hidden' : 'block group-hover:hidden' }
			/>
			<ActiveIcon
				width={ 24 }
				height={ 24 }
				aria-hidden="true"
				className={ active ? 'block' : 'hidden group-hover:block' }
			/>
		</span>
	);
}
