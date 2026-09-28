import { ReactComponent as DownloadIcon } from '../../assets/svg/DownloadSimple.svg';

/**
 * @param {{ children?: string, disabled?: boolean, onClick?: () => void }} props
 */
export function ExportButton( { children = 'Export CSV', disabled = false, onClick } ) {
	return (
		<button
			type="button"
			disabled={ disabled }
			onClick={ onClick }
			className="inline-flex h-10 shrink-0 items-center gap-2 !rounded-xl !border-0 !bg-stayilo-ink !px-4 text-sm font-semibold !text-white !shadow-none hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
		>
			<DownloadIcon
				width={ 20 }
				height={ 20 }
				aria-hidden="true"
				className="shrink-0 [&_path]:stroke-current"
			/>
			{ children }
		</button>
	);
}
