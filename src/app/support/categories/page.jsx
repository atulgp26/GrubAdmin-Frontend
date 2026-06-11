"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import SearchWithSuggestions from "@/components/ui/SearchWithSuggestions";
import Icon from "@/components/ui/Icon";
import { faqService } from "@/api/services/faqService";
import { commonService } from "@/api/services/commonService";
import { fetchVerticalOptions } from "@/utils/verticals";
import ExportListModal from "@/components/pages/employees/ExportListModal";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import TakeActionModal from "@/components/pages/support/TakeActionModal";
import ReorderCategoriesModal from "@/components/pages/support/ReorderCategoriesModal";
import DropdownPortal from "@/components/ui/DropdownPortal";
import { BsThreeDotsVertical } from "react-icons/bs";
import { PencilLine, Trash2 } from "lucide-react";
import AddCategory from "@/components/pages/support/addcategory";
import SuspendCategoryModal from "@/components/pages/support/SuspendCategoryModal";
import DeleteCategoryModal from "@/components/pages/support/DeleteCategoryModal";
import InfoPanel from "@/components/common/InfoPanel";
import LoadingDetails from "@/components/ui/LoadingDetails";
import { showSuccess, showError } from "@/components/ui/toast";
import { usePermissions } from "@/context/PermissionContext";

export default function Categories() {
	const router = useRouter();
	const { can } = usePermissions();
	const canViewSupport =
		can("view active resources", "support") || can("view active resources");
	const canViewSuspendedCats =
		can("view suspended categories", "support") ||
		can("view suspended categories");
	const [search, setSearch] = useState("");
	const [exportOpen, setExportOpen] = useState(false);
	const [vertical, setVertical] = useState("all");
	const [selectedRole, setSelectedRole] = useState([]);
	const [verticalOptions, setVerticalOptions] = useState([]);
	const [isActionModalOpen, setIsActionModalOpen] = useState(false);
	const [reorderCategoriesModal, setReorderCategoriesModal] = useState(false);
	const [menuOpen, setMenuOpen] = useState(null);
	const buttonRefs = useRef({});
	const [editOpen, setEditOpen] = useState(false);
	const [editInitial, setEditInitial] = useState(null);
	const [addOpen, setAddOpen] = useState(false);
	const [suspendOpen, setSuspendOpen] = useState(false);
	const [suspendMeta, setSuspendMeta] = useState({ title: "", faqCount: 0 });
	const [suspendCategoryId, setSuspendCategoryId] = useState(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deleteMeta, setDeleteMeta] = useState({ title: "", faqCount: 0 });
	const [deleteCategoryId, setDeleteCategoryId] = useState(null);

	const [categories, setCategories] = useState([]);
	const [allCategories, setAllCategories] = useState([]);
	const [allQuestions, setAllQuestions] = useState([]);
	const [iconBaseUrl, setIconBaseUrl] = useState("");
	const [iconIdToKey, setIconIdToKey] = useState({});
	const fallbackIcons = {
		"Support/Card/gear.svg": "/plug.svg",
		"Support/Card/suitcase-medical.svg": "/troubleshooting.svg",
		"Support/Card/bluetooth-on.svg": "/bluetooth.svg",
		"Support/Card/exclamation-triangle.svg": "/exclamation-triangle.svg",
		"Support/Card/user-shield.svg": "/accountandsupport.svg",
		"Support/Card/question-circle.svg": "/question-mark.svg",
	};
	const [verticalIdToName, setVerticalIdToName] = useState({});
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		if (!selectedRole || selectedRole.length === 0) {
			setVertical("all");
			return;
		}
		const selectedIds = selectedRole.map((v) =>
			v?.id !== undefined ? String(v.id) : String(v),
		);
		if (
			verticalOptions?.length &&
			selectedIds.length === verticalOptions.length
		) {
			setVertical("all");
		} else {
			setVertical(selectedIds);
		}
	}, [selectedRole, verticalOptions]);

	useEffect(() => {
		const loadAll = async () => {
			try {
				const [cfg, iconsRes, verticalsRes, catsRes] =
					await Promise.all([
						commonService.getConfig(),
						commonService.getIcons(),
						fetchVerticalOptions(),
						faqService.getCategories(),
					]);

				if (cfg?.success && cfg?.code === 200) {
					const baseCfg = (cfg.data?.configs || []).find(
						(c) => c.key === "icon_base_url",
					);
					if (baseCfg?.value)
						setIconBaseUrl(`${baseCfg.value}`.replace(/\/+$/, ""));
				}

				if (iconsRes?.success && iconsRes?.code === 200) {
					const map = {};
					(iconsRes.data?.icons || []).forEach((ic) => {
						map[ic.id] = ic.bucket_key;
					});
					setIconIdToKey(map);
				}

				const verticalOptionsData = verticalsRes?.options || [];
				const verticalMap = verticalsRes?.map || {};
				setVerticalIdToName(verticalMap);
				setVerticalOptions(verticalOptionsData);

				if (catsRes?.success && catsRes?.code === 200) {
					const list =
						catsRes.data?.faq_categories ||
						catsRes.data?.data?.faq_categories ||
						[];
					const normalized = list.map((c) => ({
						id: c.id,
						title: c.name,
						iconId: c.icon_id,
						verticalId:
							c.vertical_id !== undefined &&
								c.vertical_id !== null
								? String(c.vertical_id)
								: "",
						description: c.description || "",
						status: c.status,
					}));
					setCategories(normalized);
					setAllCategories(normalized);
					try {
						const questionsPromises = normalized.map((cat) =>
							faqService
								.getFaqsByCategory(cat.id)
								.catch(() => ({ data: { faqs: [] } })),
						);
						const questionsResults =
							await Promise.all(questionsPromises);
						const allQues = [];
						questionsResults.forEach((res, idx) => {
							const faqs =
								res?.data?.faqs || res?.data?.data?.faqs || [];
							faqs.forEach((f) => {
								allQues.push({
									id: f.id,
									question: f.question,
									answer: f.answer || "",
									categoryId: normalized[idx].id,
									categoryName: normalized[idx].title,
								});
							});
						});
						setAllQuestions(allQues);
					} catch (_) { }
				}
			} catch (e) {
			} finally {
				setLoading(false);
			}
		};

		loadAll();
	}, []);

	const searchData = useMemo(() => {
		const categoryItems = allCategories.map((c) => ({
			id: c.id,
			name: c.title,
			code: c.description || "",
			type: "category",
		}));

		const questionItems = allQuestions.map((q) => ({
			id: `question-${q.id}`,
			name: q.question,
			code: `${q.categoryName}${q.answer ? ` - ${q.answer.substring(0, 50)}...` : ""}`,
			type: "question",
			categoryId: q.categoryId,
			questionId: q.id,
		}));

		return [...categoryItems, ...questionItems];
	}, [allCategories, allQuestions]);

	useEffect(() => {
		const run = async () => {
			const q = search?.trim();
			if (!q) {
				setCategories(allCategories);
				return;
			}

			try {
				const res = await faqService.getCategories({
					query: q,
					include_questions: "true",
				});
				if (res?.success && res?.code === 200) {
					const list =
						res.data?.faq_categories ||
						res.data?.data?.faq_categories ||
						[];
					const normalized = list.map((c) => ({
						id: c.id,
						title: c.name,
						iconId: c.icon_id,
						verticalId:
							c.vertical_id !== undefined &&
								c.vertical_id !== null
								? String(c.vertical_id)
								: "",
						description: c.description || "",
						status: c.status,
					}));
					setCategories(normalized);
				}
			} catch (_) { }
		};
		const t = setTimeout(run, 300);
		return () => clearTimeout(t);
	}, [search, allCategories]);

	const filtered = useMemo(() => {
		const s = search.trim().toLowerCase();

		let categoriesToShow = categories;
		if (s) {
			const categoriesWithMatchingQuestions = new Set();
			allQuestions.forEach((q) => {
				const questionMatches = q.question.toLowerCase().includes(s);
				const answerMatches = (q.answer || "")
					.toLowerCase()
					.includes(s);
				if (questionMatches || answerMatches) {
					categoriesWithMatchingQuestions.add(q.categoryId);
				}
			});

			categoriesToShow = categories.filter((c) => {
				const v = vertical;
				const idKey = (c.verticalId ?? "").toString().toLowerCase();
				let matchesVertical = true;
				if (Array.isArray(v)) {
					const selectedSet = new Set(
						v.map(
							(x) =>
								x?.toString?.().toLowerCase?.() ||
								String(x).toLowerCase(),
						),
					);
					matchesVertical = selectedSet.has(idKey);
				} else {
					const selectedKey = (v || "").toString().toLowerCase();
					matchesVertical =
						selectedKey === "all" || idKey === selectedKey;
				}
				const matchesCategoryName =
					c.title.toLowerCase().includes(s) ||
					(c.description || "").toLowerCase().includes(s);
				const hasMatchingQuestions =
					categoriesWithMatchingQuestions.has(c.id);

				return (
					matchesVertical &&
					(matchesCategoryName || hasMatchingQuestions)
				);
			});
		} else {
			categoriesToShow = categories.filter((c) => {
				const v = vertical;
				const idKey = (c.verticalId ?? "").toString().toLowerCase();
				if (Array.isArray(v)) {
					const selectedSet = new Set(
						v.map(
							(x) =>
								x?.toString?.().toLowerCase?.() ||
								String(x).toLowerCase(),
						),
					);
					return selectedSet.has(idKey);
				}
				const selectedKey = (v || "").toString().toLowerCase();
				return selectedKey === "all" || idKey === selectedKey;
			});
		}

		return categoriesToShow;
	}, [search, vertical, categories, verticalIdToName, allQuestions]);

	const exportOptions = useMemo(() => {
		const scopeItems = [
			...verticalOptions.map((opt) => ({
				id: `vertical:${opt.id}`,
				label: `Only ${opt.label}`,
				type: "radio",
			})),
			{ id: "All categories", label: "All categories", type: "radio" },
			{ id: "Only suspended", label: "Only suspended", type: "radio" },
		];

		return [
			{
				group: "scope",
				title: "Scope",
				items: scopeItems,
			},
			{
				group: "details",
				title: "Extra details",
				items: [
					{
						id: "Only published FAQs",
						label: "Only published FAQs",
						type: "radio",
						variant: "gray",
					},
					{
						id: "Only draft FAQs",
						label: "Only draft FAQs",
						type: "radio",
						variant: "gray",
					},
				],
			},
		];
	}, [verticalOptions]);
	const canAdd =
		can("add new category", "support") || can("add new category");
	const canReorder =
		can("reorder categories", "support") || can("reorder categories");
	const canExport =
		can("export active resources", "support") ||
		can("export active resources");
	const actionsData = [
		...(canAdd
			? [
				{
					title: "Add new category",
					description: "Create a new category to organize FAQs.",
					icon: "windows_plus",
					iconColor: "text-[var(--notif-success)]",
					onClick: () => {
						setIsActionModalOpen(false);
						setAddOpen(true);
					},
				},
			]
			: []),
		...(canViewSuspendedCats
			? [
				{
					title: "View suspended categories",
					description:
						"View the categories & FAQs currently suspended.",
					icon: "notes_info",
					iconColor: "text-[var(--notif-error)]",
					onClick: () => router.push("/support/suspended"),
				},
			]
			: []),
		...(canReorder
			? [
				{
					title: "Reorder categories",
					description:
						"Change the display order of active categories.",
					icon: "arrows_up_down",
					iconColor: "text-[var(--color-neutral-light)]",
					onClick: () => {
						const visibleCount = filtered.length;
						if (visibleCount <= 1) {
							const msg =
								visibleCount === 0
									? "No categories to reorder."
									: "Only one category available. Reordering requires 2 or more.";
							showError(msg);
						} else {
							setReorderCategoriesModal(true);
						}
					},
				},
			]
			: []),
		...(canExport
			? [
				{
					title: "Export all",
					description:
						"Export all FAQs and categories for reference.",
					icon: "download",
					iconColor: "text-[var(--color-neutral-light)]",
					onClick: () => setExportOpen(true),
				},
			]
			: []),
	];
	const hasAnyActions = actionsData.length > 0;

	const confirmReorder = async (reorderedData) => {
		try {
			const response = await faqService.reorderCategories(reorderedData, {
				include_questions: true,
			});

			if (response?.success) {
				const catsRes = await faqService.getCategories();
				if (catsRes?.success && catsRes?.code === 200) {
					const list =
						catsRes.data?.faq_categories ||
						catsRes.data?.data?.faq_categories ||
						[];
					const normalized = list.map((c) => ({
						id: c.id,
						title: c.name,
						iconId: c.icon_id,
						verticalId:
							c.vertical_id !== undefined &&
								c.vertical_id !== null
								? String(c.vertical_id)
								: "",
						description: c.description || "",
						status: c.status,
						display_order: c.display_order,
						faqCount: c.faq_count || 0,
					}));
					setAllCategories(normalized);
					setCategories(normalized);
				}
				setReorderCategoriesModal(false);
				showSuccess("Success!", "Categories reordered successfully.");
			} else {
				const errorMsg =
					response?.message ||
					response?.error ||
					"Failed to reorder categories. Please try again.";
				showError(errorMsg);
			}
		} catch (error) {
			const errorMsg =
				error?.response?.data?.message ||
				error?.response?.data?.error ||
				error?.message ||
				"Failed to reorder categories. Please try again.";
			showError(errorMsg);
		}
	};

	const handleExportConfirm = async ({ scope, checked }) => {
		try {
			setExportOpen(false);

			const params = {};

			if (scope === "All categories" || !scope) {
			} else if (scope === "Only suspended") {
				params.category_state = "suspended";
			} else if (scope?.startsWith("vertical:")) {
				const verticalKey = scope.slice("vertical:".length);
				const matchedOption = verticalOptions.find(
					(opt) => String(opt.id) === verticalKey,
				);
				if (matchedOption) {
					params.vertical_id = matchedOption.id;
				} else if (verticalKey) {
					params.vertical_id = verticalKey;
				}
			}

			if (search && search.trim()) {
				params.query = search.trim();
			}

			params.include_questions = true;

			if (checked["Only published FAQs"]) {
				params.publishing_status = "published";
			} else if (checked["Only draft FAQs"]) {
				params.publishing_status = "draft";
			}

			const response = await faqService.exportCategories(params);

			if (response && typeof response === "object" && response.blob) {
				const blob = response.blob;
				const filename =
					response.filename ||
					`faqs_export_${new Date().toISOString().split("T")[0]}.csv`;

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
					if (document.body.contains(link)) {
						document.body.removeChild(link);
					}
				}, 100);

				showSuccess("Success!", "CSV file downloaded successfully.");
			} else {
				showError("Failed to export. Invalid response from server.");
			}
		} catch (error) {
			const errorMessage =
				error.message || "Failed to export FAQs. Please try again.";
			showError(errorMessage);
		}
	};

	const handleAddCategory = () => {
		setAddOpen(true);
	};

	if (!canViewSupport) return null;

	if (loading) {
		return (
			<div className="min-h-[calc(100vh-150px)]">
				<LoadingDetails entity="support categories" />
			</div>
		);
	}

	if (allCategories.length === 0) {
		return (
			<div className="min-h-[calc(100vh-150px)]">
				<div className="flex flex-col">
					<div className="">
						<h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-2">
							Client support management
						</h1>
						<p className="text-base text-[var(--color-stroke-brand)]">
							Oversee the content and resources shown in client
							help sections.
						</p>
					</div>
					<InfoPanel
						description="Create your first category to organize client-facing support content."
						image={null}
						name="No FAQs or categories added yet."
						buttons={[
							{
								text: "ADD CATEGORY",
								icon: "plus",
								className:
									"!px-4 !py-2 rounded-lg font-medium !text-base flex items-center justify-center uppercase",
								variant: "primary",
								onClick: handleAddCategory,
							},
						]}
					/>
				</div>
				{addOpen && (
					<AddCategory
						open={addOpen}
						onClose={async () => {
							setAddOpen(false);
							try {
								const catsRes =
									await faqService.getCategories();
								if (catsRes?.success && catsRes?.code === 200) {
									const list =
										catsRes.data?.faq_categories ||
										catsRes.data?.data?.faq_categories ||
										[];
									const normalized = list.map((c) => ({
										id: c.id,
										title: c.name,
										iconId: c.icon_id,
										verticalId:
											c.vertical_id !== undefined &&
												c.vertical_id !== null
												? String(c.vertical_id)
												: "",
										description: c.description || "",
										status: c.status,
									}));
									setCategories(normalized);
									setAllCategories(normalized);
								}
							} catch (_) { }
						}}
						mode="add"
					/>
				)}
			</div>
		);
	}

	return (
		<div className="min-h-[calc(100vh-150px)]">
			<div className="flex items-center justify-between mb-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
						Client support management
					</h1>
					<p className="text-[var(--color-stroke-brand)]">
						Client support management
					</p>
				</div>
				<div className="flex items-center gap-4">
					{hasAnyActions && (
						<Button
							variant="primary"
							className="btn-size-md-sm !px-3 font-medium"
							onClick={() => setIsActionModalOpen(true)}
						>
							TAKE ACTION
						</Button>
					)}
				</div>
			</div>

			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div className="w-full sm:w-64">
					<SearchWithSuggestions
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						onSelect={(item) => {
							if (item.type === "question") {
								router.push(
									`/support/supportdefaultlogs?category_id=${item.categoryId}&question_id=${item.questionId}`,
								);
							} else {
								setSearch(item.name);
							}
						}}
						data={searchData}
						placeholder="Search FAQs"
						className="[&_input]:!h-8 [&_input]:!py-1"
						clearable={true}
						onClear={() => setSearch("")}
						minChars={1}
					/>
				</div>
				<div className="flex items-center gap-3 ml-auto">
					<div className="text-sm text-[var(--color-stroke-brand)]">
						Showing {filtered.length} of {categories.length}
					</div>
					<div className="w-48">
						<MultiSelectDropdown
							options={verticalOptions}
							selected={selectedRole}
							setSelected={(val) => {
								setSelectedRole(val);
								const ids = Array.isArray(val)
									? val.map((v) =>
										v?.id !== undefined
											? String(v.id)
											: String(v),
									)
									: [];
								if (
									!ids.length ||
									(verticalOptions?.length &&
										ids.length === verticalOptions.length)
								) {
									setVertical("all");
								} else {
									setVertical(ids);
								}
							}}
							placeholder="All verticals"
							hideComponent={true}
							notificationIcon={true}
						/>
					</div>
				</div>
			</div>

			{filtered.length === 0 ? (
				<InfoPanel
					image={null}
					name="No results found"
					description="No categories match your search or filters. Try clearing them."
				/>
			) : (
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
					{filtered.map((cat) => (
						<div
							key={cat.id}
							onClick={() =>
								router.push(
									`/support/supportdefaultlogs?category_id=${cat.id}`,
								)
							}
							className="group border border-[var(--color-stroke-neutral)] hover:border hover:border-2 hover:border-[var(--color-admin-profile-border)] transition-colors rounded-lg bg-white p-6 flex flex-col gap-4 cursor-pointer"
						>
							<div className="relative flex flex-col items-center gap-3 text-center w-full">
								<div className="w-full flex justify-end">
									<button
										ref={(el) =>
											(buttonRefs.current[cat.id] = el)
										}
										onClick={(e) => {
											e.stopPropagation();
											setMenuOpen(
												menuOpen === cat.id
													? null
													: cat.id,
											);
										}}
										className={`p-2 rounded-lg hover:bg-[var(--color-neutral-secondary-bg)] opacity-0 group-hover:opacity-100 transition-opacity ${menuOpen === cat.id
												? "bg-[var(--color-neutral-secondary-bg)] shadow-[0_0_0_2px_var(--color-shadow-actionmenu)]"
												: ""
											}`}
									>
										<BsThreeDotsVertical
											strokeWidth={1}
											className="w-5 h-5 text-[var(--color-stroke-brand)]"
										/>
									</button>
									<DropdownPortal
										targetRef={
											buttonRefs.current[cat.id]
												? {
													current:
														buttonRefs.current[
														cat.id
														],
												}
												: null
										}
										open={menuOpen === cat.id}
										onClose={() => setMenuOpen(null)}
									>
										<div
											onClick={(e) => {
												e.stopPropagation();
											}}
											className="w-56 bg-white border border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] rounded-lg shadow-[4px_4px_8px_0_var(--color-notif-shadow-soft),0px_0px_4px_0_var(--color-notif-shadow-strong)] z-50"
										>
											{(can("edit category", "support") ||
												can("edit category")) && (
													<Button
														variant="profile"
														className="w-full !rounded-b-none text-left btn-size-md-sm px-4 py-2 flex items-center gap-2 text-[var(--color-neutral-secondary)] text-sm"
														onClick={() => {
															setMenuOpen(null);
															setEditInitial({
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
															});
															setEditOpen(true);
														}}
													>
														<PencilLine className="w-5 h-5 text-[var(--color-neutral-light)]" />{" "}
														Edit category
													</Button>
												)}
											{(can(
												"suspend categories",
												"support",
											) ||
												can("suspend categories")) && (
													<Button
														variant="profile"
														className="w-full !rounded-none text-left btn-size-md-sm px-4 py-2 flex items-center gap-2 text-[var(--color-neutral-secondary)] text-sm"
														onClick={async () => {
															setMenuOpen(null);
															let count =
																typeof cat.faqCount ===
																	"number"
																	? cat.faqCount
																	: null;
															if (count === null) {
																try {
																	const res =
																		await faqService.getFaqsByCategory(
																			cat.id,
																		);
																	const faqs =
																		res?.data
																			?.faqs ||
																		res?.data
																			?.data
																			?.faqs ||
																		[];
																	count =
																		Array.isArray(
																			faqs,
																		)
																			? faqs.length
																			: 0;
																} catch (_) {
																	count = 0;
																}
															}
															setSuspendMeta({
																title: cat.title,
																faqCount: count,
															});
															setSuspendCategoryId(
																cat.id,
															);
															setSuspendOpen(true);
														}}
													>
														<Icon
															name="user_wrong"
															className="w-5 h-5 text-[var(--color-neutral-light)]"
														/>{" "}
														Suspend category
													</Button>
												)}
											{(can(
												"delete categories",
												"support",
											) ||
												can("delete categories")) && (
													<Button
														variant="profile"
														className="w-full text-left !rounded-t-none btn-size-md-sm px-4 py-2 flex items-center gap-2 text-[var(--color-neutral-secondary)] text-sm"
														onClick={async () => {
															setMenuOpen(null);
															let count =
																typeof cat.faqCount ===
																	"number"
																	? cat.faqCount
																	: null;
															if (count === null) {
																try {
																	const res =
																		await faqService.getFaqsByCategory(
																			cat.id,
																		);
																	const faqs =
																		res?.data
																			?.faqs ||
																		res?.data
																			?.data
																			?.faqs ||
																		[];
																	count =
																		Array.isArray(
																			faqs,
																		)
																			? faqs.length
																			: null;
																} catch (_) {
																	count = null;
																}
															}
															setDeleteMeta({
																title: cat.title,
																faqCount: count,
															});
															setDeleteCategoryId(
																cat.id,
															);
															setDeleteOpen(true);
														}}
													>
														<Trash2 className="w-5 h-5 text-[var(--notif-error)]" />{" "}
														Delete category
													</Button>
												)}
										</div>
									</DropdownPortal>
								</div>
								{iconIdToKey[cat.iconId] ? (
									<img
										src={
											fallbackIcons[iconIdToKey[cat.iconId]] ||
											`${iconBaseUrl}/${iconIdToKey[cat.iconId]}`
										}
										alt="icon"
										className="w-8 h-8"
										onError={(e) => {
											e.currentTarget.src = "/question-mark.svg";
										}}
									/>
								) : (
									<Icon
										name="notes_info"
										className="w-8 h-8 text-[var(--color-brand-icon)] group-hover:text-[var(--info-panel-view-bg)]"
									/>
								)}
								<div className="text-[var(--color-neutral-primary)] font-semibold text-base break-words whitespace-normal text-center w-full">
									{cat.title}
								</div>
								<p className="text-sm text-[var(--color-stroke-brand)] line-clamp-2">
									{cat.description}
								</p>
								<div className="text-xs text-[var(--color-stroke-brand)]">
									(Visible to{" "}
									{verticalIdToName[cat.verticalId] || "—"})
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			<ExportListModal
				open={exportOpen}
				onClose={() => setExportOpen(false)}
				onConfirm={handleExportConfirm}
				options={exportOptions}
				title=""
				description=""
			/>
			{editOpen && (
				<AddCategory
					open={editOpen}
					onClose={async () => {
						setEditOpen(false);
						setEditInitial(null);
						try {
							const catsRes = await faqService.getCategories();
							if (catsRes?.success && catsRes?.code === 200) {
								const list =
									catsRes.data?.faq_categories ||
									catsRes.data?.data?.faq_categories ||
									[];
								const normalized = list.map((c) => ({
									id: c.id,
									title: c.name,
									iconId: c.icon_id,
									verticalId:
										c.vertical_id !== undefined &&
											c.vertical_id !== null
											? String(c.vertical_id)
											: "",
									description: c.description || "",
									status: c.status,
								}));
								setCategories(normalized);
								setAllCategories(normalized);
							}
						} catch (_) { }
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
			{addOpen && (
				<AddCategory
					open={addOpen}
					onClose={async () => {
						setAddOpen(false);
						try {
							const catsRes = await faqService.getCategories();
							if (catsRes?.success && catsRes?.code === 200) {
								const list =
									catsRes.data?.faq_categories ||
									catsRes.data?.data?.faq_categories ||
									[];
								const normalized = list.map((c) => ({
									id: c.id,
									title: c.name,
									iconId: c.icon_id,
									verticalId:
										c.vertical_id !== undefined &&
											c.vertical_id !== null
											? String(c.vertical_id)
											: "",
									description: c.description || "",
									status: c.status,
								}));
								setCategories(normalized);
								setAllCategories(normalized);
							}
						} catch (_) { }
					}}
					mode="add"
				/>
			)}
			<SuspendCategoryModal
				open={suspendOpen}
				onClose={() => setSuspendOpen(false)}
				onConfirm={async () => {
					try {
						if (!suspendCategoryId) {
							setSuspendOpen(false);
							return;
						}
						const res = await faqService.suspendCategories([
							suspendCategoryId,
						]);
						if (res?.success && res?.code === 200) {
							const updated = categories.filter(
								(c) => c.id !== suspendCategoryId,
							);
							setCategories(updated);
							setAllCategories(
								allCategories.filter(
									(c) => c.id !== suspendCategoryId,
								),
							);
							showSuccess("Success!", `Category suspended.`);
						} else {
							const err =
								res?.message ||
								res?.error ||
								"Failed to suspend category.";
							showError(err);
						}
					} catch (e) {
						const msg =
							e?.response?.data?.message ||
							e?.message ||
							"Failed to suspend category.";
						showError(msg);
					} finally {
						setSuspendOpen(false);
						setSuspendCategoryId(null);
					}
				}}
				categoryTitle={suspendMeta.title}
				faqCount={suspendMeta.faqCount}
			/>
			<DeleteCategoryModal
				open={deleteOpen}
				onClose={() => setDeleteOpen(false)}
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
							setAllCategories(
								allCategories.filter(
									(c) => c.id !== deleteCategoryId,
								),
							);
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
			{hasAnyActions && (
				<TakeActionModal
					open={isActionModalOpen}
					onClose={() => setIsActionModalOpen(false)}
					actions={actionsData}
				/>
			)}
			{
				<ReorderCategoriesModal
					open={reorderCategoriesModal}
					onClose={() => setReorderCategoriesModal(false)}
					onConfirm={confirmReorder}
					items={categories}
				/>
			}
		</div>
	);
}
