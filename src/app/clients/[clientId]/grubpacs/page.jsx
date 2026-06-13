"use client";
import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import GrubPacsTable from "@/components/pages/grubpacs/GrubpacsTable";
import { boxService } from "@/api/services/boxService";
import { showError } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingDetails from "@/components/ui/LoadingDetails";
import EmptyState from "@/components/ui/EmptyState";
import { IoChevronBack } from "react-icons/io5";
import { formatDate } from "@/utils/formatDate";

export default function ClientGrubpacsPage({ params }) {
	const { clientId } = params;
	const router = useRouter();
	const { isAuthenticated, isLoading: authLoading } = useAuth();

	const [grubpacs, setGrubpacs] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/login");
		}
	}, [isAuthenticated, authLoading, router]);

	const fetchGrubpacs = async () => {
		setLoading(true);
		try {
			const res = await boxService.getBoxes({
				page_number: 1,
				page_size: 1000,
			});
			if (res?.success && res?.data) {
				setGrubpacs(res.data.boxes || []);
			}
		} catch (e) {
			console.error("Failed to fetch grubpacs:", e);
			showError("Failed to load GrubPacs");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (isAuthenticated) {
			fetchGrubpacs();
		}
	}, [isAuthenticated]);

	const clientGrubpacs = useMemo(
		() =>
			grubpacs
				.filter((g) => g.client?.id === clientId)
				.map((g) => ({
					id: g.id,
					name: g.name,
					code: g.box_id,
					clientName: g.client?.name ?? null,
					clientId: g.client?.id ?? null,
					client: g.client ?? null,
					customerId: g.client?.id ?? null,
					status: g.status,
					statusDisplay:
						g.status === "suspended" ? "Inactive" : g.status,
					updatedOn: formatDate(g.updated_at),
					assignment: "assigned",
					vertical: g.vertical,
				})),
		[grubpacs, clientId],
	);

	if (authLoading) return null;

	if (loading) {
		return (
			<div className="min-h-[calc(100vh-150px)]">
				<LoadingDetails entity="GrubPacs" />
			</div>
		);
	}

	return (
		<div className="w-full">
			<div className="flex items-center gap-3 mb-6">
				<Button
					variant="cancel"
					onClick={() => router.back()}
					className="p-2 rounded-lg transition-colors"
					aria-label="Go back"
				>
					<IoChevronBack className="w-4 h-4 text-[var(--color-stroke-brand)]" />
				</Button>
				<h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
					Client GrubPacs
				</h1>
			</div>

			{clientGrubpacs.length === 0 ? (
				<EmptyState
					title="No GrubPacs yet"
					description="This client does not have any GrubPacs assigned."
					buttonLabel={null}
				/>
			) : (
				<>
					<p className="text-sm text-[var(--color-stroke-brand)] mb-4">
						Showing {clientGrubpacs.length} GrubPac
						{clientGrubpacs.length !== 1 ? "s" : ""} for this
						client.
					</p>
					<GrubPacsTable
						data={clientGrubpacs}
						selectedItems={[]}
						onSelectAll={() => {}}
						onSelectItem={() => {}}
						onRowAction={() => {}}
					/>
				</>
			)}
		</div>
	);
}
