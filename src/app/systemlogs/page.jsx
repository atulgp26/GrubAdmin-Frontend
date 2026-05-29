import { Suspense } from "react";
import SystemLogs from "@/components/pages/system/SystemLogs";

const Page = () => {
  return (
    <Suspense fallback={null}>
      <div className="flex">
        <SystemLogs />
      </div>
    </Suspense>
  );
};

export default Page;

