import { Outlet } from 'react-router-dom';
import { AnnouncementBanner } from '../../components/AnnouncementBanner.jsx';
import { Header } from '../../components/Header.jsx';
import { NavMenu } from '../../components/NavMenu.jsx';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Classic chrome — same top bar as Minimal (logo + tools from the designed
 * header) with page links in a left sidebar instead of in the header row.
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
export function Sidebar( {
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
			<div className="portal-classic">
				<aside className="portal-classic-sidebar" aria-label={ __( 'Portal', 'stayilo' ) }>
					<NavMenu
						navItems={ navItems }
						activeNavId={ activeNavId }
						onNavChange={ onNavChange }
						variant="sidebar"
					/>
				</aside>
				<div className="portal-classic-column">
					<Header
						brandName={ brandName }
						logoUrl={ logoUrl }
						navItems={ navItems }
						activeNavId={ activeNavId }
						onNavChange={ onNavChange }
						avatarUrl={ avatarUrl }
						avatarAlt={ avatarAlt }
						showDesktopNav={ false }
					/>
					<main className="portal-main">
						<Outlet context={ outletContext } />
					</main>
				</div>
			</div>
		</>
	);
}
