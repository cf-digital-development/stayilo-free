const previewShellClass =
	'relative flex h-full min-h-[164px] w-full flex-col overflow-hidden rounded-xl bg-[#F3F4F6] p-3 box-border';

const fieldClass = 'h-2.5 rounded bg-white border border-[#E5E7EB]';
const barClass = 'mt-auto h-3 w-full rounded bg-[#0D1117]';

function ClassicPreview() {
	return (
		<div className={ previewShellClass } aria-hidden="true">
			<div className="absolute right-3 top-3 h-3 w-10 rounded-full bg-[#16A34A]" />
			<div className="mt-6 flex flex-col gap-2">
				<div className="grid grid-cols-2 gap-2">
					<div className={ fieldClass } />
					<div className={ fieldClass } />
				</div>
				<div className="grid grid-cols-2 gap-2">
					<div className="flex flex-col gap-1">
						<div className={ fieldClass } />
						<div className="h-0.5 w-full rounded bg-[#DC2626]" />
					</div>
					<div className={ fieldClass } />
				</div>
			</div>
			<div className={ barClass } />
		</div>
	);
}

function SplitPreview() {
	return (
		<div className={ previewShellClass } aria-hidden="true">
			<div className="flex min-h-0 flex-1 gap-2">
				<div className="flex w-[38%] flex-col gap-1.5 rounded-lg border border-[#E5E7EB] bg-white/80 p-2">
					<div className="h-2 rounded bg-[#E5E7EB]" />
					<div className="h-2 rounded bg-[#E5E7EB]" />
					<div className="h-2 rounded bg-[#E5E7EB]" />
				</div>
				<div className="flex flex-1 flex-col gap-2">
					<div className={ fieldClass } />
					<div className={ fieldClass } />
				</div>
			</div>
			<div className={ barClass } />
		</div>
	);
}

function CardPreview() {
	return (
		<div className={ previewShellClass } aria-hidden="true">
			<div className="grid flex-1 grid-cols-2 gap-2">
				{ [ 1, 2, 3, 4 ].map( ( key ) => (
					<div
						key={ key }
						className="rounded-lg border border-[#E5E7EB] bg-white p-2"
					>
						<div className="mb-2 h-8 rounded bg-[#E5E7EB]" />
						<div className="h-2 w-2/3 rounded bg-[#E5E7EB]" />
					</div>
				) ) }
			</div>
			<div className={ barClass } />
		</div>
	);
}

function CompactPreview() {
	return (
		<div className={ previewShellClass } aria-hidden="true">
			<div className="flex flex-1 flex-col gap-1.5">
				<div className="h-3 rounded border border-[#E5E7EB] bg-white" />
				<div className="h-3 rounded border border-[#E5E7EB] bg-white" />
				<div className="h-3 rounded border border-[#E5E7EB] bg-white" />
				<div className="h-3 rounded border border-[#E5E7EB] bg-white" />
			</div>
			<div className={ barClass } />
		</div>
	);
}

function FocusPreview() {
	return (
		<div className={ previewShellClass } aria-hidden="true">
			<div className="mx-auto flex w-[72%] flex-1 flex-col items-center justify-center gap-2">
				<div className="h-2.5 w-full rounded border border-[#E5E7EB] bg-white" />
				<div className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-white" />
				<div className="h-2.5 w-3/5 rounded bg-[#E5E7EB]" />
			</div>
			<div className={ barClass } />
		</div>
	);
}

const PREVIEWS = {
	classic: ClassicPreview,
	split: SplitPreview,
	card: CardPreview,
	compact: CompactPreview,
	focus: FocusPreview,
};

export function TemplateThumb( { template } ) {
	const Preview = PREVIEWS[ template ] || ClassicPreview;
	return <Preview />;
}
