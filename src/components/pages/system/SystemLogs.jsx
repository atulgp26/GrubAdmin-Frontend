"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MdCalendarToday } from "react-icons/md";
import { MdOutlineDone } from "react-icons/md";
import SearchWithSuggestions from "@/components/ui/SearchWithSuggestions";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import SystemLogsFilterModal from "./SystemLogsFilterModal";
import {
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
} from "@/components/ui/Table";
import {
	DEBOUNCE_TIME,
	DEFAULT_PAGE_SIZE,
} from "@/constants/config";
import { logsService } from "@/api/services/logsService";
import { useAuth } from "@/context/AuthContext";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import { showError } from "@/components/ui/toast";

const categoryOptions = [
	{ id: "Profile", label: "Profile" },
	{ id: "Employee", label: "Employee" },
	{ id: "Restaurant", label: "Restaurant" },
	{ id: "GrubPac", label: "GrubPac" },
	{ id: "GrubLock", label: "GrubLock" },
];

const normalizeLabel = (value = "") =>
	String(value).replace(/_/g, " ").replace(/-/g, " ");

const formatModuleLabel = (module) => {
	const safeModule = String(module || "");
	if (!safeModule) return "Unknown";

	return `${safeModule.charAt(0).toUpperCase()}${safeModule.slice(1)}`;
};

const SystemLogItem = ({ log }) => (
	<TableRow>
		<TableCell className="p-4 align-top whitespace-nowrap font-semibold text-[var(--color-neutral-secondary)]">
			{log.timestamp}
		</TableCell>
		<TableCell className="p-4 align-top">
			<div className="flex gap-4">
				{log.icon}
				<div className="flex flex-col gap-1">
					<div className="font-medium text-[var(--color-neutral-secondary)]">
						{log.type}
					</div>
					<div className="text-[var(--color-stroke-brand)] text-sm">
						({log.subtype})
					</div>
				</div>
			</div>
		</TableCell>
		<TableCell className="p-4 align-top">
			<p className="text-[var(--color-neutral-secondary)] whitespace-normal break-all max-w-full overflow-hidden">
				{log.action}
			</p>
		</TableCell>
	</TableRow>
);

export default function SystemLogs() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();

	const [search, setSearch] = useState("");
	const [selectedCategories, setSelectedCategories] = useState([]);
	const [systemLogs, setSystemLogs] = useState([]);
	const [dateRange, setDateRange] = useState("");
	const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
	const [advancedFilters, setAdvancedFilters] = useState({});
	const [currentPage, setCurrentPage] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [isLoadingLogs, setIsLoadingLogs] = useState(false);
	const pageSize = DEFAULT_PAGE_SIZE;

	const [debouncedSearchValue] = useDebounce(search, DEBOUNCE_TIME);
	const onDebouncedSearchValueChange = useDebouncedCallback(() => {
		setCurrentPage(1);
	}, DEBOUNCE_TIME);

	const onSearchChange = (e) => {
		setSearch(e.target.value);
		onDebouncedSearchValueChange();
	};

	const getLogs = useCallback(async () => {
		if (!isAuthenticated || authLoading) return;
		setIsLoadingLogs(true);
		try {
			const params = {};

			if (selectedCategories.length > 0) {
				params.category = selectedCategories;
			}

			if (debouncedSearchValue) {
				params.search = debouncedSearchValue;
			}

			for (const key of Object.keys(advancedFilters)) {
				const val = advancedFilters[key];
				if (Array.isArray(val) && val.length > 0) {
					params[key] = val;
				}
			}

			params.page_number = currentPage;
			params.page_size = pageSize;

			const logsResponse = await logsService.getLogs(params);

			if (logsResponse?.data) {
				setSystemLogs(logsResponse.data.logs || []);
				setTotalItems(logsResponse.data.count || 0);
			}
		} catch (error) {
			console.error("Failed to fetch logs:", error);
			showError("Failed to load system logs.");
		} finally {
			setIsLoadingLogs(false);
		}
	}, [isAuthenticated, authLoading, selectedCategories, debouncedSearchValue, advancedFilters, currentPage, pageSize]);

	const formattedLogs = useMemo(
		() =>
			systemLogs.map((systemLog) => {
				const category = String(systemLog.category || systemLog.module || "unknown");
				const action = String(
					systemLog.metadata?.action || systemLog.action || systemLog.type || "",
				);
				const moduleName = formatModuleLabel(category);
				const subtype = normalizeLabel(
					String(systemLog.type || action || "unknown"),
				);
				const message = normalizeLabel(
					String(systemLog.description || "") ||
					`${moduleName} ${subtype}`,
				);
				const logTimestamp = systemLog.createdAt || systemLog.updatedAt;

				return {
					id: systemLog.id,
					timestamp: new Date(logTimestamp).toLocaleDateString(
						"en-GB",
						{
							day: "2-digit",
							month: "short",
							year: "2-digit",
							hour: "2-digit",
							minute: "2-digit",
							second: "2-digit",
						},
					),
					type: moduleName,
					subtype,
					action: message,
					category,
					icon: (
						<MdOutlineDone className="w-6 h-6 text-[var(--color-neutral-light)]" />
					),
				};
			}),
		[systemLogs],
	);

	const handleExport = useCallback(() => {
		if (systemLogs.length === 0) {
			showError("No logs to export.");
			return;
		}

		const headers = ["Timestamp", "Category", "Type", "Action"];
		const csvContent = [
			headers.join(","),
			...formattedLogs.map((log) =>
				[
					`"${log.timestamp}"`,
					`"${log.type}"`,
					`"${log.subtype}"`,
					`"${log.action.replace(/"/g, '""')}"`,
				].join(","),
			),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", `system_logs_${new Date().toISOString().split("T")[0]}.csv`);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}, [systemLogs, formattedLogs]);

	const visibleLogs = useMemo(() => {
		const query = search.trim().toLowerCase();
		return formattedLogs.filter((log) => {
			const matchesCategory =
				selectedCategories.length === 0 ||
				selectedCategories.includes(log.category);
			if (!query) return matchesCategory;
			return (
				matchesCategory &&
				(log.action.toLowerCase().includes(query) ||
					log.type.toLowerCase().includes(query) ||
					log.subtype.toLowerCase().includes(query))
			);
		});
	}, [search, selectedCategories, formattedLogs]);

	const suggestions = useMemo(
		() =>
			formattedLogs.map((log) => ({
				id: log.id,
				name: `${log.type} ${log.subtype}`,
				code: log.action,
			})),
		[formattedLogs],
	);

	const handleSuggestionSelect = (suggestion) => {
		setSearch(suggestion.name);
	};

	const handleSearchClear = () => setSearch("");

	const totalEntriesText = useMemo(
		() => `${totalItems} entries`,
		[totalItems],
	);
	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(totalItems / pageSize)),
		[totalItems],
	);

	useEffect(() => {
		getLogs();
	}, [getLogs]);

	useEffect(() => {
		if (currentPage > totalPages && totalPages > 0) {
			setCurrentPage(totalPages);
		}
	}, [totalPages, currentPage]);

	return (
		<div className="flex flex-col gap-6  w-full">
			<div className="flex flex-wrap justify-between items-center gap-4">
				<h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)] leading-none">
					System logs
				</h1>
				<Button
					variant="text"
					size="md"
					className="!px-0 uppercase tracking-[0.08em]"
					onClick={handleExport}
				>
					EXPORT
				</Button>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-4">
				<SearchWithSuggestions
					data={suggestions}
					value={search}
					onChange={onSearchChange}
					onSelect={handleSuggestionSelect}
					onClear={handleSearchClear}
					placeholder="Search log"
					clearable
					className="!w-64 [&_input]:!h-8 [&_input]:!py-1"
					getLabel={(item) => item.name}
					getSubLabel={(item) => item.code}
					openOnFocus={false}
					minChars={1}
				/>
				<div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-neutral-secondary)]">
					<span className="whitespace-nowrap text-[var(--color-stroke-brand)] text-sm">
						{totalEntriesText}
					</span>
					<div className="relative">
						<Input
							type="text"
							placeholder="Date range"
							value={dateRange}
							onChange={(e) => setDateRange(e.target.value)}
							className="pr-10 !w-44 !h-8 !rounded-lg border border-[var(--color-stroke-neutral)] text-[var(--color-neutral-secondary)]"
						/>
						<MdCalendarToday className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF5A3C]" />
					</div>
					<MultiSelectDropdown
						options={categoryOptions}
						selected={selectedCategories}
						setSelected={setSelectedCategories}
						placeholder="All categories"
						className="min-w-[160px]"
						padding="!py-1.5 !px-3"
						fontsize="text-sm"
					/>

					<Button
						variant="grayOutline"
						size="md"
						className="h-8 flex items-center px-3 rounded-lg"
						onClick={() => setShowAdvancedFilter(true)}
					>
						ADVANCED FILTER
					</Button>
				</div>
			</div>

			<Pagination
				className="rounded-[6px]"
				currentPage={currentPage}
				pageSize={pageSize}
				totalItems={totalItems}
				onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
				onNext={() =>
					setCurrentPage((prev) => Math.min(totalPages, prev + 1))
				}
			/>

			<div className="flex-grow">
				<div>
					<Table className="w-full">
						<TableHead>
							<TableRow>
								<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
									Time stamp
								</TableCell>
								<TableCell className="p-4 pl-18 !text-sm font-medium text-[var(--color-stroke-brand)]">
									Type
								</TableCell>
								<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
									Action
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{visibleLogs.map((log) => (
								<SystemLogItem key={log.id} log={log} />
							))}
						</TableBody>
					</Table>
					{isLoadingLogs && (
						<div className="text-center text-[var(--color-neutral-light)] py-8">
							Loading logs...
						</div>
					)}
					{!isLoadingLogs && visibleLogs.length === 0 && (
						<div className="text-center text-[var(--color-neutral-light)] py-8">
							No system logs found for your filters.
						</div>
					)}
				</div>
			</div>
			<SystemLogsFilterModal
				open={showAdvancedFilter}
				onClose={() => setShowAdvancedFilter(false)}
				selectedFilters={advancedFilters}
				onChange={setAdvancedFilters}
				onApply={() => setShowAdvancedFilter(false)}
			/>
		</div>
	);
}
