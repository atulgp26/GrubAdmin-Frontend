"use client";
import { useEffect, useState } from "react";
import { employeeService } from "@/api/services/employeeService";

export default function LogsSidebar({ currentId, preSelectId, onSelect }) {
	const [employees, setEmployees] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchEmployees = async () => {
			try {
				setLoading(true);
				setError(null);
				const response = await employeeService.getAdmins({
					page: 1,
					limit: 10,
				});

				if (
					response.success &&
					response.code === 200 &&
					response.data?.admins
				) {
					const mapped = response.data.admins.map((admin) => ({
						id: admin.id,
						name: `${admin.first_name} ${admin.last_name}`.trim(),
						empId: admin.employee_id
							? `#${admin.employee_id}`
							: null,
						role: admin.role?.name || "—",
						status: admin.status,
					}));
					setEmployees(mapped);

					// Auto-select employee: if preSelectId is set, use it; otherwise use first
					if (!currentId && mapped.length > 0) {
						if (preSelectId) {
							// Find the employee with the preSelectId
							const foundEmployee = mapped.find(
								(emp) => emp.id === preSelectId,
							);
							if (foundEmployee) {
								onSelect?.(foundEmployee);
							} else {
								// If not found, select first
								onSelect?.(mapped[0]);
							}
						} else {
							// Select first if no preSelectId
							onSelect?.(mapped[0]);
						}
					}
				} else {
					setError("Failed to load employees.");
				}
			} catch (err) {
				console.error("Error fetching employees:", err);
				setError("Failed to load employees.");
			} finally {
				setLoading(false);
			}
		};

		fetchEmployees();
	}, []);

	return (
		<div className="w-60 bg-white flex flex-col h-full">
			<div className="flex-1 overflow-y-auto border-r border-[var(--color-stroke-neutral)]">
				{loading && (
					<div className="p-4 text-sm text-[var(--color-neutral-light)]">
						Loading...
					</div>
				)}
				{error && (
					<div className="p-4 text-sm text-red-500">{error}</div>
				)}
				{!loading && !error && employees.length === 0 && (
					<div className="p-4 text-sm text-[var(--color-neutral-light)]">
						No employees found.
					</div>
				)}
				{!loading &&
					!error &&
					employees.map((employee) => {
						const isActive = employee.id === currentId;
						return (
							<button
								key={employee.id}
								type="button"
								onClick={() => onSelect?.(employee)}
								className={`flex w-full items-center px-4 border-b border-[var(--color-stroke-neutral)] text-left transition-all ${
									isActive
										? "py-4 bg-[var(--sidebar-active-bg)]"
										: "py-4 hover:bg-[var(--color-alert-warm-bg)]"
								}`}
							>
								<div className="leading-tight flex-1">
									<div className="flex items-center font-semibold text-base text-[var(--color-neutral-secondary)]">
										{employee.name}
									</div>
									<div className="flex text-sm text-[var(--color-stroke-brand)] font-normal pt-1">
										{employee.empId
											? `${employee.empId} | `
											: ""}
										{employee.role}
									</div>
								</div>
							</button>
						);
					})}
				{!loading && !error && employees.length > 0 && (
					<div className="p-4 text-xs text-[var(--color-neutral-light)] border-t border-[var(--color-stroke-neutral)]">
						Select an employee to view logs
					</div>
				)}
			</div>
		</div>
	);
}
