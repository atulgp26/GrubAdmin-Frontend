"use client";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import SearchWithSuggestions from "@/components/ui/SearchWithSuggestions";
import { FiFilter } from "react-icons/fi";
import { useState } from "react";
import FilterButton from "@/components/ui/FilterButton";

export default function NotificationFilterBar({
	search,
	setSearch,
	onSearchSelect,
	filteredBoxes,
	selectedBoxes,
	setSelectedBoxes,
	filter,
	setFilter,
	Icon: IconProp,
	notificationSuggestions = [],
	groupOptions = [],
	selectedGroups = [],
	setSelectedGroups = () => {},
	setShowFilterModal,
	isFilterModalOpen,
	typeOptions = [],
	selectedTypes = [],
	setSelectedTypes = () => {},
}) {
	// const [selectedTypes, setSelectedTypes] = useState([]);

	

	return (
		<div className="flex items-center !pl-3 justify-between gap-4 mb-6">
			{/* Search Input */}
			<div className="flex">
				<div className="relative max-w-xs h-8 w-full">
					<SearchWithSuggestions
						value={search}
						onChange={setSearch}
						onSelect={(item) => onSearchSelect(item.title)}
						data={notificationSuggestions}
						getLabel={(n) => n.title}
						getSubLabel={(n) => n.category}
						placeholder="Search notification"
						clearable={true}
						onClear={() => onSearchSelect("")}
					/>
				</div>
			</div>

			{/* Right: Select Type + Filter Button */}
			<div className="flex items-center gap-4">
				{/* Select Type Dropdown */}
				<div className="w-[200px]">
					<MultiSelectDropdown
						options={typeOptions}
						selected={selectedTypes}
						setSelected={setSelectedTypes}
						placeholder="Select type"
						placeholderColor="!text-[var(--color-neutral-light)]"
						notificationIcon={true}
					/>
				</div>
				<div>
					<FilterButton
						open={isFilterModalOpen}
						handleFilterClick={() => setShowFilterModal(true)}
					/>
				</div>
			</div>
		</div>
	);
}
