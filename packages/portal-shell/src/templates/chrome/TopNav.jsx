import { Outlet } from 'react-router-dom';
import { AnnouncementBanner } from '../../components/AnnouncementBanner.jsx';
import { Header } from '../../components/Header.jsx';

/**
 * Classic chrome — portal frame (top header + main). Markup and
 * class names match the previous PortalShell return 1:1.
 *
 * @param {object} props
 * @param {boolean} props.bannerEnabled
 * @param {string} [props.bannerText]
 * @param {string} [props.bannerColor]
 * @param {string} [props.bannerLink]
 * @param {string} [props.brandName]
 * @param {string} [props.logoUrl]
 * @param {Array<object>} props.navItems
 * @param {string} props.activeNavId
 * @param {(navId: string) => void} props.onNavChange
 * @param {string} [props.avatarUrl]
 * @param {string} [props.avatarAlt]
 * @param {object} props.outletContext
 */
export function TopNav( {
	bannerEnabled,
	bannerText,
	bannerColor,
	bannerLink,
	brandName,
	logoUrl,
	navItems,
	activeNavId,
	onNavChange,
	avatarUrl,
	avatarAlt,
	outletContext,
} ) {
	return (
		<>
			<AnnouncementBanner
				enabled={ bannerEnabled }
				text={ bannerText }
				color={ bannerColor }
				link={ bannerLink }
			/>
			<Header
				brandName={ brandName }
				logoUrl={ logoUrl }
				navItems={ navItems }
				activeNavId={ activeNavId }
				onNavChange={ onNavChange }
				avatarUrl={ avatarUrl }
				avatarAlt={ avatarAlt }
			/>

			<main className="portal-main">
				<Outlet context={ outletContext } />
			</main>
		</>
	);
}
