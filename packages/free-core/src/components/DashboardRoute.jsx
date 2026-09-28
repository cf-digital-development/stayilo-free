import { DashboardPage } from '@stayilo/admin-shell';
import { useMerchantTier } from '@stayilo/admin-shell';

export default function DashboardRoute() {
	const tier = useMerchantTier();

	if ( tier === 'growth' || tier === 'free' ) {
		return <DashboardPage tier={ tier } />;
	}

	return <DashboardPage />;
}
