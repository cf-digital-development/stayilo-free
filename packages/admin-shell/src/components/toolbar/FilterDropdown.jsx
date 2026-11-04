import { useEffect, useRef, useState } from 'react';
import { ReactComponent as CaretDownIcon } from '../../assets/svg/CaretDown.svg';
import { ReactComponent as SlidersIcon } from '../../assets/svg/Sliders.svg';

/**
 * Toolbar filter menu. `muted` matches Activity Log chips; `outline` matches Subscribers.
 *
 * @param {{
 *   options: { id: string, label: string }[],
 *   value: string,
 *   onChange: (id: string) => void,
 *   variant?: 'muted' | 'outline',
 *   icon?: 'sliders' | 'none',
 *   ariaLabel?: string,
 * }} props
 */
export function FilterDropdown( {
	options = [],
	value,
	onChange,
	variant = 'muted',
	icon = 'none',
	ariaLabel,
} ) {
	const [ open, setOpen ] = useState( false );
	const rootRef = useRef( null );
	const selected = options.find( ( option ) => option.id === value ) || options[ 0 ];

	useEffect( () => {
		if ( ! open ) {
			return undefined;
		}

		const onPointer = ( event ) => {
			if ( rootRef.current && ! rootRef.current.contains( event.target ) ) {
				setOpen( false );
			}
		};

		document.addEventListener( 'mousedown', onPointer );
		return () => document.removeEventListener( 'mousedown', onPointer );
	}, [ open ] );

	const triggerClass =
		variant === 'outline'
			? 'h-10 !rounded-xl !border !border-solid !border-[#0D11171A] !bg-white !text-stayilo-ink'
			: ' h-10 !rounded-[10px] !border !border-solid !border-[#0D111714] !bg-[#F0F1F5] !text-[#7C8494] !text-xs !font-medium !leading-[18px]';

	return (
		<div className="relative min-w-0 max-w-full" ref={ rootRef }>
			<button
				type="button"
				aria-label={ ariaLabel }
				aria-haspopup="listbox"
				aria-expanded={ open }
				onClick={ () => setOpen( ( prev ) => ! prev ) }
				className={ [
					'inline-flex max-w-full min-w-0 items-center gap-2 px-4 text-sm font-medium !shadow-none',
					triggerClass,
				].join( ' ' ) }
			>
				{ icon === 'sliders' ? (
					<SlidersIcon width={ 16 } height={ 16 } aria-hidden="true" />
				) : null }
				<span className="min-w-0 truncate">{ selected?.label }</span>
				<CaretDownIcon
					width={ 16 }
					height={ 16 }
					className={ [
						'shrink-0 transition-transform duration-300',
						open ? 'rotate-[-180deg]' : '',
					]
						.filter( Boolean )
						.join( ' ' ) }
					aria-hidden="true"
				/>
			</button>
			{ open ? (
				<ul
					role="listbox"
					className="absolute left-0 z-20  min-w-full overflow-hidden rounded-xl border border-[#0D11171A] bg-white"
				>
					{ options.map( ( option ) => (
						<li  className="!mb-0 " key={ option.id }>
							<button
								type="button"
								role="option"
								aria-selected={ option.id === value }
								className={ [
									'flex w-full whitespace-nowrap !border-0 px-5 py-3 text-left text-sm leading-5 !shadow-none',
									option.id === value
										? '!bg-stayilo-ink !text-white'
										: '!bg-white !text-stayilo-ink hover:!bg-stayilo-ink hover:!text-white',
								].join( ' ' ) }
								onClick={ () => {
									onChange( option.id );
									setOpen( false );
								} }
							>
								{ option.menuLabel || option.label }
							</button>
						</li>
					) ) }
				</ul>
			) : null }
		</div>
	);
}
