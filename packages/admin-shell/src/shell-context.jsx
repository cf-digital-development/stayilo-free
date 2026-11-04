import { createContext, useContext } from 'react';

const AppShellContext = createContext( null );

export function AppShellProvider( { value, children } ) {
	return (
		<AppShellContext.Provider value={ value }>
			{ children }
		</AppShellContext.Provider>
	);
}

export function useAppShell() {
	return useContext( AppShellContext );
}
