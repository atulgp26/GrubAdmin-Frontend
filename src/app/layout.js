import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import { PermissionProvider } from "@/context/PermissionContext";
import { AuthProvider } from "@/context/AuthContext";
import { ImpersonationProvider } from "@/context/ImpersonationContext";
import ToastProvider from "@/components/ui/ToastProvider";
// import MobileNotSupported from "@/components/ui/MobileNotSupported";

export const metadata = {
  title: "GrubPac",
  description: "GrubPac",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* <MobileNotSupported /> */}
        <ToastProvider />
        <AuthProvider>
          <PermissionProvider>
            <ImpersonationProvider>
              <ClientLayout>{children}</ClientLayout>
            </ImpersonationProvider>
          </PermissionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}