"use client"
import React from "react";
import TableCheckbox from "@/components/ui/TableCheckbox";
import { useRouter } from "next/navigation";

export default function NotificationItem({
	notification,
	selected,
	onSelect,
	getNotificationIcon,
	onDismiss,
}) {
	const router = useRouter();
	const handleCheckboxChange = (e) => {
		onSelect(e);
	};

	
    const renderMessage = (message) => {
        if (typeof message !== "string") return message;
        if (message.includes("View Details")) {
            const parts = message.split("View Details");
            return (
                <>
                    {parts[0]}
                    <span
                        className="text-[var(--color-stroke-brand)] font-semibold hover:underline cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/systemlogs?itemId=${notification.itemId}`);
                        }}
                    >
                        View Details
                    </span>
                    {parts[1]}
                </>
            );
        }
        return message;
    };

    return (
        <div className={`flex w-full items-start gap-7 px-4 py-3 ${selected ? "bg-[var(--color-notif-selected-bg)]" : "hover:bg-[var(--color-neutral-secondary-bg)]"}`}>
            <div>
                <TableCheckbox
                    checked={selected}
                    onChange={handleCheckboxChange}
                />
            </div>
            <div className="w-full">
                <div className="flex gap-2 mb-3 items-end">
                    <div>
                        {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div
                            className={`text-base font-semibold ${notification.status === "read" ? "text-[var(--color-stroke-brand)]" : "text-[var(--color-neutral-secondary)]"}`}
                        >
                            {notification.title}
                        </div>
                    </div>
                </div>
                <div>
                    <div className="text-sm text-[var(--color-neutral-secondary)] mb-3">
                        {renderMessage(notification.message)}
                    </div>
                    <div className="flex items-center justify-between text-sm text-[var(--color-stroke-brand)]">
                        <span>{notification.time}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDismiss?.();
                            }}
                            className="text-sm font-semibold text-[var(--color-brand-default)] hover:underline cursor-pointer"
                        >
                            DISMISS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
