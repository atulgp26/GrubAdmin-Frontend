import { useEffect } from "react";
import Collapse from "@/components/ui/Collapse";

export default function CollapseTable({
	renderTable,
	data = [],
	pagination,
	onOpen,
	onClose,
	isOpen,
	onClick = () => {},
	groupName = "",
	emptyResult = "",
	scrollable = false,
	scrollableMaxHeight = "calc(100vh - 250px)",
}) {
	useEffect(() => {
		if (!isOpen) {
			onClose();
		} else {
			onOpen();
		}
	}, [isOpen]);

	const renderContent = () => {
		const content =
			data.length > 0 ? (
				renderTable(data)
			) : (
				<div className="bg-white border-b">
					<div className="my-2 px-2 py-2 flex items-center">
						<div className="font-normal text-base text-[var(--color-stroke-brand)] pl-8">
							{emptyResult}
						</div>
					</div>
				</div>
			);

		if (scrollable && data.length > 0) {
			return (
				<div
					className="overflow-y-auto"
					style={{ maxHeight: scrollableMaxHeight }}
				>
					{content}
				</div>
			);
		}

		return content;
	};

	return (
		<Collapse
			title={groupName}
			open={isOpen}
			pagination={pagination}
			onClick={onClick}
		>
			{isOpen && <>{renderContent()}</>}
		</Collapse>
	);
}