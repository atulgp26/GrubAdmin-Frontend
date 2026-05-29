import { Suspense } from "react";
import EmployeeLogsClient from "@/components/pages/employees/EmployeeLogsClient";

const Page = () => {
	return (
		<Suspense fallback={null}>
			<EmployeeLogsClient />
		</Suspense>
	);
};

export default Page;