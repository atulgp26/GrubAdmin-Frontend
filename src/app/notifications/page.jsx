"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import NotificationFilterBar from "./NotificationFilterBar";
import NotificationList from "./NotificationList";
import NotificationFilterModal from "./NotificationFilterModal";
import { FiUserPlus, FiPackage, FiAlertTriangle, FiArchive, FiUsers, FiRefreshCw, FiBell, FiCheckCircle, FiInfo } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { notificationsService } from "@/api/services/notificationsService";
import { showSuccess, showError } from "@/components/ui/toast";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import { DEBOUNCE_TIME } from "@/constants/config";
import { formatNotificationTimeLabel } from "@/utils/formatDate";

export default function NotificationsPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState([]);
	const [filter, setFilter] = useState({
		severe: true,
		warning: true,
		success: true,
	});
	const [boxDropdownOpen, setBoxDropdownOpen] = useState(false);
	const [selectedBoxes, setSelectedBoxes] = useState([]);
	const [selectedGroups, setSelectedGroups] = useState([]);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [selectedDropdownTypes, setSelectedDropdownTypes] = useState([]);
	const [selectedTypes, setSelectedTypes] = useState([
		"error",
		"success",
		"warning",
	]);
	const [selectedStatuses, setSelectedStatuses] = useState([
		"read",
		"unread",
	]);
	const [notifications, setNotifications] = useState([]);

	const [debouncedSearchValue] = useDebounce(search, DEBOUNCE_TIME);
	const onDebouncedSearchValueChange = useDebouncedCallback(
		() => {},
		DEBOUNCE_TIME,
	);

	const onSearchChange = (e) => {
		setSearch(e.target.value);
		onDebouncedSearchValueChange();
	};

	const typeOptions = useMemo(() => {
		const unique = [
			...new Set(notifications.map((n) => n.item_type).filter(Boolean)),
		];
		return unique.map((type, i) => ({
			id: i + 1,
			label: type,
			value: type,
		}));
	}, [notifications]);

	const getNotifications = useCallback(async () => {
		const params = {};

		if (selectedTypes.length > 0) {
			params.type = selectedTypes;
		}

		if (selectedStatuses.length > 0) {
			params.status = selectedStatuses;
		}

		if (debouncedSearchValue) {
			params.query = debouncedSearchValue;
		}

		try {
			const notificationsResponse =
				await notificationsService.getNotifications(params);

			if (notificationsResponse?.data?.notifications) {
				setNotifications(notificationsResponse.data.notifications);
			}
		} catch (error) {
			console.error("Failed to fetch notifications:", error);
		}
	}, [selectedTypes, selectedStatuses, debouncedSearchValue]);

	const handleMarkAsRead = useCallback(async (ids) => {
		try {
			const response = await notificationsService.markAsRead(ids);
			if (response?.success) {
				setNotifications((prev) =>
					prev.map((n) =>
						ids.includes(n.id) ? { ...n, status: "read" } : n,
					),
				);
				setSelected([]);
				showSuccess("Marked as read", "", true);
			}
		} catch (error) {
			showError("Failed to mark notifications as read.");
		}
	}, []);

	const handleDismiss = useCallback(async (ids) => {
		setNotifications((prev) =>
			prev.filter((n) => !ids.includes(n.id)),
		);
		setSelected((prev) => prev.filter((id) => !ids.includes(id)));

		try {
			await notificationsService.markAsRead(ids);
		} catch (error) {
			console.error("Failed to sync dismiss:", error);
		}
	}, []);

	useEffect(() => {
		if (isAuthenticated && !authLoading) {
			getNotifications();
		}
	}, [isAuthenticated, authLoading, getNotifications]);

	const processedNotifications = useMemo(
		() =>
			notifications.map((n) => ({
				id: n.id,
				type: n.type,
				goal: n.goal,
				title: n.title,
				message: n.description,
				time: formatNotificationTimeLabel(n.createdAt),
				status: n.status,
				category: n.item_type || n.type,
				itemId: n.item_id,
			})),
		[notifications],
	);

	const filtered = useMemo(
		() =>
			processedNotifications.filter((n) => {
				if (n.type === "error" && !filter.severe) return false;
				if (n.type === "warning" && !filter.warning) return false;
				if (n.type === "success" && !filter.success) return false;
				if (
					search &&
					!n.title.toLowerCase().includes(search.toLowerCase()) &&
					!n.message.toLowerCase().includes(search.toLowerCase())
				)
					return false;

				if (
					selectedDropdownTypes.length > 0 &&
					!selectedDropdownTypes.some(
						(id) =>
							typeOptions.find((o) => o.id === id)?.value ===
							n.category,
					)
				)
					return false;
				return true;
			}),
		[processedNotifications, filter, search, selectedDropdownTypes, typeOptions],
	);

	const handleDismissAll = useCallback(async () => {
		const ids = filtered.map((n) => n.id);
		if (ids.length === 0) return;

		setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
		setSelected([]);

		try {
			await notificationsService.markAsRead(ids);
		} catch (error) {
			console.error("Failed to sync dismiss all:", error);
		}
	}, [filtered]);

	const allSelected = useMemo(
		() => selected.length === filtered.length && filtered.length > 0,
		[selected, filtered],
	);

	const notificationSuggestions = useMemo(
		() =>
			debouncedSearchValue
				? processedNotifications.filter((n) =>
						n.title.toLowerCase().includes(search.toLowerCase()),
					)
				: [],
		[debouncedSearchValue, processedNotifications, search],
	);

	const getNotificationIcon = (type, category) => {
		let iconColor;
		switch (type) {
			case "error":
				iconColor = "var(--notif-error)";
				break;
			case "warning":
				iconColor = "var(--notif-warning)";
				break;
			case "success":
				iconColor = "var(--notif-success)";
				break;
			case "info":
				iconColor = "var(--color-brand-default)";
				break;
			default:
				iconColor = "var(--notif-warning)";
		}

		const cat = (category || "").toLowerCase();
		let Icon;
		if (cat.includes("client") || cat.includes("customer")) {
			Icon = FiUserPlus;
		} else if (
			cat.includes("box") ||
			cat.includes("grubpac") ||
			cat.includes("package")
		) {
			Icon = FiPackage;
		} else if (
			cat.includes("repair") ||
			cat.includes("service") ||
			cat.includes("ticket")
		) {
			Icon = FiAlertTriangle;
		} else if (cat.includes("inventory") || cat.includes("stock")) {
			Icon = FiArchive;
		} else if (cat.includes("employee") || cat.includes("admin")) {
			Icon = FiUsers;
		} else if (cat.includes("update") || cat.includes("release")) {
			Icon = FiRefreshCw;
		} else {
			switch (type) {
				case "error":
				case "warning":
					Icon = FiAlertTriangle;
					break;
				case "success":
					Icon = FiCheckCircle;
					break;
				case "info":
					Icon = FiInfo;
					break;
				default:
					Icon = FiBell;
			}
		}

		return <Icon className="h-8 w-8" style={{ color: iconColor }} />;
	};

	
		return (
  <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
    <div className="flex items-center justify-between mb-6 !pl-3 flex-shrink-0">
				<h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
					Notifications
				</h1>
				{filtered.length > 0 && (
					<button
						onClick={handleDismissAll}
						className="text-sm font-semibold text-[var(--color-brand-default)] hover:underline cursor-pointer"
					>
						DISMISS ALL
					</button>
				)}
			</div>
			<div className="flex-shrink-0">
			<NotificationFilterBar
				search={search}
				setSearch={onSearchChange}
				boxDropdownOpen={boxDropdownOpen}
				setBoxDropdownOpen={setBoxDropdownOpen}
				setSelectedBoxes={setSelectedBoxes}
				groupOptions={[]}
				selectedGroups={selectedGroups}
				setSelectedGroups={setSelectedGroups}
				filter={filter}
				setFilter={setFilter}
				Icon={Icon}
				notificationSuggestions={notificationSuggestions}
				setShowFilterModal={setShowFilterModal}
				isFilterModalOpen={showFilterModal}
				onSearchSelect={setSearch}
				typeOptions={typeOptions}
				selectedTypes={selectedDropdownTypes}
				setSelectedTypes={setSelectedDropdownTypes}
			/>
			</div>
			<NotificationFilterModal
				open={showFilterModal}
				onClose={() => setShowFilterModal(false)}
				selectedTypes={selectedTypes}
				setSelectedTypes={setSelectedTypes}
				selectedStatuses={selectedStatuses}
				setSelectedStatuses={setSelectedStatuses}
				onFilter={() => setShowFilterModal(false)}
			/>
			<div className="flex-1 overflow-y-auto min-h-0">
			<NotificationList
				filtered={filtered}
				selected={selected}
				setSelected={setSelected}
				getNotificationIcon={getNotificationIcon}
				allSelected={allSelected}
				onMarkAsRead={handleMarkAsRead}
				onDismiss={handleDismiss}
		/>
  </div>
</div>
);
}
