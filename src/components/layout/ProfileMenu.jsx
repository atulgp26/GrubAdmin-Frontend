import { useState, useRef, useEffect } from "react";
import { AiOutlineWarning } from "react-icons/ai";
import { FiLogOut, FiChevronDown } from "react-icons/fi";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import LogoutModal from "./LogoutModal";
import Icon from "../ui/Icon";
import { showSuccess, showError } from "@/components/ui/toast";
import Button from "../ui/Button";
import { CiLogout } from "react-icons/ci";
import { RxCrossCircled } from "react-icons/rx";
import { RiLoopRightFill } from "react-icons/ri";
import { LuWallet } from "react-icons/lu";
import { IoIosWarning } from "react-icons/io";
import { useProfileData } from "@/hooks/useProfileData";
import { useAuth } from "@/context/AuthContext";
import LoadingDetails from "@/components/ui/LoadingDetails";

export default function ProfileMenu() {
	const [open, setOpen] = useState(false);
	const ref = useRef();
	const [logoutOpen, setLogoutOpen] = useState(false);
	const { userData, loading } = useProfileData();
	const { logout: authLogout } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	const menuItems = [
		{
			label: "Account settings",
			icon: (
				<div className="w-6 h-6 rounded-full bg-orange-500  text-white flex items-center justify-center text-white font-semibold text-xs">
					{userData.initials}
				</div>
			),
			highlight: true,
		},
		{
			label: "Alert preferences",
			icon: (
				<IoIosWarning className="w-6 h-6 text-[var(--color-neutral-light)] group-hover:text-[var(--info-panel-view-bg)] group-active:text-[var(--color-filter-text)]" />
			),
		},
		{
			label: "Log out",
			icon: (
				<Icon
					strokeWidth={2}
					name="logout"
					className=" text-[var(--color-neutral-light)] group-hover:text-[var(--info-panel-view-bg)] group-active:text-[var(--color-filter-text)]"
				/>
			),
		},
	];

	useEffect(() => {
		function handleClick(e) {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		}
		if (open) document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [open]);

	// Close dropdown when navigating to account page
	useEffect(() => {
		if (pathname === "/account") {
			setOpen(false);
		}
	}, [pathname]);

	const handleLogout = async () => {
		await authLogout();
		localStorage.removeItem("hasShownPasswordModal");
		showSuccess("Logged out successfully!", "", true);
		setLogoutOpen(false);
		router.push("/login");
	};

	return (
		<div className="relative flex flex-col items-center" ref={ref}>
			<button
				className={`flex group items-center gap-3 border-2 hover:border-[var(--color-filter-text)] hover:bg-[var(--sidebar-active-bg)] active:shadow-[0_0_0_2px_var(--color-sidebar-shadow)] ${open ? " border-[var(--color-filter-text)] bg-[var(--sidebar-active-bg)]" : "border-[var(--color-box-border)]"} rounded-lg px-3 py-4 transition w-56 focus:outline-none`}
				onClick={() => setOpen((v) => !v)}
			>
				<div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm">
					{userData.initials}
				</div>
				<span className="font-medium text-sm text-[var(--color-neutral-primary)] truncate flex-1 text-left">
					{loading ? (
						<LoadingDetails entity="profile" variant="inline" />
					) : (
						userData.name
					)}
				</span>
				<FiChevronDown
					className={`w-6 h-6  ${open ? "text-[var(--color-filter-text)]" : "group-hover:text-[var(--color-filter-text)] text-[var(--color-neutral-secondary)]"} transition-transform ${open ? "rotate-180" : ""}
            }`}
				/>
			</button>
			<div
				className={`absolute bottom-18 left-0 w-56 rounded-lg shadow-[4px_4px_8px_0px_var(--color-notif-shadow-soft),0px_0px_4px_0px_var(--color-notif-shadow-strong)] bg-white border border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] overflow-hidden transition-all duration-200 z-50 ${
					open
						? "opacity-100 translate-y-0 pointer-events-auto"
						: "opacity-0 translate-y-2 pointer-events-none"
				}`}
			>
				<Link href="/account" className="block" passHref legacyBehavior>
					<Button
						variant="profile"
						className="group flex !rounded-none items-center gap-3 w-full px-3 py-4 text-base font-normal !border-b !border-[var(--color-stroke-neutral)] justify-start bg-[var(--color-alert-warm-bg)]"
					>
						<span className="transition-colors text-[var(--color-neutral-light)] ">
							{menuItems[0].icon}
						</span>
						<span className="text-sm font-normal text-[var(--color-neutral-primary)]">
							{menuItems[0].label}
						</span>
					</Button>
				</Link>
				{menuItems.slice(1).map((item, i) => {
					// Handle Transfer ownership with Link
					if (item.label === "Transfer ownership") {
						return (
							<Link
								key={item.label}
								href="/transfer-ownership"
								className="block"
								passHref
								legacyBehavior
							>
								<Button
									variant="profile"
									className={`group flex !rounded-none items-center gap-3 w-full px-3 py-4 text-base font-normal justify-start bg-white`}
								>
									<span className="transition-colors text-[var(--color-neutral-light)]">
										{item.icon}
									</span>
									<span className="text-sm font-normal text-[var(--color-neutral-primary)]">
										{item.label}
									</span>
								</Button>
							</Link>
						);
					}

					// Handle other items normally
					return (
						<Button
							key={item.label}
							variant="profile"
							className={`group flex !rounded-none items-center gap-3 w-full px-3 py-4 text-base font-normal !border-b !border-[var(--color-stroke-neutral)] last:border-b-0 justify-start bg-white`}
							onClick={
								item.label === "Log out"
									? () => setLogoutOpen(true)
									: undefined
							}
						>
							<span className="transition-colors text-[var(--color-neutral-light)]">
								{item.icon}
							</span>
							<span className="text-sm font-normal text-[var(--color-neutral-primary)]">
								{item.label}
							</span>
						</Button>
					);
				})}
			</div>
			<LogoutModal
				open={logoutOpen}
				onClose={() => setLogoutOpen(false)}
				onLogout={handleLogout}
			/>
		</div>
	);
}
