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
}) {
	useEffect(() => {
		if (!isOpen) {
			onClose();
		} else {
			onOpen();
		}
	}, [isOpen]);

	return (
		<Collapse
			title={groupName}
			open={isOpen}
			pagination={pagination}
			onClick={onClick}
		>
			{isOpen && (
				<>
					{data.length > 0 ? (
						renderTable(data)
					) : (
						<div className="bg-white border-b">
							<div className="my-2 px-2 py-2 flex items-center">
								<div className="font-normal text-base text-[var(--color-stroke-brand)] pl-8">
									{emptyResult}
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</Collapse>
	);
}
