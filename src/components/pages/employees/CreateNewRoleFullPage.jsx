import Button from "@/components/ui/Button";
import CheckBox from "@/components/ui/CheckBox";
import FullPageModal from "@/components/ui/FullPageModal";
import SearchInput from "@/components/ui/SearchInput";
import DetailsCollapse from "@/components/ui/DetailsCollapse";
import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import CheckBoxDisable from "@/components/ui/CheckBoxDisable";
import TableCheckbox from "@/components/ui/TableCheckbox";
import { MdDone } from "react-icons/md";
import BoxCountBadge from "@/components/ui/BoxCountBadge";
import CustomTooltip from "@/components/ui/CustomTooltip";
import { commonService } from "@/api/services/commonService";
import { customerService } from "@/api/services/customerService";
import { roleService } from "@/api/services/roleService";
import { showSuccess, showError } from "@/components/ui/toast";

const CreateNewRoleFullPage = ({
	open,
	onClose,
	onSave,
	title,
	description,
	editRole = null,
}) => {
	const [searchValue, setSearchValue] = useState("");
	const [selected, setSelected] = useState([]);
	const [permissions, setPermissions] = useState({});
	const [openCollapse, setOpenCollapse] = useState("");
	const [modules, setModules] = useState([]);
	const [modulePermissions, setModulePermissions] = useState({});
	const [verticalsData, setVerticalsData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isSuperAdmin, setIsSuperAdmin] = useState(false);
	const [showNameTooltip, setShowNameTooltip] = useState(false);
	const [showVerticalsTooltip, setShowVerticalsTooltip] = useState(false);
	const nameFieldRef = useRef(null);
	const verticalsSectionRef = useRef(null);

	// Color mapping for verticals based on their id/name
	const getVerticalColor = (verticalId = "") => {
		const id = verticalId.toLowerCase();
		if (id.includes("delivery")) return "--color-brand-primary-btn";
		if (id.includes("medical")) return "--color-checkbox-medical";
		if (id.includes("hospitality")) return "--color-brand-default";
		if (id.includes("camping")) return "--color-icon-camping";
		return "--color-brand-default";
	};

	// Get hover states for delivery vertical (only one with custom hover)
	const getVerticalHoverStates = (verticalId) => {
		const id = verticalId.toLowerCase();
		if (id === "delivery") {
			return {
				hoverState:
					"border border-[var(--color-brand-primary-btn)] hover:!border-[var(--color-filter-text)] active:!shadow-[0_0_0_2px_var(--color-shadow-select)]",
				checkedHoverState:
					"border border-none hover:!bg-[var(--color-filter-text)] hover:!border-[var(--color-filter-text)] active:!bg-[var(--color-brand-primary-btn)] active:!border-[var(--color-brand-primary-btn)] active:!shadow-[0px_0px_0px_2px_var(--color-shadow-select)]",
			};
		}
		return { hoverState: "", checkedHoverState: "" };
	};

	const CustomCheckbox = ({
		checked,
		onChange,
		colorVar,
		hoverState,
		checkedHoverState,
	}) => {
		const checkedStyle = checked
			? {
					background: `var(${colorVar})`,
					borderColor: `var(${colorVar})`,
				}
			: {
					borderColor: `var(${colorVar})`,
				};

		return (
			<label className="inline-flex items-center justify-center w-6 h-6 cursor-pointer relative">
				<input
					type="checkbox"
					checked={checked}
					onChange={onChange}
					className="absolute opacity-0 w-0 h-0 peer"
				/>
				<span
					className={`w-5 h-5 flex items-center justify-center rounded border transition-all duration-150 ${hoverState} peer-active:scale-95 ${checked ? `${checkedHoverState}` : "bg-white"}`}
					style={checkedStyle}
				>
					{checked && (
						<svg
							width="16"
							height="16"
							viewBox="0 0 20 20"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M5 10.5L9 14L15 7"
								stroke="white"
								strokeWidth="2.2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					)}
				</span>
			</label>
		);
	};

	const toggleModule = (name) => {
		setSelected((prev) =>
			prev.includes(name)
				? prev.filter((m) => m !== name)
				: [...prev, name],
		);
	};

	const togglePermission = (module, id) => {
		setPermissions((prev) => ({
			...prev,
			[module]: {
				...prev[module],
				[id]: !prev[module]?.[id],
			},
		}));
	};

	const toggleVertical = (id) => {
		setPermissions((prev) => ({
			...prev,
			verticals: {
				...prev.verticals,
				[id]: !prev.verticals?.[id],
			},
		}));
	};

	const getModuleCounts = (module) => {
		const total = modulePermissions[module]?.length || 0;
		const used = Object.values(permissions[module] || {}).filter(
			Boolean,
		).length;
		return { total, used };
	};

	const getVerticalCounts = () => {
		const total = verticalsData.length;
		const used = Object.values(permissions.verticals || {}).filter(
			Boolean,
		).length;
		return { total, used };
	};

	// Handle save with API call
	const handleSaveRole = async () => {
		console.log("handleSaveRole called", {
			searchValue,
			selected,
			permissions,
			editRole,
		});

		// Validate role name
		if (!searchValue || !searchValue.trim()) {
			setShowNameTooltip(true);
			if (nameFieldRef?.current) {
				try {
					nameFieldRef.current.scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
				} catch (_) {}
			}
			setTimeout(() => setShowNameTooltip(false), 2000);
			return;
		}

		// Validate at least one vertical selected (only if not super admin)
		if (!isSuperAdmin && getVerticalCounts().used === 0) {
			setOpenCollapse("verticals");
			setShowVerticalsTooltip(true);
			if (verticalsSectionRef?.current) {
				try {
					verticalsSectionRef.current.scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
				} catch (_) {}
			}
			setTimeout(() => setShowVerticalsTooltip(false), 2000);
			return;
		}

		try {
			// Transform permissions to API format
			const permissionsData = {};

			// Only process permissions if not super admin
			if (!isSuperAdmin) {
				// Get the module key map from modulePermissions
				const moduleKeyMap = modulePermissions._moduleKeyMap || {};

				selected.forEach((moduleName) => {
					// Get the checked permissions state for this module
					const modulePermissionsObj = permissions[moduleName] || {};
					// Get the list of all permission objects for this module from state
					const modulePermissionsList =
						modulePermissions[moduleName] || [];

					console.log(`Processing module: ${moduleName}`, {
						modulePermissionsObj,
						modulePermissionsList,
						moduleKeyMap,
						originalKey: moduleKeyMap[moduleName],
					});

					// Get checked permissions for this module - use exact label from API
					const checkedPermissions = modulePermissionsList
						.filter((perm) => {
							const isChecked =
								modulePermissionsObj[perm.id] === true;
							return isChecked;
						})
						.map((perm) => perm.label); // Use the original label from API exactly as it comes

					console.log(
						`Checked permissions for ${moduleName}:`,
						checkedPermissions,
					);

					// Only add module if it has permissions
					if (checkedPermissions.length > 0) {
						// Use original module key from API (stored in _moduleKeyMap) - this is critical!
						const moduleKey =
							moduleKeyMap[moduleName] ||
							moduleName.charAt(0).toLowerCase() +
								moduleName.slice(1);
						permissionsData[moduleKey] = checkedPermissions;
						console.log(
							`Added module "${moduleName}" with API key "${moduleKey}":`,
							checkedPermissions,
						);
					}
				});
			}

			// Add selected verticals inside permissions object with their IDs when not super admin
			if (!isSuperAdmin) {
				const selectedVerticalIds = Object.entries(
					permissions.verticals || {},
				)
					.filter(([, isChecked]) => !!isChecked)
					.map(([id]) => {
						const vertical = verticalsData.find((v) => v.id === id);
						return vertical ? vertical.id : null; // Use original ID (lowercase) for API, not the capitalized label
					})
					.filter(Boolean); // Remove any null values
				if (selectedVerticalIds.length > 0) {
					permissionsData.verticals = selectedVerticalIds;
				}
			}

			// Prepare API payload - ensure structure matches update flow exactly
			const roleData = {
				name: searchValue.trim(),
				permissions: permissionsData,
				is_super_admin: isSuperAdmin,
			};

			const roleIdForUpdate = editRole?.originalData?.id || editRole?.id;
			// Convert roleId to string to ensure proper URL construction
			const roleIdString = roleIdForUpdate
				? String(roleIdForUpdate).trim()
				: null;

			console.log(
				"Calling API - Edit mode:",
				!!editRole,
				"Role ID:",
				roleIdString,
			);
			console.log("API payload:", JSON.stringify(roleData, null, 2));
			console.log("Permissions data structure:", permissionsData);
			console.log("Verticals in permissions:", permissionsData.verticals);
			console.log("Selected role:", editRole);
			console.log("Form values:", {
				id: editRole?.id,
				name: editRole?.name,
			});
			console.log("Submitting role ID:", roleIdString);
			console.log("Permissions:", permissionsData);

			// Call appropriate API - ensure create uses same structure as update
			const response =
				editRole && roleIdString
					? await roleService.updateRole(roleIdString, roleData)
					: await roleService.createRole({
							name: searchValue.trim(),
							permissions: permissionsData,
							is_super_admin: isSuperAdmin,
						});

			console.log("API Response:", response);

			if (response.success && response.code === 200) {
				const action = editRole ? "updated" : "created";
				showSuccess(
					"Success",
					`${searchValue.trim()} role has been ${action}.`,
				);
				// Calculate new permissions count for summary
				const permissionsCount = Object.values(
					permissionsData || {},
				).reduce(
					(acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0),
					0,
				);
				onSave({
					roleName: searchValue.trim(),
					permissionsCount,
					isEdit: !!editRole,
				});
			} else {
				const errorMsg =
					response.error ||
					response.message ||
					`Failed to ${editRole ? "update" : "create"} role.`;
				showError(errorMsg);
			}
		} catch (error) {
			console.error(
				`Error ${editRole ? "updating" : "creating"} role:`,
				error,
			);
			let errorMessage = `Failed to ${editRole ? "update" : "create"} role. Please try again.`;

			if (error?.response?.data?.error) {
				errorMessage = error.response.data.error;
			} else if (error?.response?.data?.message) {
				errorMessage = error.response.data.message;
			} else if (error?.message) {
				errorMessage = error.message;
			}

			showError(errorMessage);
		}
	};

	// Fetch permissions and verticals from API
	useEffect(() => {
		const fetchData = async () => {
			if (!open) return;

			setLoading(true);
			try {
				// Fetch both permissions and verticals in parallel
				const [permissionsResponse, verticalsResponse] =
					await Promise.all([
						commonService.getPermissions(),
						customerService.getVerticals(),
					]);

				// Process permissions
				if (
					permissionsResponse.success &&
					permissionsResponse.data?.permissions
				) {
					const permissionsData =
						permissionsResponse.data.permissions;

					// Transform API response to component format
					const transformedModules = [];
					const transformedPermissions = {};

					// Helper function to convert module name (e.g., "dashboard" -> "Dashboard")
					const capitalizeFirst = (str) => {
						return str.charAt(0).toUpperCase() + str.slice(1);
					};

					// Helper function to convert permission string to id format
					const toId = (str) => {
						return str
							.toLowerCase()
							.replace(/\s+/g, "")
							.replace(/[^a-z0-9]/g, "");
					};

					// Process each module
					Object.keys(permissionsData).forEach((moduleKey) => {
						const moduleName = capitalizeFirst(moduleKey);
						const permissionList = permissionsData[moduleKey];

						// Add to modules array with original key for API
						transformedModules.push({
							name: moduleName,
							originalKey: moduleKey, // Store original API key
						});

						// Transform permissions - store with both capitalized name and original key
						transformedPermissions[moduleName] = permissionList.map(
							(permission, index) => ({
								id: toId(permission),
								label: permission,
								type: index === 0 ? "disabled" : "checkbox", // First permission is disabled
							}),
						);

						// Also store the original module key mapping
						if (!transformedPermissions._moduleKeyMap) {
							transformedPermissions._moduleKeyMap = {};
						}
						transformedPermissions._moduleKeyMap[moduleName] =
							moduleKey;
					});

					setModules(transformedModules);
					setModulePermissions(transformedPermissions);
				}

				// Process verticals
				if (
					verticalsResponse.success &&
					verticalsResponse.code === 200
				) {
					const apiVerticals =
						verticalsResponse.data?.verticals ||
						verticalsResponse.data?.data?.verticals ||
						[];

					// Transform verticals to component format
					const transformedVerticals = apiVerticals.map((v) => {
						const id = (v?.name || v?.id || v)
							.toString()
							.toLowerCase();
						const label =
							typeof v === "string"
								? v.charAt(0).toUpperCase() +
									v.slice(1).toLowerCase()
								: v?.name || id;
						const color = getVerticalColor(id);
						const hoverStates = getVerticalHoverStates(id);
						console.log(color, hoverStates, id);

						return {
							id: id.toLowerCase(),
							label: label,
							color: color,
							hoverState: hoverStates.hoverState,
							checkedHoverState: hoverStates.checkedHoverState,
						};
					});

					setVerticalsData(transformedVerticals);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [open]);

	// Populate form when editing a role
	useEffect(() => {
		if (open && editRole && !loading && verticalsData.length > 0) {
			// Set role name
			setSearchValue(editRole.name || "");

			// Set super admin flag
			setIsSuperAdmin(
				editRole.originalData?.is_super_admin === true || false,
			);

			// Populate modules and permissions from permissions_json
			const rolePermissionsJson =
				editRole.originalData?.permissions_json || {};
			const selectedModules = [];
			const permissionsState = {};

			// Helper to convert permission label to id format
			const toId = (str) => {
				return str
					.toLowerCase()
					.replace(/\s+/g, "")
					.replace(/[^a-z0-9]/g, "");
			};

			// Process each module in permissions_json (skip 'verticals' key as it's not a module)
			Object.keys(rolePermissionsJson).forEach((moduleKey) => {
				// Skip 'verticals' as it's not a permission module
				if (moduleKey === "verticals") return;

				const moduleName =
					moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1);
				const permissionLabels = rolePermissionsJson[moduleKey];

				if (
					Array.isArray(permissionLabels) &&
					permissionLabels.length > 0
				) {
					selectedModules.push(moduleName);

					// Mark permissions as checked
					permissionsState[moduleName] = {};
					permissionLabels.forEach((label) => {
						const permId = toId(label);
						permissionsState[moduleName][permId] = true;
					});
				}
			});

			setSelected(selectedModules);

			// Populate verticals
			// IMPORTANT: Verticals are stored inside permissions_json.verticals (array of vertical names)
			const roleVerticals =
				rolePermissionsJson?.verticals || // Check inside permissions_json first
				editRole.originalData?.verticals ||
				editRole.originalData?.vertical_ids ||
				editRole.originalData?.verticals_json ||
				[];

			console.log("Edit role verticals from API:", roleVerticals);
			console.log("Edit role permissions_json:", rolePermissionsJson);
			console.log("Available verticalsData:", verticalsData);

			// Normalize verticals from API to lowercase for comparison
			const normalizedRoleVerticals = Array.isArray(roleVerticals)
				? roleVerticals.map((v) => {
						if (typeof v === "string")
							return v.toLowerCase().trim();
						return (v?.id || v?.name || v)
							?.toString()
							.toLowerCase()
							.trim();
					})
				: [];

			console.log(
				"Edit role normalized vertical IDs:",
				normalizedRoleVerticals,
			);

			// Set verticals in permissions state
			// Match vertical names from API with vertical IDs from verticalsData
			if (normalizedRoleVerticals.length > 0) {
				permissionsState.verticals = {};

				normalizedRoleVerticals.forEach((vNameFromAPI) => {
					// Try to find matching vertical in verticalsData by ID or label
					const matchingVertical = verticalsData.find((v) => {
						const vId = v.id?.toLowerCase().trim();
						const vLabel = v.label?.toLowerCase().trim();
						return vId === vNameFromAPI || vLabel === vNameFromAPI;
					});

					// Use the vertical's ID from verticalsData if found, otherwise use the name from API
					const verticalKey = matchingVertical
						? matchingVertical.id
						: vNameFromAPI;
					permissionsState.verticals[verticalKey] = true;

					// Also set by the normalized name for backward compatibility
					permissionsState.verticals[vNameFromAPI] = true;
				});

				console.log(
					"Setting verticals in permissionsState:",
					permissionsState.verticals,
				);
			}

			setPermissions(permissionsState);

			console.log("Populated edit form:", {
				searchValue: editRole.name,
				selectedModules,
				permissionsState,
			});
		}
	}, [open, editRole, loading, verticalsData]);

	// Reset state when modal closes
	useEffect(() => {
		if (!open) {
			setSelected([]);
			setPermissions({});
			setOpenCollapse("");
			setSearchValue("");
			setIsSuperAdmin(false);
		}
	}, [open]);

	if (!open) return null;

	if (loading) {
		return (
			<FullPageModal open={open} onClose={onClose}>
				<div className="h-screen bg-white flex items-center justify-center">
					<div className="text-[var(--color-neutral-secondary)]">
						Loading...
					</div>
				</div>
			</FullPageModal>
		);
	}

	return (
		<FullPageModal open={open} onClose={onClose}>
			<div className="h-screen bg-white flex flex-col">
				{/* Fixed Header */}
				<div className="flex-shrink-0">
					<div className="w-full py-4">
						<Button
							variant="grayOutline"
							className="flex gap-2 mx-3 w-fit items-center btn-size-md-sm"
							onClick={onClose}
						>
							<ArrowLeft className="w-4 h-4" />
							GO BACK
						</Button>
						<div className="border-b border-[var(--color-stroke-neutral)] my-4"></div>
					</div>
				</div>
				<div className="text-left mb-8 ml-8">
					<h1 className="text-[var(--color-neutral-primary)] font-semibold text-2xl mb-2">
						{title || `You are creating a new role`}
					</h1>
					<p className="text-[var(--color-stroke-brand)]">
						{description ||
							`Roles define what your employees can and cannot do inside the platform.`}
					</p>
				</div>

				{/* Main Content - Centered */}
				<div className="flex-1 flex items-center justify-center overflow-y-auto">
					<div className="w-full px-6">
						<div className="flex flex-col gap-6">
							<div className="flex justify-center items-start">
								<div className="grid grid-cols-1 lg:grid-cols-10 gap-10 w-full mx-26">
									<div className="lg:col-span-4 flex flex-col">
										<div
											className="mb-6"
											ref={nameFieldRef}
										>
											<span className="text-[var(--color-neutral-secondary)] pb-3 block">
												Give your role a unique name
											</span>
											<div className="relative">
												<SearchInput
													value={searchValue}
													onChange={(e) =>
														setSearchValue(
															e.target.value,
														)
													}
													onClear={() => {
														setSearchValue("");
													}}
													onBlur={() => {}}
													placeholder="Role name"
													className="[&_input]:!h-[48px] [&_input]:!py-1"
													padding="!py-3 !px-4"
													height="!h-12"
													searchIconHidden
												/>
												{showNameTooltip && (
													<div className="mt-1 z-10 bg-white border border-[var(--color-stroke-neutral)] text-[var(--color-neutral-secondary)] text-xs rounded px-2 py-1 shadow-[0_2px_8px_0_var(--color-notif-shadow-soft),0px_0px_4px_0_var(--color-notif-shadow-strong)]">
														Please enter role name
													</div>
												)}
											</div>
										</div>

										<div className="mb-6">
											<div className="flex items-center py-2">
												<CheckBox
													type="checkbox"
													checked={isSuperAdmin}
													onChange={(e) => {
														setIsSuperAdmin(
															e.target.checked,
														);
														// Clear selections when super admin is checked
														if (e.target.checked) {
															setSelected([]);
															setPermissions({});
														}
													}}
												/>
												<span className="text-[var(--color-neutral-secondary)] text-lg pl-3 pr-2">
													Super Admin
												</span>
											</div>
											{isSuperAdmin && (
												<p className="text-[var(--color-stroke-brand)] text-sm mt-1 ml-7">
													Super Admin has access to
													all permissions and modules
												</p>
											)}
										</div>

										{!isSuperAdmin && (
											<div className="flex flex-col">
												<span className="text-[var(--color-neutral-secondary)] pb-3 block">
													Select modules for access
													(multiple)
												</span>
												{modules.map((module) => {
													const { used, total } =
														getModuleCounts(
															module.name,
														);
													return (
														<div
															key={module.name}
															className="flex items-center py-2"
														>
															<CheckBox
																type="checkbox"
																checked={selected.includes(
																	module.name,
																)}
																onChange={() =>
																	toggleModule(
																		module.name,
																	)
																}
															/>
															<span className="text-[var(--color-neutral-secondary)] text-lg pl-3 pr-2">
																{module.name}
															</span>
															<span className="text-[var(--color-stroke-brand)]">
																({used} of{" "}
																{total}{" "}
																permissions)
															</span>
														</div>
													);
												})}
											</div>
										)}
									</div>

									{!isSuperAdmin && (
										<div className="lg:col-span-6 flex flex-col justify-start pt-16">
											<DetailsCollapse
												title={`Verticals (${getVerticalCounts().used} of ${getVerticalCounts().total})`}
												open={
													openCollapse === "verticals"
												}
												onClick={() =>
													setOpenCollapse(
														openCollapse ===
															"verticals"
															? ""
															: "verticals",
													)
												}
											>
												<div ref={verticalsSectionRef}>
													{showVerticalsTooltip && (
														<div className="mb-2 z-10 bg-white border border-[var(--color-stroke-neutral)] text-[var(--color-neutral-secondary)] text-xs rounded px-2 py-1 shadow-[0_2px_8px_0_var(--color-notif-shadow-soft),0px_0px_4px_0_var(--color-notif-shadow-strong)]">
															Select at least one
															vertical
														</div>
													)}
													<div className="grid grid-cols-1 md:grid-cols-2">
														{verticalsData.map(
															(v) => {
																// Check if this vertical is selected - match by both ID and label (normalized)
																const normalizedVId =
																	v.id
																		?.toLowerCase()
																		.trim();
																const normalizedVLabel =
																	v.label
																		?.toLowerCase()
																		.trim();
																const isChecked =
																	permissions
																		.verticals?.[
																		normalizedVId
																	] ||
																	permissions
																		.verticals?.[
																		normalizedVLabel
																	] ||
																	false;

																return (
																	<div
																		key={
																			v.id
																		}
																		className="flex items-center px-6 border-b gap-2"
																	>
																		<CustomCheckbox
																			type="checkbox"
																			checked={
																				isChecked
																			}
																			onChange={() =>
																				toggleVertical(
																					v.id,
																				)
																			}
																			colorVar={
																				v.color
																			}
																			hoverState={
																				v.hoverState
																			}
																			checkedHoverState={
																				v.checkedHoverState
																			}
																		/>
																		<span className="text-[var(--color-neutral-secondary)] py-4">
																			{
																				v.label
																			}
																		</span>
																	</div>
																);
															},
														)}
													</div>
												</div>
											</DetailsCollapse>

											{selected.length > 0 &&
												selected.map((module) =>
													modulePermissions[
														module
													] ? (
														<DetailsCollapse
															key={module}
															title={`${module} (${getModuleCounts(module).used} of ${getModuleCounts(module).total})`}
															open={
																openCollapse ===
																module
															}
															onClick={() =>
																setOpenCollapse(
																	openCollapse ===
																		module
																		? ""
																		: module,
																)
															}
														>
															<div className="grid grid-cols-1 md:grid-cols-2">
																{modulePermissions[
																	module
																].map((opt) => (
																	<div
																		key={
																			opt.id
																		}
																		className="flex items-center px-6 border-b gap-2"
																	>
																		<BoxCountBadge
																			asText
																			tooltipSide="bottom"
																			tooltipAlign="start"
																			tooltipContent="view"
																		>
																			{opt.type ===
																			"disabled" ? (
																				<CheckBoxDisable
																					type="checkbox"
																					checked={
																						permissions[
																							module
																						]?.[
																							opt
																								.id
																						] ||
																						false
																					}
																					onChange={() =>
																						togglePermission(
																							module,
																							opt.id,
																						)
																					}
																				/>
																			) : (
																				<TableCheckbox
																					type="checkbox"
																					checked={
																						permissions[
																							module
																						]?.[
																							opt
																								.id
																						] ||
																						false
																					}
																					onChange={() =>
																						togglePermission(
																							module,
																							opt.id,
																						)
																					}
																				/>
																			)}
																		</BoxCountBadge>
																		<span className="text-[var(--color-neutral-secondary)] py-4">
																			{
																				opt.label
																			}
																		</span>
																	</div>
																))}
															</div>
														</DetailsCollapse>
													) : null,
												)}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Fixed Footer */}
				<div className="flex-shrink-0">
					<div className="px-6">
						<hr className="border-t border-[var(--color-box-border)] w-full my-6" />

						<div className="flex items-center justify-between gap-4 pb-6">
							<Button
								variant="grayOutline"
								onClick={onClose}
								className="px-6 sm:px-28 py-3"
							>
								CANCEL
							</Button>
							<Button
								variant="disabledPrimary"
								className="flex items-center gap-2 px-6 sm:px-28 py-3"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									console.log("Button clicked!");
									handleSaveRole();
								}}
							>
								{title ? (
									"SAVE CHANGES"
								) : (
									<>
										{(isSuperAdmin ||
											selected.length > 0) && (
											<MdDone className="w-5 h-5" />
										)}
										SAVE ROLE
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</FullPageModal>
	);
};

export default CreateNewRoleFullPage;
