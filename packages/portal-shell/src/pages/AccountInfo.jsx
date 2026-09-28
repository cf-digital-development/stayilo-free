import { useNavigate, useOutletContext } from 'react-router-dom';
import { Banner } from '../components/Banner.jsx';
import { AccountDetailsCards } from '../components/AccountDetailsCards.jsx';
import { SubscriptionManagementBanner } from '../components/SubscriptionManagementBanner.jsx';
import { ACCOUNT_INFO_BANNER } from '../data/accountInfo.js';
import { ACCOUNT_SUBSCRIPTION_PATH } from '../routes.js';
import { canShowFreeSelfServeManageUi } from '../utils/portalActions.js';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';


/**
 * Account information page — profile, password, subscription management.
 */
export function AccountInfo() {
	const navigate = useNavigate();
	const {
		avatarUrl,
		avatarAlt,
		isDefaultAvatar,
		updateAvatar,
		resetAvatar,
	} = useOutletContext() ?? {};
	const canManageSelfServe = canShowFreeSelfServeManageUi();
	const { id } = useTemplateRecipe();


	return (
		<div className="w-full">
			<Banner { ...ACCOUNT_INFO_BANNER } showDecorations={ id === 'minimal' }/>

			<section className="portal-account-info portal-content portal-section--padded !max-w-[1120px] mx-auto">
				<AccountDetailsCards
					avatarUrl={ avatarUrl }
					avatarAlt={ avatarAlt }
					isDefaultAvatar={ isDefaultAvatar }
					updateAvatar={ updateAvatar }
					resetAvatar={ resetAvatar }
				/>
				<SubscriptionManagementBanner
					disabled={ ! canManageSelfServe }
					avatarUrl={ avatarUrl }
					avatarAlt={ avatarAlt }
					onManage={ () =>
						navigate( ACCOUNT_SUBSCRIPTION_PATH, {
							state: { activeNavId: 'account' },
						} )
					}
				/>
			</section>
		</div>
	);
}
