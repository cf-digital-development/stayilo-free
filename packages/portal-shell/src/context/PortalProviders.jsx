import { Provider } from 'react-redux';
import { BootstrapEffects } from '../store/BootstrapEffects.jsx';
import { store } from '../store/index.js';
import { TemplateProvider } from '../templates/TemplateProvider.jsx';

/**
 * Root Redux provider for the entire portal shell.
 * Account avatar still rehydrates from localStorage in the background.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 */
export function PortalProviders( { children } ) {
	return (
		<Provider store={ store }>
			<BootstrapEffects />
			<TemplateProvider>
				{ children }
			</TemplateProvider>
		</Provider>
	);
}
