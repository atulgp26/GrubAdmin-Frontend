"use client";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { GoBell } from "react-icons/go";
import { FiArrowUpRight } from "react-icons/fi";
import { FaRegCircleCheck } from "react-icons/fa6";
import { PiWarningFill } from "react-icons/pi";
import { AiTwotoneWarning } from "react-icons/ai";
import { RiAdminLine } from "react-icons/ri";
import Button from "../ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useImpersonation } from "@/context/ImpersonationContext";
import { notificationsService } from "@/api/services/notificationsService";

const mockNotifications = [
	{
		type: "success",
		title: "New client!",
		message:
			"MediCare Labs has been added. Assign boxes to activate their account.",
		time: "12:15 PM",
		date: "Today",
	},
	{
		type: "error",
		title: "Repair requests",
		message: "Client X has overdue repair requests.",
		time: "12:15 PM",
		date: "Today",
	},
	{
		type: "success",
		title: "Boxes added!",
		message: "50 boxes (Medical type 1) added to the inventory.",
		time: "12:15 PM",
		date: "Today",
	},
	{
		type: "warning",
		title: "New client!",
		message:
			"MediCare Labs has been added. Assign boxes to activate their account.",
		time: "12:15 PM",
		date: "Today",
	},
];

export default function Header({ onToggleSidebar, collapsed }) {
	const router = useRouter();
	const pathname = usePathname();
	const { isAuthenticated, isInitialized } = useAuth();
	const { isImpersonating, impersonation, stopImpersonation } = useImpersonation();
	const [isExiting, setIsExiting] = useState(false);
	const [active, setactive] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const dropdownRef = useRef(null);
	const buttonRef = useRef(null);
	const isNotificationPage = pathname === "/notifications";
	const [notifications, setNotifications] = useState([]);

	const getNotifications = async () => {
		const notificationsResponse =
			await notificationsService.getNotifications({
				minified: true,
			});

		if (notificationsResponse.data) {
			setNotifications(notificationsResponse.data.notifications);
		}
	};

	const handleDismiss = async (notificationId, e) => {
		e.stopPropagation();
		try {
			await notificationsService.markAsRead([notificationId]);
			setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
		} catch (error) {
			console.error("Failed to dismiss notification:", error);
		}
	};

	const processesNotifications = useMemo(
		() =>
			notifications.map((n) => ({
				id: n.id,
				type: n.type,
				goal: n.goal,
				title: n.title,
				message: n.description,
				time: (() => {
					const date = new Date(n.createdAt);
					const today = new Date();
					const isToday =
						date.getDate() === today.getDate() &&
						date.getMonth() === today.getMonth() &&
						date.getFullYear() === today.getFullYear();

					if (isToday) {
						return date.toLocaleTimeString("en-GB", {
							hour: "2-digit",
							minute: "2-digit",
						});
					}
					return date.toLocaleDateString("en-GB", {
						day: "2-digit",
						month: "short",
						year: "2-digit",
					});
				})(),
			})),
		[notifications],
	);

	useEffect(() => {
		if (isInitialized && !isAuthenticated && !isImpersonating) {
			router.push("/login");
		}
	}, [isAuthenticated, isInitialized, router, isImpersonating]);

	useEffect(() => {
		if (isAuthenticated) {
			getNotifications();
		}
	}, [isAuthenticated]);

	useEffect(() => {
		function handleClickOutside(event) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target) &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target)
			) {
				setShowDropdown(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		if (pathname === "/notifications") {
			setShowDropdown(false);
		}
	}, [pathname]);

	const cleanMessage = (msg) =>
		msg
			.replace(/\.?\s*View Details\s*/g, "")
			.replace(/[0-9A-Za-z]{24,}/g, "")
			.replace(/\(\s*\)/g, "")
			.replace(/\s+/g, " ")
			.trim();

	const renderMessage = (message) => {
		if (typeof message !== "string") return message;
		return cleanMessage(message);
	};

	return (
		<>
			{isImpersonating && impersonation && (
				<div className="bg-[var(--notif-warning)]/10 border-b border-[var(--notif-warning)]/30 px-6 py-2 flex items-center justify-between">
					<div className="flex items-center gap-2 text-sm">
						<RiAdminLine className="w-4 h-4 text-[var(--notif-warning)]" />
						<span className="text-[var(--color-neutral-secondary)]">
							<strong>Impersonating:</strong>{" "}
							{impersonation.clientName}
							{impersonation.clientEmail && (
								<span className="text-[var(--color-stroke-brand)]">
									{" "}
									({impersonation.clientEmail})
								</span>
							)}
						</span>
					</div>
					<button
						onClick={async () => {
							if (isExiting) return;
							setIsExiting(true);
							try {
								const { customerService } = await import("@/api/services/customerService");
								await customerService.exitImpersonation();
							} catch (_) {}
							stopImpersonation();
							router.push("/clients");
						}}
						disabled={isExiting}
						className="text-sm font-medium text-[var(--color-brand-default)] hover:underline flex items-center gap-1 disabled:opacity-50"
					>
						{isExiting ? "Exiting..." : "Exit Account Access"}
					</button>
				</div>
			)}
<header className="sticky top-0 z-50 bg-white border-b border-[var(--color-stroke-neutral)] pl-3 pr-6 py-3">				<div className="flex items-center justify-between">
					<div className="flex items-center">
						<button
							onClick={onToggleSidebar}
							className="flex items-center leading-none space-x-2 text-[var(--color-stroke-brand)] hover:text-[var(--notif-border)] hover:bg-[var(--color-neutral-secondary-bg)] hover:underline transition-colors px-3 py-2 rounded-lg active:bg-[var(--color-stroke-neutral)] active:underline active:shadow-[0_0_0_2px_rgba(121,134,126,0.40)]"
						>
							<Icon name="menu" className="w-4 h-4" />
							<span className="text-sm font-medium pt-1">
								{collapsed ? "EXPAND" : "COLLAPSE"}
							</span>
						</button>
					</div>

					<div className="flex items-center relative">
						<button
							ref={buttonRef}
							className={`p-2  ${
								isNotificationPage
									? "!text-[var(--color-filter-text)] shadow-[0px_0px_0px_2px_var(--color-shadow-select)] !border !border-[var(--color-filter-text)] bg-[var(--sidebar-active-bg)]"
									: "border border-[var(--color-stroke-brand)] text-[var(--color-stroke-brand)] hover:bg-[var(--sidebar-active-bg)] hover:border-[var(--color-filter-text)] hover:text-[var(--color-filter-text)]"
							} transition-colors rounded-lg ${showDropdown ? "!border-[var(--color-filter-text)] bg-[var(--sidebar-active-bg)] text-[var(--color-filter-text)] shadow-[0_0_0_2px_var(--color-shadow-select)]" : ""}`}
							onClick={() => setShowDropdown(!showDropdown)}
						>
							<GoBell
								className={`w-5 h-5 ${showDropdown ? " text-[var(--color-filter-text)]" : ""}`}
							/>
						</button>
						{showDropdown && (
							<div
								ref={dropdownRef}
								className="absolute right-0 top-7 mt-4 w-96 bg-white rounded-lg border border-[var(--color-stroke-neutral)] shadow-[4px_4px_8px_0px_var(--color-notif-shadow-soft),0px_0px_4px_0px_var(--color-notif-shadow-strong)] z-50 transition-all duration-200"
							>
								<div className="flex items-center justify-end px-6 border-b border-[var(--color-stroke-neutral)] py-3">
									<Link
										href="/notifications"
										className="!text-base text-[var(--color-stroke-brand)] font-medium flex items-center gap-1 hover:underline"
									>
										<Button
											variant="skip"
											className="btn-size-md-cancel"
										>
											VIEW ALL{" "}
											<FiArrowUpRight className="inline-block ml-1 w-5 h-5" />
										</Button>
									</Link>
								</div>
								<div className="max-h-[37rem] overflow-y-auto scrollbar-hide divide-y divide-[var(--color-stroke-neutral)] pb-4">
									{processesNotifications.map((n, i) => (
										<div
											key={i}
											className="flex flex-col items-start gap-3 p-6 bg-white hover:bg-[var(--color-neutral-secondary-bg)] transition"
										>
											<div className="flex gap-3 items-end mt-1">
												{n.type === "warning" && (
													<span className="inline-flex items-center justify-center w-8 h-8">
														<PiWarningFill
															className="h-8 w-8"
															style={{ color: "var(--notif-warning)" }}
														/>
													</span>
												)}
												{n.type === "error" && (
													<span className="inline-flex items-center justify-center w-8 h-8">
														<PiWarningFill
															className="h-8 w-8"
															style={{ color: "var(--notif-error)" }}
														/>
													</span>
												)}
												{n.type === "success" && (
													<span className="inline-flex items-center justify-center w-8 h-8">
														<FaRegCircleCheck
															className="w-8 h-8"
															style={{ color: "var(--notif-success)" }}
														/>
													</span>
												)}
												{n.type === "yellow_warning" && (
													<span className="inline-flex items-center justify-center w-8 h-8">
														<Icon name="icon_alert" className="w-8 h-8" />
													</span>
												)}
												{!["warning", "error", "success", "yellow_warning"].includes(n.type) && (
													<span className="inline-flex items-center justify-center w-8 h-8">
														<Icon name="icon_alert" className="w-8 h-8" />
													</span>
												)}
												<div
													className={`font-semibold text-base text-[var(--color-neutral-secondary)] ${i === 3 ? "text-[var(--color-stroke-brand)]" : ""}`}
												>
													{n.title}
												</div>
											</div>
											<div className="flex-1 w-full">
												<div className="text-sm text-[var(--color-neutral-secondary)] mb-3">
													{renderMessage(n.message)}
												</div>
												<div className="flex items-center justify-between text-sm text-[var(--color-stroke-brand)]">
													<span>{n.time}</span>
													<button
														onClick={(e) => handleDismiss(n.id, e)}
														className="text-sm font-semibold hover:underline uppercase tracking-wide"
														style={{ color: '#FE480B' }}
													>
														DISMISS
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</header>
		</>
	);
}