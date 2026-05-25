import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { IoCheckmark } from "react-icons/io5";

const FILTER_GROUPS = [
    {
        id: "Employee",
        uniqueKey: "Employee",
        title: "Employees - List",
        options: [
            { id: "Creation", label: "Creation" },
            { id: "Updation", label: "Updation" },
            { id: "Deletion", label: "Deletion" },
            { id: "Suspension", label: "Suspension" },
            { id: "Activation", label: "Activation" },
        ],
    },
    {
        id: "Profile",
        uniqueKey: "Profile",
        title: "Employee - Roles",
        options: [
            { id: "Creation", label: "Creation" },
            { id: "Updation", label: "Updation" },
            { id: "Deletion", label: "Deletion" },
        ],
    },
    {
        id: "Restaurant",
        uniqueKey: "Restaurant_list",
        title: "Clients - List",
        options: [
            { id: "Creation", label: "Creation" },
            { id: "Updation", label: "Updation" },
        ],
    },
    {
        id: "Restaurant",
        uniqueKey: "Restaurant_platform",
        title: "Clients - Platform action",
        options: [
            { id: "Access", label: "Viewing" },
            { id: "Suspension", label: "Suspension" },
            { id: "Ownership", label: "Transferring" },
            { id: "Creation", label: "Creation" },
            { id: "Activation", label: "Activation" },
            { id: "Updation", label: "Updation" },
            { id: "Deletion", label: "Deletion" },
        ],
    },
    {
        id: "GrubLock",
        uniqueKey: "GrubLock_categories",
        title: "Support - Categories",
        options: [
            { id: "Creation", label: "Creation" },
            { id: "Updation", label: "Updation" },
            { id: "Deletion", label: "Deletion" },
            { id: "Suspension", label: "Suspension" },
            { id: "Activation", label: "Activation" },
        ],
    },
    {
        id: "GrubLock",
        uniqueKey: "GrubLock_faq",
        title: "Support - FAQs",
        options: [
            { id: "Creation", label: "Creation" },
            { id: "Updation", label: "Updation" },
            { id: "Deletion", label: "Deletion" },
        ],
    },
    {
        id: "GrubPac",
        uniqueKey: "GrubPac",
        title: "GrubPac",
        options: [
            { id: "Reassignment", label: "Assignment" },
            { id: "Creation", label: "Creation" },
            { id: "Deletion", label: "Deletion" },
            { id: "Suspension", label: "Suspension" },
            { id: "Activation", label: "Activation" },
        ],
    },
];
const ToggleCheckbox = ({ checked }) => (
	<div
		className={`w-5 h-5 border rounded flex items-center justify-center ${checked
				? "bg-[var(--color-checkbox-bg)] border-[var(--color-checkbox-bg)]"
				: "border-[var(--color-checkbox-bg)] bg-white"
			}`}
	>
		{checked && (
			<svg
				className="w-3.5 h-3.5 text-white"
				fill="none"
				viewBox="0 0 20 20"
				stroke="currentColor"
				strokeWidth="2.5"
			>
				<path
					d="M5 10.5L9 14L15 7"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		)}
	</div>
);

export default function SystemLogsFilterModal({
	open,
	onClose,
	selectedFilters = {},
	onChange,
	onApply,
}) {
	const isChecked = (groupId, optionId) =>
		selectedFilters[groupId]?.includes(optionId);

	const toggleOption = (groupId, optionId) => {
		const currentGroup = selectedFilters[groupId] || [];
		const nextGroup = currentGroup.includes(optionId)
			? currentGroup.filter((id) => id !== optionId)
			: [...currentGroup, optionId];
		onChange?.({
			...selectedFilters,
			[groupId]: nextGroup,
		});
	};

	return (
		<Modal
			open={open}
			onClose={onClose}
			width="max-w-2xl"
			positionClass="justify-end items-start"
			customClass="pt-24 pr-6"
			noXPadding
		>
			<div className="bg-white rounded-lg overflow-hidden flex flex-col h-full max-h-[70vh]">
				<div className="overflow-y-auto flex-1">
					{FILTER_GROUPS.map((group, index) => (
						<div
							key={group.id}
							className={`px-6 py-4 space-y-4 ${index !== FILTER_GROUPS.length - 1
									? "border-b border-[var(--color-stroke-neutral)]"
									: ""
								}`}
						>
							<div className="text-sm font-medium text-[var(--color-neutral-secondary)]">
								{group.title}
							</div>
							<div className="grid grid-cols-3 gap-y-4 gap-x-6">
								{group.options.map((opt) => (
									<button
										type="button"
										key={opt.id}
										onClick={() =>
											toggleOption(group.id, opt.id)
										}
										className="flex items-center gap-3 text-sm text-[var(--color-neutral-secondary)]"
									>
										<ToggleCheckbox
											checked={isChecked(
												group.id,
												opt.id,
											)}
										/>
										{opt.label}
									</button>
								))}
							</div>
						</div>
					))}
				</div>
				<div className="flex justify-between items-center px-6 py-4 border-t border-[var(--color-stroke-neutral)] bg-white sticky bottom-0">
					<Button
						variant="text"
						className="text-[var(--color-stroke-brand)] font-medium !px-0"
						onClick={onClose}
					>
						CANCEL
					</Button>
					<Button
						variant="secondary"
						className="flex items-center gap-2 px-8 py-2 rounded-lg"
						onClick={onApply}
					>
						<IoCheckmark className="w-5 h-5" />
						FILTER LOGS
					</Button>
				</div>
			</div>
		</Modal>
	);
}
