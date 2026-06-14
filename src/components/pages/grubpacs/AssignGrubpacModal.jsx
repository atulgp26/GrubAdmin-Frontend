"use client";
import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import {
	CAMPING_VERTICAL_NAME,
	DEBOUNCE_TIME,
	DEFAULT_PAGE_SIZE,
} from "@/constants/config";
import { customerService } from "@/api/services/customerService";
import LoadingDetails from "@/components/ui/LoadingDetails";
import { formatDate } from "@/utils/formatDate";

export default function AssignGrubpacModal({
	open,
	onClose,
	onConfirm,
	grubpacs,
	loading,
}) {
	const [clients, setClients] = useState([]);
	const [totalItemsCount, setTotalItemsCount] = useState(0);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedClientId, setSelectedClientId] = useState(null);
	const [internalLoading, setInternalLoading] = useState(false);

	const vertical = useMemo(() => {
		if (!open || !grubpacs?.length) return null;
		const boxVertical = grubpacs[0]?.vertical;
		if (!boxVertical) return null;
		const verticalName =
			typeof boxVertical === "string"
				? boxVertical
				: boxVertical?.name || boxVertical?.id;
		return verticalName?.toString().toLowerCase();
	}, [grubpacs, open]);

	const [debouncedSearchValue] = useDebounce(searchTerm, DEBOUNCE_TIME);
	const onDebouncedSearchValueChange = useDebouncedCallback(() => {}, DEBOUNCE_TIME);

	const onSearchKeywordChange = (e) => {
		setSearchTerm(e?.target.value ?? "");
		onDebouncedSearchValueChange();
	};

	const fetchCustomers = async () => {
		const params = {
			page_number: 1,
			page_size: DEFAULT_PAGE_SIZE,
			order_factor: "created_at",
			order: "desc",
		};
		if (vertical) params.vertical = vertical;
		if (debouncedSearchValue !== undefined && debouncedSearchValue !== "") {
			params.query = debouncedSearchValue;
		}
		setInternalLoading(true);
		try {
			const response = await customerService.getCustomers(params);
			if (response?.success && response?.code === 200) {
				const customersList = response.data.customers ?? [];
				const transformedClients = customersList.map((c) => ({
					id: c.id,
					name: c.name,
					code: c.client_id,
					client_id: c.client_id,
					organization: c.organization_name,
					organization_name: c.organization_name,
					region: `${c.state}, ${c.country}`,
					state: c.state,
					country: c.country,
					addedOn: formatDate(c.created_at),
					created_at: c.created_at,
				}));
				setClients(transformedClients);
				setTotalItemsCount(response.data.count ?? 0);
			} else {
				setClients([]);
				setTotalItemsCount(0);
			}
		} finally {
			setInternalLoading(false);
		}
	};

	useEffect(() => {
		if (!open) {
			setSelectedClientId(null);
			setClients([]);
			setSearchTerm("");
			setTotalItemsCount(0);
		} else if (grubpacs[0]?.clientId) {
			setSelectedClientId(grubpacs[0].clientId);
		}
	}, [open, grubpacs]);

	useEffect(() => {
		if (open) fetchCustomers();
	}, [open, debouncedSearchValue, grubpacs]);

	const filteredClients = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		if (!term) return clients;
		return clients.filter((client) => {
			const haystack =
				`${client.name} ${client.code} ${client.organization} ${client.region}`.toLowerCase();
			return haystack.includes(term);
		});
	}, [clients, searchTerm]);

	const isLoading = loading || internalLoading;

	const selectedClient = useMemo(
		() =>
			filteredClients.find((c) => c.id === selectedClientId) ||
			clients.find((c) => c.id === selectedClientId) ||
			null,
		[clients, filteredClients, selectedClientId],
	);

	const handleSelect = (client) => {
		setSelectedClientId((prev) => (prev === client.id ? null : client.id));
	};

	const handleConfirm = () => {
		if (!selectedClientId) return;
		const client = clients.find((c) => c.id === selectedClientId);
		if (client) onConfirm?.(client);
	};

	if (!open) return null;

	const isCamping =
		grubpacs[0]?.vertical?.name === CAMPING_VERTICAL_NAME ||
		grubpacs[0]?.vertical === CAMPING_VERTICAL_NAME;

	const title =
		grubpacs.length > 1
			? `Assign ${grubpacs.length} GrubPacs to a client`
			: grubpacs.length > 0
				? `Assign ${grubpacs[0].name} (${
						typeof grubpacs[0].vertical === "string"
							? grubpacs[0].vertical
							: grubpacs[0].vertical?.name
					}) to a client`
				: "No grubpacs";

	return (
		<Modal
			open={open}
			onClose={onClose}
			/* Full-width on mobile → 92vw tablet → 900px desktop */
			width="w-full sm:w-[92vw] lg:w-[900px]"
			height="max-h-[95vh] sm:max-h-[90vh]"
		>
			{/* Outer shell: flex-col so header/footer pin, middle scrolls */}
			<div className="flex flex-col h-full max-h-[calc(95vh-2rem)] sm:max-h-[calc(90vh-4rem)] overflow-hidden px-3 py-4 sm:px-6 sm:py-6 gap-4 sm:gap-5">

				{/* ── Title / description ── */}
				<div className="flex-shrink-0 space-y-1 sm:space-y-2">
					<h2 className="text-lg sm:text-2xl font-semibold text-[var(--color-neutral-primary)] leading-snug">
						{title}
					</h2>
					<p className="text-sm sm:text-base text-[var(--color-stroke-brand)] leading-relaxed">
						Select a client to assign the selected GrubPac to. Once
						assigned, it will appear in their account for setup and
						tracking.
					</p>
				</div>

				{/* ── Search + count row ── */}
				<div className="flex-shrink-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div className="w-full sm:w-64">
						<SearchInput
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search client"
							clearable
							onClear={onSearchKeywordChange}
						/>
					</div>
					<span className="text-xs sm:text-sm text-[var(--color-stroke-brand)] whitespace-nowrap">
						{isLoading ? (
							<LoadingDetails entity="entries" variant="inline" />
						) : (
							`${totalItemsCount} entries`
						)}
					</span>
				</div>

				{/* ── Table area (scrollable) ── */}
				<div className="flex-1 flex flex-col min-h-0 overflow-hidden rounded-lg border border-[var(--color-stroke-neutral)]">

					{/* Table header — hidden on xs, shown sm+ */}
					<div className="hidden sm:grid sm:grid-cols-5 flex-shrink-0 bg-white px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium text-[var(--color-stroke-brand)] border-b border-[var(--color-stroke-neutral)]">
						<div className="col-span-2">Name</div>
						<span>Region</span>
						<span>Added</span>
						<span></span>
					</div>

					{/* Scrollable rows */}
					<div className="flex-1 overflow-y-auto" style={{ maxHeight: "clamp(200px, 38vh, 360px)" }}>
						{isLoading ? (
							<LoadingDetails entity="clients" />
						) : filteredClients.length === 0 ? (
							<div className="flex items-center justify-center py-10 sm:py-12 text-[var(--color-stroke-brand)] text-sm">
								No clients found. Try a different search.
							</div>
						) : (
							filteredClients.map((client, idx) => {
								const isSelected = selectedClientId === client.id;
								const isLast = idx === filteredClients.length - 1;

								return (
									<div
										key={client.id}
										className={`border-b border-[var(--color-stroke-neutral)] ${isLast ? "last:border-b-0" : ""}`}
									>
										{/* ── Desktop row (sm+) ── */}
										<div className="hidden sm:grid sm:grid-cols-5 items-center px-4 sm:px-6 py-3 sm:py-4">
											<div className="col-span-2 flex flex-col gap-1 min-w-0 pr-3">
												<span className="text-[var(--color-neutral-secondary)] font-semibold text-sm truncate">
													{client.name}
												</span>
												<span className="text-xs sm:text-sm text-[var(--color-stroke-brand)] truncate">
													{client.code}
													{!isCamping && client.organization
														? ` | ${client.organization}`
														: ""}
												</span>
											</div>
											<span className="text-[var(--color-neutral-secondary)] text-sm truncate pr-2">
												{client.region}
											</span>
											<span className="text-[var(--color-neutral-secondary)] text-sm whitespace-nowrap">
												{client.addedOn}
											</span>
											<div className="flex justify-end">
												<SelectButton
													isSelected={isSelected}
													onClick={() => handleSelect(client)}
												/>
											</div>
										</div>

										{/* ── Mobile card (xs only) ── */}
										<div className="sm:hidden flex items-start justify-between gap-3 px-3 py-3">
											<div className="flex flex-col gap-1 min-w-0">
												<span className="text-[var(--color-neutral-secondary)] font-semibold text-sm truncate">
													{client.name}
												</span>
												<span className="text-xs text-[var(--color-stroke-brand)] truncate">
													{client.code}
													{!isCamping && client.organization
														? ` | ${client.organization}`
														: ""}
												</span>
												<div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
													<span className="text-xs text-[var(--color-neutral-secondary)]">
														{client.region}
													</span>
													<span className="text-xs text-[var(--color-neutral-secondary)]">
														Added: {client.addedOn}
													</span>
												</div>
											</div>
											<div className="flex-shrink-0 mt-0.5">
												<SelectButton
													isSelected={isSelected}
													onClick={() => handleSelect(client)}
												/>
											</div>
										</div>
									</div>
								);
							})
						)}
					</div>
				</div>

				{/* ── Footer ── */}
				<div className="flex-shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-3 sm:pt-4 border-t border-[var(--color-stroke-neutral)]">
					<span className="text-sm sm:text-base lg:text-lg text-[var(--color-neutral-secondary)] min-w-0 truncate">
						{selectedClient ? (
							<>
								<span className="font-semibold">
									{selectedClient.name}
								</span>
								<span className="text-[var(--color-stroke-brand)] ml-1 sm:ml-2">
									selected.
								</span>
							</>
						) : (
							"No client selected yet!"
						)}
					</span>
					<Button
						variant="secondary"
						size="mdLg"
						disabled={!selectedClient}
						onClick={handleConfirm}
						className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[50%]"
					>
						CONFIRM ASSIGNMENT
					</Button>
				</div>
			</div>
		</Modal>
	);
}

/* ── Reusable select button used in both desktop row and mobile card ── */
function SelectButton({ isSelected, onClick }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-all whitespace-nowrap ${
				isSelected
					? "border-[var(--color-filter-text)] text-[var(--color-filter-text)] bg-[var(--sidebar-active-bg)] shadow-[0_0_0_2px_var(--color-shadow-select)]"
					: "border-[var(--info-panel-view-bg)] text-[var(--info-panel-view-bg)] hover:bg-[var(--sidebar-active-bg)] hover:border-[var(--color-filter-text)] hover:text-[var(--color-filter-text)]"
			}`}
		>
			{isSelected ? "SELECTED" : "SELECT"}
		</button>
	);
}