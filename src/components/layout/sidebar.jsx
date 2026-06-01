"use client";

import { usePathname } from "next/navigation";
import NavItem from "./NavItem";
import Icon from "@/components/ui/Icon";
import { NAV_ITEMS, CLIENT_NAV_ITEMS } from "./constants";
import Image from "next/image";
import Link from "next/link";
import ProfileMenu from "@/components/layout/ProfileMenu";
import { useProfileData } from "@/hooks/useProfileData";
import React from "react";
import LoadingDetails from "@/components/ui/LoadingDetails";
import { usePermissions } from "@/context/PermissionContext";
import { useImpersonation } from "@/context/ImpersonationContext";

export default function Sidebar({ collapsed, onClose }) {
	const pathname = usePathname();
	const { userData } = useProfileData();
	const { can, loading } = usePermissions();
	const { isImpersonating, impersonation } = useImpersonation();

	const visibleNavItems = React.useMemo(() => {
		if (isImpersonating) {
			return CLIENT_NAV_ITEMS;
		}

		if (loading) {
			return NAV_ITEMS;
		}

		const checks = {
			dashboard:
				can("view dashboard", "dashboard") || can("view dashboard"),

			employees:
				can("view active employees", "employees") ||
				can("view active employees"),

			clients:
				can("view clients list", "clients") ||
				can("view entries", "clients") ||
				can("view clients list") ||
				can("view entries"),

			grubpacs: true,

			support:
				can("view active resources", "support") ||
				can("view active resources"),

			system_logs: true,
		};

		return NAV_ITEMS.filter((item) => checks[item.id] !== false);
	}, [can, loading, isImpersonating]);

	return (
		<>
			{collapsed && (
				<div className="hidden md:block fixed top-0 left-0 h-full w-1 bg-[var(--color-brand-primary-btn)] z-50" />
			)}
			<div
				className={`fixed left-0 top-0 h-full border-r border-[var(--color-stroke-neutral)] transition-all duration-300 z-40 ${
					collapsed ? "-translate-x-full" : "translate-x-0"
				} w-60 hidden md:block`}
			>
				<div className="flex flex-col h-full">
					<div className="p-6">
						<Image
							src="/GrubPac_admin.svg"
							alt="GrubPac"
							width={124}
							height={15}
						/>
					</div>
					<nav className="flex-1 px-4">
						<div className="space-y-1">
							{visibleNavItems.map((item) => (
								<React.Fragment key={item.id}>
									{item.id === "support" && (
										<hr className="my-2 border-[var(--color-stroke-neutral)]" />
									)}
									<Link
										href={item.href}
										passHref
										legacyBehavior
									>
										<a>
											<NavItem
												icon={item.icon}
												label={item.label}
												isActive={pathname.startsWith(
													item.href,
												)}
											/>
										</a>
									</Link>
								</React.Fragment>
							))}
						</div>
					</nav>
					<div className="p-4 space-y-4">
						{isImpersonating && impersonation && (
							<div className="bg-[var(--notif-warning)]/10 rounded-lg p-3 space-y-1">
								<div className="text-xs font-semibold text-[var(--notif-warning)] uppercase tracking-wide">
									Client View
								</div>
								<div className="text-sm font-medium text-[var(--color-neutral-secondary)] truncate">
									{impersonation.clientName}
								</div>
								<div className="text-xs text-[var(--color-stroke-brand)] truncate">
									{impersonation.clientEmail || ""}
								</div>
							</div>
						)}
						<div className="space-y-4">
							<div className="text-[var(--color-stroke-brand)] text-sm font-medium">
								PRIVACY POLICY
							</div>
							<div className="text-[var(--color-stroke-brand)] text-sm font-medium">
								TERMS OF SERVICE
							</div>
						</div>
					</div>
					<div className="mt-auto flex flex-col items-center pb-6">
						<ProfileMenu />
					</div>
				</div>
			</div>
			{!collapsed && (
				<div
					className="fixed inset-0 bg-[var(--color-neutral-primary)] bg-opacity-50 z-30 md:hidden"
					onClick={onClose}
				/>
			)}
			<div
				className={`fixed left-0 top-0 h-full bg-[var(--color-neutral-secondary-bg)] transition-all duration-300 z-40 ${
					collapsed ? "-translate-x-full" : "translate-x-0"
				} w-64 md:hidden`}
			>
				<div className="flex flex-col h-full">
					<div className="flex items-center justify-between p-6 border-b border-[var(--color-stroke-neutral)]">
						<h1 className="text-2xl font-bold text-[var(--color-brand-default)]">
							GrubPac
						</h1>
						<button
							onClick={onClose}
							className="p-2 text-[var(--color-neutral-secondary)] hover:text-[var(--color-neutral-primary)] hover:bg-[var(--color-neutral-secondary-bg)] rounded-lg transition-colors"
						>
							<Icon name="close" className="w-5 h-5" />
						</button>
					</div>
					<nav className="flex-1 px-4 pt-4">
						<div className="space-y-1">
							{visibleNavItems.map((item) => (
								<React.Fragment key={item.id}>
									{item.id === "support" && (
										<hr className="my-2 border-[var(--color-stroke-neutral)]" />
									)}
									<Link
										href={item.href}
										passHref
										legacyBehavior
									>
										<a onClick={onClose}>
											<NavItem
												icon={item.icon}
												label={item.label}
												isActive={pathname.startsWith(
													item.href,
												)}
											/>
										</a>
									</Link>
								</React.Fragment>
							))}
						</div>
					</nav>

					<div className="p-4 space-y-4">
						<div className="space-y-2">
							<div className="text-[var(--color-neutral-secondary)] text-xs font-medium">
								PRIVACY POLICY
							</div>
							<div className="text-[var(--color-neutral-secondary)] text-xs font-medium">
								TERMS OF SERVICE
							</div>
						</div>
						<div className="border-t border-[var(--color-stroke-neutral)] pt-4">
							<div className="flex items-center space-x-3 p-2">
								<div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm">
									{userData.initials}
								</div>
								<span className="text-[var(--color-neutral-primary)] text-sm font-medium">
									{loading ? (
										<LoadingDetails
											entity="profile"
											variant="inline"
										/>
									) : (
										userData.name
									)}
								</span>
							</div>
						</div>
					</div>
					<div className="mt-auto flex flex-col items-center pb-6">
						<ProfileMenu />
					</div>
				</div>
			</div>
		</>
	);
}
