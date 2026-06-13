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
		if (!open || !grubpacs?.length) {
			return null;
		}

		const boxVertical = grubpacs[0]?.vertical;
		if (!boxVertical) {
			return null;
		}

		const verticalName =
			typeof boxVertical === "string"
				? boxVertical
				: boxVertical?.name || boxVertical?.id;

		return verticalName?.toString().toLowerCase();
	}, [grubpacs, open]);

	const [debouncedSearchValue] = useDebounce(searchTerm, DEBOUNCE_TIME);
	const onDebouncedSearchValueChange = useDebouncedCallback(() => {
		// setCurrentPage(1);
	}, DEBOUNCE_TIME);

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

		if (vertical) {
			params.vertical = vertical;
		}

		if (debouncedSearchValue !== undefined && debouncedSearchValue !== "") {
			params.query = debouncedSearchValue;
		}

		setInternalLoading(true);
		try {
			const response = await customerService.getCustomers(params);
			if (response?.success && response?.code === 200) {
				const customersList = response.data.customers ?? [];
				// Transform API response to match UI expectations
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
		if (open) {
			fetchCustomers();
		}
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
			filteredClients.find((client) => client.id === selectedClientId) ||
			clients.find((client) => client.id === selectedClientId) ||
			null,
		[clients, selectedClientId],
	);

	const handleSelect = (client) => {
		console.log(client);
		setSelectedClientId((prev) => (prev === client.id ? null : client.id));
	};

	const handleConfirm = () => {
		if (!selectedClientId) return;
		const client = clients.find((c) => c.id === selectedClientId);
		if (client) {
			onConfirm?.(client);
		}
	};

	if (!open) return null;

	const title =
		grubpacs.length > 1
			? `Assign ${grubpacs.length} GrubPacs to a client`
			: grubpacs.length > 0
				? `Assign ${grubpacs[0].name} (${grubpacs[0].vertical.name}) to a client`
				: "No grubpacs";

	return (
		<Modal
			open={open}
			onClose={onClose}
			width="w-[900px]"
			height="h-auto max-h-[90vh]"
		>
			<div className="flex flex-col h-full px-6 py-6">
				<div className="mb-6 space-y-2">
					<h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
						{title}
					</h2>
					<p className="text-[var(--color-stroke-brand)] text-base">
						Select a client to assign the selected GrubPac to. Once
						assigned, it will appear in their account for setup and
						tracking.
					</p>
				</div>

				<div className="flex items-center justify-between mb-4">
					<div className="w-64">
						<SearchInput
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search client"
							clearable
							onClear={onSearchKeywordChange}
						/>
					</div>
					<span className="text-sm text-[var(--color-stroke-brand)]">
						{isLoading ? (
							<LoadingDetails entity="entries" variant="inline" />
						) : (
							`${totalItemsCount} entries`
						)}
					</span>
				</div>

				<div className="flex-1 flex flex-col">
					<div className="grid grid-cols-5 bg-white px-6 py-3 text-sm font-medium text-[var(--color-stroke-brand)] border-b border-[var(--color-stroke-neutral)]">
						<div className="col-span-2">
							<span>Name</span>
						</div>
						<span>Region</span>
						<span>Added</span>
						<span className="text-right"></span>
					</div>
					<div className="flex-1 overflow-y-auto max-h-[360px]">
						{isLoading ? (
							<LoadingDetails entity="clients" />
						) : filteredClients.length === 0 ? (
							<div className="flex items-center justify-center py-12 text-[var(--color-stroke-brand)] text-sm">
								No clients found. Try a different search.
							</div>
						) : (
							filteredClients.map((client, idx) => {
								const isSelected =
									selectedClientId === client.id;
								return (
									<div
										key={client.id}
										className={`grid grid-cols-5 items-center px-6 py-4 border-b border-[var(--color-stroke-neutral)] ${
											idx === filteredClients.length - 1
												? "last:border-b-0"
												: ""
										}`}
									>
										<div className="col-span-2">
											<div className="flex flex-col gap-1">
												<span className="text-[var(--color-neutral-secondary)] font-semibold">
													{client.name}
												</span>
												<span className="text-sm text-[var(--color-stroke-brand)]">
													{client.code}{" "}
													{grubpacs[0]?.vertical
														.name !==
													CAMPING_VERTICAL_NAME
														? `| ${client.organization}`
														: ""}
												</span>
											</div>
										</div>
										<span className="text-[var(--color-neutral-secondary)] text-base">
											{client.region}
										</span>
										<span className="text-[var(--color-neutral-secondary)] text-base">
											{client.addedOn}
										</span>
										<div className="flex justify-end">
											<Button
												variant="secondary"
												type="button"
												onClick={() =>
													handleSelect(client)
												}
												className={`px-3 py-1.5 btn-size-md-sm font-medium rounded-lg border transition ${
													isSelected
														? "border-[var(--color-filter-text)] text-[var(--color-filter-text)] bg-[var(--sidebar-active-bg)] shadow-[0_0_0_2px_var(--color-shadow-select)]"
														: "border-[var(--info-panel-view-bg)] text-[var(--info-panel-view-bg)] hover:bg-[var(--sidebar-active-bg)] hover:border-[var(--color-filter-text)] hover:text-[var(--color-filter-text)]"
												}`}
											>
												{isSelected
													? "SELECTED"
													: "SELECT"}
											</Button>
										</div>
									</div>
								);
							})
						)}
					</div>
				</div>

				<div className="flex items-center justify-between mt-6 pt-5 border-t border-[var(--color-stroke-neutral)]">
					<span className="text-lg text-[var(--color-neutral-secondary)]">
						{selectedClient ? (
							<>
								<span className="font-semibold text-[var(--color-neutral-secondary)]">
									{selectedClient.name}
								</span>
								<span className="text-[var(--color-stroke-brand)] ml-2">
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
						className="min-w-1/2"
					>
						CONFIRM ASSIGNMENT
					</Button>
				</div>
			</div>
		</Modal>
	);
}
