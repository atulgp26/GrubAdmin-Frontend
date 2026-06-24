"use client";
import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import SearchWithSuggestions from "@/components/ui/SearchWithSuggestions";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import CheckBox from "@/components/ui/CheckBox";
import GrubPacsTable from "@/components/pages/grubpacs/GrubpacsTable";
import AddNewGrubPac from "@/components/pages/grubpacs/addnewgrubpacs";
import DeleteBoxModal from "@/components/pages/grubpacs/DeleteBoxModal";
import AssignGrubpacModal from "@/components/pages/grubpacs/AssignGrubpacModal";
import UnassignBoxModal from "@/components/pages/grubpacs/UnassignBoxModal";
import TableActionBar from "@/components/ui/TableActionBar";
import { boxService } from "@/api/services/boxService";
import { showError, showSuccess } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/context/PermissionContext";
import { useAuth } from "@/context/AuthContext";
import LoadingDetails from "@/components/ui/LoadingDetails";
import { customerService } from "@/api/services/customerService";
import { useDebounce } from "use-debounce";
import { formatDate } from "@/utils/formatDate";
import {
	DEBOUNCE_TIME,
	DEFAULT_PAGE_SIZE,
	GRUBPAC_GROUP_BY_ASSIGNED_GROUPS,
} from "@/constants/config";
import CollapseTable from "@/components/shared/CollapseTable";
import { AiOutlineCloseSquare } from "react-icons/ai";
import { ALL_VERTICALS_OPTION as client } from "@/utils/verticals";
import { RiLoopRightFill } from "react-icons/ri";

export default function GrubpacsPage() {
	const router = useRouter();

	const [grubpacs, setGrubpacs] = useState([]);
	const [groups, setGroups] = useState(GRUBPAC_GROUP_BY_ASSIGNED_GROUPS);
	const [searchValue, setSearchValue] = useState("");
	const [selectedRole, setSelectedRole] = useState([]);
	const [activeSection, setActiveSection] = useState("assigned");
	const [currentOpenVertical, setCurrentOpenVertical] = useState(null);
	const [groupByRole, setGroupByRole] = useState(false);
	const [selectedItems, setSelectedItems] = useState([]);
	const [verticals, setVerticals] = useState([]);
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const pageSize = DEFAULT_PAGE_SIZE;
	const [currentPage, setCurrentPage] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [modalState, setModalState] = useState({
		open: false,
		mode: "create",
		data: null,
	});
	const [forceRefresh, setForceRefresh] = useState(false);
	const [deleteModal, setDeleteModal] = useState({
		open: false,
		item: null,
		items: [],
	});
	const [assignModal, setAssignModal] = useState({
		open: false,
		item: null,
		items: [],
	});
	const [unassignModal, setUnassignModal] = useState({
		open: false,
		item: null,
		items: [],
		source: null,
	});
	const [initialLoading, setInitialLoading] = useState(true);
	const [fetching, setFetching] = useState(false);
	const [selectedAssignmentState, setSelectedAssignmentState] =
		useState(null);

	const { permissionsByModule, user } = usePermissions();

	const [debouncedSearchValue] = useDebounce(searchValue, DEBOUNCE_TIME);
	const safeCurrentPage = Math.min(
		currentPage,
		Math.max(1, Math.ceil(totalItems / pageSize)),
	);

	const processedGrubpacs = useMemo(
		() =>
			grubpacs.map((g) => ({
				id: g.id,
				name: g.name,
				code: g.box_id,
				clientName: g.client?.name ?? null,
				clientId: g.client?.id ?? null,
				client: g.client ?? null,
				customerId: g.client?.id ?? null,
				status: g.status,
				statusDisplay: g.status === "suspended" ? "Inactive" : g.status,
				updatedOn: formatDate(g.updated_at),
				assignment: g.client === null ? "unassigned" : "assigned",
				vertical: g.vertical?.name ?? null, 
			})),
		[grubpacs],
	);

	const assignedGrubpacs = useMemo(
		() => processedGrubpacs.filter((g) => g.client !== null),
		[processedGrubpacs],
	);
	const unassignedGrubpacs = useMemo(
		() => processedGrubpacs.filter((g) => g.client === null),
		[processedGrubpacs],
	);

	const verticalOptions = useMemo(
		() =>
			verticals.map((v) => ({
				id: v.id, 
				label: `${v.name.charAt(0).toUpperCase() + v.name.slice(1)}`,
				value: v.id,
			})),
		[verticals],
	);

	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(totalItems / pageSize)),
		[totalItems],
	);
	const startIndex = useMemo(
		() => (safeCurrentPage - 1) * pageSize,
		[safeCurrentPage],
	);
	const endIndexExclusive = useMemo(
		() => Math.min(startIndex + pageSize, totalItems),
		[startIndex, totalItems],
	);
	const pageStartDisplay = useMemo(
		() => (totalItems === 0 ? 0 : startIndex) + 1,
		[totalItems, startIndex],
	);
	const pageEndDisplay = endIndexExclusive;

	const onSearchValueChange = (e) => {
		setSearchValue(e.target.value);
	};

	const onGroupByRoleClick = (e) => {
		setSelectedRole([]);
		setCurrentOpenVertical(null);
		setGroupByRole(e.target.checked);
		setGroups(
			e.target.checked
				? verticals.map((v) => ({
						name: v.name,
						value: v.name.toLowerCase(),
					}))
				: GRUBPAC_GROUP_BY_ASSIGNED_GROUPS,
		);
	};

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/login");
		}
	}, [isAuthenticated, authLoading, router]);

	useEffect(() => {
		if (isAuthenticated && user && permissionsByModule) {
			fetchVerticals();
		}
	}, [permissionsByModule, user, isAuthenticated]);

	useEffect(() => {
		if (isAuthenticated) {
			const isInitial = grubpacs.length === 0 && !debouncedSearchValue;
			fetchGrubpacs(isInitial);
		}
	}, [isAuthenticated, selectedRole, debouncedSearchValue, safeCurrentPage]);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchValue, selectedRole, groupByRole]);

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	useEffect(() => {
		setCurrentPage(1);
	}, [debouncedSearchValue]);

	useEffect(() => {
		if (isAuthenticated && forceRefresh) {
			fetchGrubpacs(false);
			setForceRefresh(false);
		}
	}, [isAuthenticated, forceRefresh]);

	const handleAddGrubpac = () => {
		setModalState({ open: true, mode: "create", data: null });
	};

	const closeModal = () => {
		setModalState({ open: false, mode: "create", data: null });
	};

	const handleModalConfirm = async (formData) => {
		try {
			let res;
			if (modalState.mode === "create") {
				res = await boxService.createBox({
					box_id: formData.box_id,
					name: formData.name,
					vertical: formData.vertical,
					status: formData.status,
				});
			} else {
				res = await boxService.updateBox(formData.id, {
					box_id: formData.box_id,
					name: formData.name,
					status: formData.status,
				});
			}

			if (res?.success) {
				showSuccess(
					modalState.mode === "create" ? "Created" : "Updated",
					modalState.mode === "create"
						? `${formData.name} [${formData.box_id}] added successfully. It is ready to be assigned to a client.`
						: `${formData.name} [${formData.box_id}] updated successfully.`,
					false,
					"", // href
					modalState.mode === "create"
						? {
								label: "ASSIGN BOX",
								style: { backgroundColor: "white" },
								onClick: () =>
									setAssignModal({
										open: true,
										item: res.data?.box || {
											name: formData.name,
											id: res.data?.id,
										},
										items: [
											res.data?.box || {
												name: formData.name,
												id: res.data?.id,
											},
										],
									}),
							}
						: null,
				);
				setModalState({ open: false, mode: "create", data: null });
				setForceRefresh(true);
			} 
			else {
				showError(res?.error || "Failed to save box.");
			}
		} catch (e) {
			showError("Failed to save box.");
		}
	};

	const closeDeleteModal = () => {
		setDeleteModal({ open: false, item: null, items: [] });
	};

	const handleDeleteConfirm = async () => {
		try {
			const ids = deleteModal.items?.length
				? deleteModal.items.map((i) => i.id)
				: deleteModal.item
					? [deleteModal.item.id]
					: [];
			if (ids.length === 0) return;
			const res = await boxService.deleteBoxes({ box_ids: ids });
			if (res?.success) {
				showSuccess("Deleted", "Boxes deleted successfully.");
				closeDeleteModal();
				setForceRefresh(true);
			} else {
				console.error("Delete boxes failed:", res);
				showError(res?.error || "Failed to delete boxes.");
			}
		} catch (e) {
			console.error("Failed to delete boxes:", e);
			showError("Failed to delete boxes.");
		}
	};

	const openUnassignModal = (items, source) => {
		setUnassignModal({
			open: true,
			item: items.length === 1 ? items[0] : null,
			items,
			source,
		});
	};

	const handleAssignConfirm = async (client) => {
		try {
			const ids = assignModal.items?.length
				? assignModal.items.map((i) => i.id)
				: assignModal.item
					? [assignModal.item.id]
					: [];
			if (ids.length === 0 || !client?.id) return;

			const res = await boxService.assignBoxes({
				box_ids: ids,
				customer: client.id,
			});

			if (res?.success) {
				showSuccess("Assigned", "Boxes assigned successfully.");
				setAssignModal({ open: false, item: null, items: [] });
				setForceRefresh(true);
			} else {
				showError(res?.error || "Failed to assign boxes.");
			}
		} catch (e) {
			showError("Failed to assign boxes.");
		}
	};

	const handleUnassignConfirm = async () => {
		try {
			const ids = unassignModal.items?.length
				? unassignModal.items.map((i) => i.id)
				: unassignModal.item
					? [unassignModal.item.id]
					: [];
			if (ids.length === 0) return;
			const res = await boxService.unassignBoxes({ box_ids: ids });
			if (res?.success) {
				showSuccess("Unassigned", "Boxes unassigned successfully.");
				const source = unassignModal.source;
				const item = unassignModal.item;
				const items = unassignModal.items;

				setUnassignModal({
					open: false,
					item: null,
					items: [],
					source: null,
				});
				setForceRefresh(true);

				if (source === "delete") {
					const updatedItems = items?.map((box) => ({
						...box,
						assignment: "unassigned",
					}));
					const updatedItem = item
						? { ...item, assignment: "unassigned" }
						: null;

					setDeleteModal({
						open: true,
						item: updatedItem,
						items: updatedItems,
					});
				}
			} else {
				showError(res?.error || "Failed to unassign boxes.");
			}
		} catch (e) {
			showError("Failed to unassign boxes.");
		}
	};

	const handleClearSelection = () => setSelectedItems([]);

	const handleBulkDelete = () => {
		if (selectedItems.length === 0) return;
		const items = processedGrubpacs.filter((g) =>
			selectedItems.includes(g.id),
		);
		setDeleteModal({ open: true, item: null, items });
	};

	const selectedAssignedItems = useMemo(
		() =>
			processedGrubpacs.filter(
				(g) =>
					selectedItems.includes(g.id) && g.assignment === "assigned",
			),
		[selectedItems, processedGrubpacs],
	);

	const handleBulkUnassign = () => {
		if (selectedAssignedItems.length === 0) return;
		openUnassignModal(selectedAssignedItems, "unassign");
	};

	const customActionButtons =
		selectedAssignedItems.length > 0
			? [
					{
						key: "remove-assignment",
						label: "Remove box assignment",
						icon: (
							<AiOutlineCloseSquare className="w-5 h-5 text-[var(--color-stroke-brand)] group-hover:text-[var(--notif-border)]" />
						),
						onClick: handleBulkUnassign,
					},
				]
			: null;

	const handleSelectAllInSection = (items, checked) => {
		if (checked) {
			setSelectedItems(items.map((i) => i.id));
		} else {
			setSelectedItems([]);
		}
	};

	const handleSelectItem = (itemId, checked) => {
		setSelectedItems((prev) =>
			checked ? [...prev, itemId] : prev.filter((id) => id !== itemId),
		);
	};

	const handleRowAction = (action, item, assignment) => {
		switch (action) {
			case "assign":
				setAssignModal({ open: true, item, items: [item] });
				break;
			case "unassign":
				openUnassignModal([item], "unassign");
				break;
			case "remove-assignment":
				openUnassignModal([item], "unassign");
				break;
			case "edit":
				setModalState({ open: true, mode: "edit", data: item });
				break;
			case "delete":
				setDeleteModal({ open: true, item, items: [] });
				break;
			default:
				break;
		}
	};

	const fetchVerticals = async () => {
		try {
			const res = await customerService.getVerticals();
			if (res?.success && res?.data?.verticals) {
				setVerticals(res.data.verticals);
			}
		} catch (e) {
			console.error("Failed to fetch verticals:", e);
		}
	};

	const fetchGrubpacs = async (isInitial = false) => {
		if (isInitial) setInitialLoading(true);
		else setFetching(true);
		try {
			const params = {
				page_number: safeCurrentPage,
				page_size: pageSize,
			};
			if (debouncedSearchValue) params.query = debouncedSearchValue;
			if (selectedRole.length > 0) {
				params.verticals = selectedRole;
			}
			const res = await boxService.getBoxes(params);
			if (res?.success && res?.data) {
				setGrubpacs(res.data.boxes || []);
				setTotalItems(res.data.pagination?.total_count || 0); 
			}
		} catch (e) {
			console.error("Failed to fetch grubpacs:", e);
		} finally {
			setInitialLoading(false);
			setFetching(false);
		}
	};

	const onVerticalGroupClick = (value) => {
		setCurrentOpenVertical(currentOpenVertical === value ? null : value);
	};

	const onVerticalGroupClose = () => setCurrentOpenVertical(null);
	const onVerticalGroupOpen = (value) => setCurrentOpenVertical(value);

	const handleSectionToggle = (section) => {
		setActiveSection((prev) => (prev === section ? null : section));
	};

	const onStateGroupsClick = (value) => {
		setSelectedAssignmentState((prev) => (prev === value ? null : value));
	};

	const onStateGroupClose = () => {};

	const onStateGroupOpen = (value) => {
		if (value) setSelectedAssignmentState(value);
	};

	if (authLoading || !isAuthenticated) return null;

	if (initialLoading) {
		return (
			<div className="min-h-[calc(100vh-150px)]">
				<LoadingDetails entity="GrubPacs" />
			</div>
		);
	}

	return (
		<div className="w-full h-full flex flex-col gap-6">
<div className="shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
					Grubpacs
				</h1>
				<Button variant="primary" onClick={handleAddGrubpac}>
					ADD NEW
				</Button>
			</div>

			{/* Search + Filters */}
<div className="flex items-center justify-between gap-6 flex-wrap">
				<div className="w-[260px]">
					<SearchWithSuggestions
						data={processedGrubpacs}
						value={searchValue}
						onChange={onSearchValueChange}
						onSelect={(item) => {
							setSearchValue(item.name);
						}}
						placeholder="Search box"
						clearable
						onClear={() => setSearchValue("")}
						openOnFocus={false}
					/>
				</div>

				<div className="flex items-center gap-4 flex-wrap">
					<span className="text-sm text-[var(--color-stroke-brand)]"></span>

					{!groupByRole && (
						<div className="w-48">
							<MultiSelectDropdown
								options={verticalOptions}
								selected={selectedRole}
								setSelected={setSelectedRole}
								placeholder="All verticals"
								hideComponent
								notificationIcon
							/>
						</div>
					)}

					<label className="flex items-center gap-2 text-lg text-[var(--color-neutral-secondary)]">
						<CheckBox
							checked={groupByRole}
							onChange={onGroupByRoleClick}
						/>
						Group as per vertical
					</label>
				</div>
			</div>
			</div>

		    <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
        {groupByRole ? (
				<>
					{groups.map((group) => {
						const groupData = processedGrubpacs.filter(
							(g) =>
								g.vertical?.toLowerCase() ===
								group.name?.toLowerCase(),
						);
						return (
							<CollapseTable
								key={group.value}
								groupName={group.name}
								scrollable={true}
scrollableMaxHeight="calc(100vh - 380px)"
								renderTable={() => (
									<GrubPacsTable
										data={groupData}
										selectedItems={selectedItems}
										groupName={group.name}
										
										onSelectAll={(checked) =>
											handleSelectAllInSection(
												groupData,
												checked,
											)
										}
										onSelectItem={handleSelectItem}
										onRowAction={(
											action,
											item,
											assignment,
										) => {
											handleRowAction(
												action,
												item,
												assignment ?? group.name,
											);
										}}
									/>
								)}
								data={groupData}
								onClose={() => onVerticalGroupClose()}
								onClick={() =>
									onVerticalGroupClick(group.value)
								}
								onOpen={() => onVerticalGroupOpen(group.value)}
								isOpen={currentOpenVertical === group.value}
								pagination={
									currentOpenVertical === group.value &&
									groupData.length > 0
										? {
												rangeText: `Showing 1-${groupData.length}`,
												disablePrev: true,
												disableNext: true,
											}
										: undefined
								}
								emptyResult={`There are no boxes from ${group.name} vertical`}
							/>
						);
					})}
				</>
			) : (
				<>
					<CollapseTable
						groupName={`Assigned (${assignedGrubpacs.length})`}
						    scrollable={true}                  
    scrollableMaxHeight="calc(100vh - 380px)"
						renderTable={() => (
							<GrubPacsTable
								data={assignedGrubpacs}
			
								selectedItems={selectedItems}
								groupName="Assigned"
								onSelectAll={(checked) =>
									handleSelectAllInSection(
										assignedGrubpacs,
										checked,
									)
								}
								onSelectItem={handleSelectItem}
								onRowAction={(action, item) => {
									handleRowAction(action, item, "Assigned");
								}}
							/>
						)}
						data={assignedGrubpacs}
						onOpen={() => {}}
						onClose={() => {}}
						onClick={() => handleSectionToggle("assigned")}
						isOpen={activeSection === "assigned"}
						pagination={
							activeSection === "assigned" &&
							assignedGrubpacs.length > 0
								? {
										rangeText: `Showing 1-${assignedGrubpacs.length}`,
										disablePrev: true,
										disableNext: true,
									}
								: undefined
						}
						emptyResult="There are no assigned boxes"
					/>
					<CollapseTable
						groupName={`Unassigned (${unassignedGrubpacs.length})`}
						scrollable={true}
scrollableMaxHeight="calc(100vh - 380px)"
						renderTable={() => (
							<GrubPacsTable
								data={unassignedGrubpacs}
								selectedItems={selectedItems}
								
								groupName="Unassigned"
								onSelectAll={(checked) =>
									handleSelectAllInSection(
										unassignedGrubpacs,
										checked,
									)
								}
								onSelectItem={handleSelectItem}
								onRowAction={(action, item) => {
									handleRowAction(action, item, "Unassigned");
								}}
							/>
						)}
						data={unassignedGrubpacs}
						onOpen={() => {}}
						onClose={() => {}}
						onClick={() => handleSectionToggle("unassigned")}
						isOpen={activeSection === "unassigned"}
						pagination={
							activeSection === "unassigned" &&
							unassignedGrubpacs.length > 0
								? {
										rangeText: `Showing 1-${unassignedGrubpacs.length}`,
										disablePrev: true,
										disableNext: true,
									}
								: undefined
						}
						emptyResult="There are no unassigned boxes"
					/>
				</>
			)}

			<AddNewGrubPac
				open={modalState.open}
				onClose={closeModal}
				onConfirm={handleModalConfirm}
				mode={modalState.mode}
				initialData={modalState.data}
			/>
			<DeleteBoxModal
				open={deleteModal.open}
				onClose={closeDeleteModal}
				onConfirm={handleDeleteConfirm}
				onRequireUnassign={() => {
					const currentItems = deleteModal.items;
					const currentItem = deleteModal.item;
					setDeleteModal({ open: false, item: null, items: [] });
					openUnassignModal(
						currentItems?.length ? currentItems : [currentItem],
						"delete",
					);
				}}
				boxName={deleteModal.item?.name}
				boxId={deleteModal.item?.code}
				assignment={deleteModal.item?.assignment}
				items={deleteModal.items}
				count={
					deleteModal.items?.length ||
					(deleteModal.item ? 1 : undefined)
				}
			/>
			<AssignGrubpacModal
				open={assignModal.open}
				onClose={() =>
					setAssignModal({ open: false, item: null, items: [] })
				}
				onConfirm={handleAssignConfirm}
				grubpacs={assignModal.items}
			/>
			<UnassignBoxModal
				open={unassignModal.open}
				onClose={() =>
					setUnassignModal({
						open: false,
						item: null,
						items: [],
						source: null,
					})
				}
				onConfirm={handleUnassignConfirm}
				boxName={unassignModal.item?.name}
				boxId={unassignModal.item?.code}
				count={
					unassignModal.items?.length ||
					(unassignModal.item ? 1 : undefined)
				}
				ctaLabel="I UNDERSTAND. UNASSIGN"
			/>
			{selectedItems.length > 0 && (
				<TableActionBar
					selectedCount={selectedItems.length}
					onClearSelection={handleClearSelection}
					onDelete={handleBulkDelete}
					onReassignRole={() => {}}
					allowReassign={false}
					allowSuspend={false}
					deleteLabel="DELETE"
					customActions={customActionButtons}
				/>
			)}
			</div>
		</div>
	);
}
