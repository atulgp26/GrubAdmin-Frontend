"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePermissions } from "@/context/PermissionContext";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import SearchWithSuggestions from "@/components/ui/SearchWithSuggestions";
import Select from "@/components/ui/Select";
import DropdownPortal from "@/components/ui/DropdownPortal";
import Icon from "@/components/ui/Icon";
import ExportListModal from "@/components/pages/employees/ExportListModal";
import { BsThreeDotsVertical } from "react-icons/bs";
import { PencilLine, Trash2 } from "lucide-react";
import ActivateEmployeeModal from "@/components/pages/employees/ActivateEmployeeModal";
import DeleteCategoryModal from "@/components/pages/support/DeleteCategoryModal";
import AddCategory from "@/components/pages/support/addcategory";
import { faqService } from "@/api/services/faqService";
import { showSuccess, showError } from "@/components/ui/toast";
import InfoPanel from "@/components/common/InfoPanel";
import LoadingDetails from "@/components/ui/LoadingDetails";
import { ALL_VERTICALS_OPTION, fetchVerticalOptions } from "@/utils/verticals";

const DEFAULT_VERTICALS = [
	{ value: ALL_VERTICALS_OPTION.id, label: ALL_VERTICALS_OPTION.label },
];

export default function SuspendedSupportCategoriesPage() {
	const router = useRouter();
	const { can } = usePermissions();
	const canViewSupport =
		can("view active resources", "support") || can("view active resources");
	const [search, setSearch] = useState("");
	const [exportOpen, setExportOpen] = useState(false);
	const [vertical, setVertical] = useState("all");
	const [menuOpen, setMenuOpen] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [reactivateCount, setReactivateCount] = useState(0);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deleteCategoryId, setDeleteCategoryId] = useState(null);
	const [editInitial, setEditInitial] = useState(null);
	const [deleteMeta, setDeleteMeta] = useState({ title: "", faqCount: 0 });
	const [editOpen, setEditOpen] = useState(false);
	const buttonRefs = useRef({});

	const [categories, setCategories] = useState([]);
	const [verticalOptions, setVerticalOptions] = useState(DEFAULT_VERTICALS);
	const [verticalIdToName, setVerticalIdToName] = useState({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			try {
				setLoading(true);
				const [catsRes, verticalData] = await Promise.all([
					faqService.getCategories({ category_state: "suspended" }),
					fetchVerticalOptions(),
				]);
				if (catsRes?.success && catsRes?.code === 200) {
					const list =
						catsRes.data?.faq_categories ||
						catsRes.data?.data?.faq_categories ||
						[];
					const normalized = list.map((c) => ({
						id: c.id,
						title: c.name,
						icon: "notes_info",
						iconId: c.icon_id,
						description: c.description || "",
						faqCount: c.faq_count ?? c.faqCount ?? 0,
						verticalId:
							c.vertical_id !== undefined &&
							c.vertical_id !== null
								? String(c.vertical_id)
								: "",
					}));
					setCategories(normalized);
				}
				const map = verticalData?.map || {};
				const opts = verticalData?.options || [];
				if (opts.length) {
					setVerticalOptions([
						{
							value: ALL_VERTICALS_OPTION.id,
							label: ALL_VERTICALS_OPTION.label,
						},
						...opts.map((opt) => ({
							value: opt.id,
							label: opt.label,
						})),
					]);
				} else {
					setVerticalOptions(DEFAULT_VERTICALS);
				}
				setVerticalIdToName(map);
			} catch (_) {
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	const searchData = useMemo(
		() =>
			categories.map((c) => ({
				id: c.id,
				name: c.title,
				code: verticalIdToName[c.verticalId] || "",
			})),
		[categories, verticalIdToName],
	);

	const filtered = useMemo(() => {
		return categories.filter((c) => {
			const vKey = (vertical || "all").toString();
			const catVerticalId =
				c.verticalId !== undefined && c.verticalId !== null
					? String(c.verticalId)
					: "";
			const matchesVertical = vKey === "all" || catVerticalId === vKey;
			const s = search.trim().toLowerCase();
			const matchesSearch =
				!s ||
				c.title.toLowerCase().includes(s) ||
				(c.description || "").toLowerCase().includes(s);
			return matchesVertical && matchesSearch;
		});
	}, [search, vertical, categories]);

	const exportOptions = [
		{
			group: "scope",
			title: "Scope",
			items: [
				{ id: "all", label: "All suspended categories", type: "radio" },
				{
					id: "filtered",
					label: "As per the filtered list",
					type: "radio",
				},
			],
		},
	];
	const handleOpenCategoryReactivate = (category) => {
		setSelectedCategory(category);
		setIsModalOpen(true);
	};

	const handleOpenReactivate = () => {
		setReactivateCount(filtered.length);
		setIsModalOpen(true);
	};

	const handleReactivate = async () => {
		try {
			const ids = selectedCategory
				? [selectedCategory.id]
				: filtered.map((c) => c.id);
			if (ids.length === 0) {
				setIsModalOpen(false);
				return;
			}
			const res = await faqService.reactivateCategories(ids);
			if (res?.success && res?.code === 200) {
				showSuccess(
					"Success!",
					`${ids.length} ${ids.length === 1 ? "category has" : "categories have"} been reactivated.`,
				);
				setCategories((prev) =>
					prev.filter((c) => !ids.includes(c.id)),
				);
			} else {
				const err =
					res?.message ||
					res?.error ||
					"Failed to reactivate categories.";
				showError(err);
			}
		} catch (e) {
			const msg =
				e?.response?.data?.message ||
				e?.message ||
				"Failed to reactivate categories.";
			showError(msg);
		} finally {
			setIsModalOpen(false);
			setSelectedCategory(null);
		}
	};

	const handleExportConfirm = async ({ scope, checked }) => {
		try {
			setExportOpen(false);

			const params = {};
			params.category_state = "suspended";

			if (scope === "filtered") {
				if (search && search.trim()) params.query = search.trim();
				if (vertical && vertical !== "all")
					params.vertical_id = vertical;
			}

			params.include_questions = true;

			const response = await faqService.exportFaqs(params);
			if (response && typeof response === "object" && response.blob) {
				const blob = response.blob;
				const filename =
					response.filename ||
					`suspended_categories_${new Date().toISOString().split("T")[0]}.csv`;

				if (blob.size === 0) {
					showError(
						"Export file is empty. Please check your filters and try again.",
					);
					return;
				}

				const finalFilename = filename.endsWith(".csv")
					? filename
					: `${filename}.csv`;
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = finalFilename;
				link.style.display = "none";
				document.body.appendChild(link);
				link.click();
				setTimeout(() => {
					window.URL.revokeObjectURL(url);
					if (document.body.contains(link))
						document.body.removeChild(link);
				}, 100);
				showSuccess("Success!", "CSV file downloaded successfully.");
			} else {
				showError("Failed to export. Invalid response from server.");
			}
		} catch (error) {
			const errorMessage =
				error?.message ||
				"Failed to export suspended categories. Please try again.";
			showError(errorMessage);
		}
	};

	const canReactivate =
		can("activate categories", "support") || can("activate categories");
	const canEdit = can("edit category", "support") || can("edit category");
	const canDelete =
		can("delete categories", "support") || can("delete categories");
	const canExport =
		can("export suspended_categories", "support") ||
		can("export suspended_categories");

	if (!canViewSupport) return null;

	if (loading) {
		return (
			<div className="min-h-[calc(100vh-150px)]">
				<LoadingDetails entity="suspended categories" />
			</div>
		);
	}

	return (
<div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
	<div className="flex items-center justify-between mb-6 flex-shrink-0">
				<div className="flex items-center gap-4">
					<Button
						variant="cancel"
						onClick={() => router.push("/support")}
						className="p-2 rounded-lg"
					>
						<svg
							className="w-4 h-4 text-[var(--color-stroke-brand)]"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<polyline points="15 18 9 12 15 6" />
						</svg>
					</Button>
					<h1 className="text-lg font-semibold text-[var(--color-neutral-primary)]">
						Suspended categories
					</h1>
				</div>
				{(loading || filtered.length > 0) && (
					<div className="flex items-center gap-4">
						{canReactivate && filtered.length > 0 && (
							<Button
								variant="secondary"
								className="btn-size-md-sm !px-3 font-medium"
								onClick={() => handleOpenReactivate()}
							>
								ACTIVATE ALL
							</Button>
						)}
						{canExport && filtered.length > 0 && (
							<Button
								variant="cancel"
								size="sm"
								onClick={() => setExportOpen(true)}
								className="btn-size-md-sm"
							>
								EXPORT LIST
							</Button>
						)}
					</div>
				)}
			</div>

			{!loading && categories.length === 0 ? (
				<InfoPanel
					title=""
					description="These categories are currently hidden from client platforms."
					name="No suspended categories"
					subdescription="All support categories are currently active. Suspended categories will appear here once deactivated."
				/>
			) : (
	<div className="flex flex-col flex-1 min-h-0">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
						<div className="w-full sm:w-64">
							<SearchWithSuggestions
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								onSelect={(item) => setSearch(item.name)}
								data={searchData}
								placeholder="Search FAQs"
								className="[&_input]:!h-8 [&_input]:!py-1"
								clearable={true}
								onClear={() => setSearch("")}
								openOnFocus={false}
								minChars={1}
							/>
						</div>
						<div className="flex items-center gap-3 ml-auto">
							<div className="text-sm text-[var(--color-stroke-brand)]">
								Showing {filtered.length} of{" "}
								{categories.length}
							</div>
							<div className="w-44">
								<Select
									value={vertical}
									onChange={setVertical}
									options={verticalOptions}
									placeholder="All verticals"
								/>
							</div>
						</div>
					</div>
<div className="flex-1 overflow-y-auto min-h-0">
					{filtered.length === 0 ? (
						<InfoPanel
							title=""
							description="No suspended categories match your search or filters. Try clearing them."
							name="No results found"
						/>
					) : (
						<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
							{filtered.map((cat) => (
								<div
									key={cat.id}
									className="border border-[var(--color-stroke-neutral)] group hover:border-[var(--color-admin-profile-border)] transition-colors rounded-lg bg-white p-6 flex flex-col gap-4 cursor-default"
								>
									<div className="relative flex flex-col items-center gap-3 text-center">
										<div className="w-full flex justify-end">
											{(canReactivate ||
												canEdit ||
												canDelete) && (
												<button
													ref={(el) =>
														(buttonRefs.current[
															cat.id
														] = el)
													}
													onClick={(e) => {
														e.stopPropagation();
														setMenuOpen(
															menuOpen === cat.id
																? null
																: cat.id,
														);
													}}
													className={`p-2 hover:bg-[var(--color-neutral-secondary-bg)] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${menuOpen === cat.id ? "bg-[var(--color-neutral-secondary-bg)] shadow-[0_0_0_2px_var(--color-shadow-actionmenu)] rounded-lg" : ""}`}
												>
													<BsThreeDotsVertical
														strokeWidth={1}
														className=" w-5 h-5 text-[var(--color-stroke-brand)]"
													/>

													<DropdownPortal
														targetRef={
															buttonRefs.current[
																cat.id
															]
																? {
																		current:
																			buttonRefs
																				.current[
																				cat
																					.id
																			],
																	}
																: null
														}
														open={
															menuOpen === cat.id
														}
														onClose={() =>
															setMenuOpen(null)
														}
													>
														<div className="w-56 bg-white border border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] rounded-lg shadow-[4px_4px_8px_0_var(--color-notif-shadow-soft),0px_0px_4px_0_var(--color-notif-shadow-strong)] z-50">
															{canReactivate && (
																<Button
																	variant="profile"
																	onClick={() => {
																		handleOpenCategoryReactivate(
																			cat,
																		);
																		setMenuOpen(
																			null,
																		);
																	}}
																	className="w-full !rounded-b-none text-left btn-size-md-sm px-4 py-2 flex items-center gap-2 text-[var(--color-neutral-secondary)] text-sm"
																>
																	<Icon
																		name="user_check"
																		className="w-5 h-5 !text-[var(--notif-success)]"
																	/>{" "}
																	Activate
																	category
																</Button>
															)}
															{canEdit && (
																<Button
																	variant="profile"
																	onClick={() => {
																		setMenuOpen(
																			null,
																		);
																		setEditInitial(
																			{
																				id: cat.id,
																				name: cat.title,
																				icon: cat.iconId,
																				description:
																					cat.description,
																				roles: cat.verticalId
																					? [
																							cat.verticalId,
																						]
																					: [],
																			},
																		);
																		setEditOpen(
																			true,
																		);
																	}}
																	className="w-full !rounded-none text-left btn-size-md-sm px-4 py-2 flex items-center gap-2 text-[var(--color-neutral-secondary)] text-sm"
																>
																	<PencilLine className="w-5 h-5 text-[var(--color-neutral-light)]" />{" "}
																	Edit
																	category
																</Button>
															)}
															{canDelete && (
																<Button
																	variant="profile"
																	onClick={() => {
																		setMenuOpen(
																			null,
																		);
																		setDeleteMeta(
																			{
																				title: cat.title,
																				faqCount:
																					cat.faqCount ||
																					0,
																			},
																		);
																		setDeleteCategoryId(
																			cat.id,
																		);
																		setDeleteOpen(
																			true,
																		);
																	}}
																	className="w-full text-left !rounded-t-none btn-size-md-sm px-4 py-2 flex items-center gap-2 text-[var(--color-neutral-secondary)] text-sm"
																>
																	<Trash2
																		name="note"
																		className="w-5 h-5 text-[var(--notif-error)]"
																	/>{" "}
																	Delete
																	category
																</Button>
															)}
														</div>
													</DropdownPortal>
												</button>
											)}
										</div>
										<Icon
											name={cat.icon || "notes_info"}
											className="w-8 h-8 text-[var(--color-brand-icon)] group-hover:text-[var(--info-panel-view-bg)]"
										/>
										<div className="text-[var(--color-neutral-primary)] font-semibold text-base">
											{cat.title}
										</div>
										<p className="text-sm text-[var(--color-stroke-brand)] line-clamp-2">
											{cat.description}
										</p>
										<div className="text-xs text-[var(--color-stroke-brand)]">
											(Visible to{" "}
											{verticalIdToName[cat.verticalId] ||
												"—"}
											)
										</div>
									</div>
								</div>
							))}
						</div>
						
					)}
</div>
					<ExportListModal
						open={exportOpen}
						onClose={() => setExportOpen(false)}
						onConfirm={handleExportConfirm}
						options={exportOptions}
						title=""
						description=""
					/>
					<ActivateEmployeeModal
						open={isModalOpen}
						onClose={() => {
							setIsModalOpen(false);
							setSelectedCategory(null);
						}}
						onConfirm={handleReactivate}
						custom={true}
						title={
							selectedCategory
								? `Reactivate Troubleshooting and FAQs?`
								: `Reactivate Troubleshooting and ${reactivateCount} ${reactivateCount === 1 ? "category" : "categories"}?`
						}
						description={
							selectedCategory
								? `This will restore the category and its FAQs. It will be visible in the client's help section.`
								: `This will restore ${reactivateCount} ${reactivateCount === 1 ? "category" : "categories"} and their respective FAQs. They will be visible again in the client's help section.`
						}
						confirmText={
							selectedCategory
								? `YES, REACTIVATE CATEGORY & ${selectedCategory.faqCount ?? 0} FAQs`
								: `YES, REACTIVATE ${reactivateCount} ${reactivateCount === 1 ? "CATEGORY" : "CATEGORIES"} AND THEIR FAQS`
						}
					/>
					<DeleteCategoryModal
						open={deleteOpen}
						onClose={() => {
							setDeleteOpen(false);
							setDeleteCategoryId(null);
						}}
						onConfirm={async () => {
							try {
								if (!deleteCategoryId) {
									setDeleteOpen(false);
									return;
								}
								const res = await faqService.deleteCategories([
									deleteCategoryId,
								]);
								if (res?.success && res?.code === 200) {
									const updated = categories.filter(
										(c) => c.id !== deleteCategoryId,
									);
									setCategories(updated);
									showSuccess(
										"Deleted!",
										"Category deleted successfully.",
									);
								} else {
									const err =
										res?.message ||
										res?.error ||
										"Failed to delete category.";
									showError(err);
								}
							} catch (e) {
								const msg =
									e?.response?.data?.message ||
									e?.message ||
									"Failed to delete category.";
								showError(msg);
							} finally {
								setDeleteOpen(false);
								setDeleteCategoryId(null);
							}
						}}
						categoryTitle={deleteMeta.title}
						faqCount={deleteMeta.faqCount}
					/>
					{editOpen && (
						<AddCategory
							open={editOpen}
							onClose={async () => {
								setEditOpen(false);
								setEditInitial(null);
								try {
									const catsRes =
										await faqService.getCategories({
											category_state: "suspended",
										});
									if (
										catsRes?.success &&
										catsRes?.code === 200
									) {
										const list =
											catsRes.data?.faq_categories ||
											catsRes.data?.data
												?.faq_categories ||
											[];
										const normalized = list.map((c) => ({
											id: c.id,
											title: c.name,
											icon: "notes_info",
											iconId: c.icon_id,
											description: c.description || "",
											verticalId: c.vertical_id,
										}));
										setCategories(normalized);
									}
								} catch (_) {}
							}}
							mode="edit"
							initialValues={{
								id: editInitial?.id,
								name: editInitial?.name,
								icon: editInitial?.icon,
								description: editInitial?.description,
								roles: editInitial?.roles,
							}}
						/>
					)}
				</div>
			)}
		</div>
	);
}
