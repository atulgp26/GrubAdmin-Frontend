"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import NotificationFilterBar from "./NotificationFilterBar";
import NotificationList from "./NotificationList";
import NotificationFilterModal from "./NotificationFilterModal";
import { PiWarningFill } from "react-icons/pi";
import { FaRegCircleCheck } from "react-icons/fa6";
import { MdWarningAmber } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { notificationsService } from "@/api/services/notificationsService";
import { showSuccess, showError } from "@/components/ui/toast";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import { DEBOUNCE_TIME } from "@/constants/config";

export default function NotificationsPage() {
	const router = useRouter();
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
		() => { },
		DEBOUNCE_TIME,
	);

	const onSearchChange = (e) => {
		setSearch(e.target.value);
		onDebouncedSearchValueChange();
	};

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
		try {
			const response = await notificationsService.dismiss(ids);
			if (response?.success) {
				setNotifications((prev) =>
					prev.filter((n) => !ids.includes(n.id)),
				);
				setSelected((prev) => prev.filter((id) => !ids.includes(id)));
				showSuccess("Notifications dismissed", "", true);
			}
		} catch (error) {
			showError("Failed to dismiss notifications.");
		}
	}, []);

	const handleDismissAll = useCallback(async () => {
		try {
			const response = await notificationsService.dismissAll();
			if (response?.success) {
				setNotifications([]);
				setSelected([]);
				showSuccess("All notifications dismissed", "", true);
			}
		} catch (error) {
			showError("Failed to dismiss all notifications.");
		}
	}, []);

	useEffect(() => {
		if (isAuthenticated && !authLoading) {
			getNotifications();
		}
	}, [isAuthenticated, authLoading, getNotifications]);

	const processedNotifications = useMemo(
		() =>
			notifications.map((n) => {
				const date = new Date(n.createdAt);
				const now = new Date();
				const isToday = date.toDateString() === now.toDateString();
				const yesterday = new Date(now);
				yesterday.setDate(yesterday.getDate() - 1);
				const isYesterday = date.toDateString() === yesterday.toDateString();

				const timeStr = date.toLocaleTimeString("en-US", {
					hour: "numeric",
					minute: "2-digit",
					hour12: true,
				});

				let dayStr;
				if (isToday) {
					dayStr = "Today";
				} else if (isYesterday) {
					dayStr = "Yesterday";
				} else {
					dayStr = date.toLocaleDateString("en-GB", {
						day: "2-digit",
						month: "short",
						year: "numeric",
					});
				}

				return {
					id: n.id,
					type: n.type,
					goal: n.goal,
					title: n.title,
					message: n.description,
					time: `${timeStr} | ${dayStr}`,
					status: n.status,
					category: n.item_type || n.type,
					itemId: n.item_id,
				};
			}),
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
				return true;
			}),
		[processedNotifications, filter, search],
	);

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

	const getNotificationIcon = (type) => {
		switch (type) {
			case "warning":
				return (
					<PiWarningFill
						className="h-8 w-8"
						style={{ color: "var(--notif-warning)" }}
					/>
				);
			case "error":
				return (
					<PiWarningFill
						className="h-8 w-8"
						style={{ color: "var(--notif-error)" }}
					/>
				);
			case "success":
				return (
					<FaRegCircleCheck
						className="h-8 w-8"
						style={{ color: "var(--notif-success)" }}
					/>
				);
			case "info":
				return <Icon name="info" />;
			default:
				return (
					<MdWarningAmber
						className="h-8 w-8"
						style={{ color: "var(--notif-warning)" }}
					/>
				);
		}
	};

	return (
		<>
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl !pl-3 font-semibold text-[var(--color-neutral-primary)]">
					Notifications
				</h1>
				<button
					onClick={handleDismissAll}
					className="text-sm font-semibold text-[var(--color-brand-default)] hover:underline cursor-pointer"
				>
					DISMISS ALL
				</button>
			</div>
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
			/>
			<NotificationFilterModal
				open={showFilterModal}
				onClose={() => setShowFilterModal(false)}
				selectedTypes={selectedTypes}
				setSelectedTypes={setSelectedTypes}
				selectedStatuses={selectedStatuses}
				setSelectedStatuses={setSelectedStatuses}
				onFilter={() => setShowFilterModal(false)}
			/>
			<NotificationList
				filtered={filtered}
				selected={selected}
				setSelected={setSelected}
				getNotificationIcon={getNotificationIcon}
				allSelected={allSelected}
				onMarkAsRead={handleMarkAsRead}
				onDismiss={handleDismiss}
			/>
		</>
	);
}
