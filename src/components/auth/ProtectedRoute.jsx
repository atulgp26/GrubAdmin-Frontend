"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isInitialized, isLoading, router]);

  if (!isInitialized || isLoading) return null;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}