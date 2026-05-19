"use client";
import { usePermissions } from "@/context/PermissionContext";

export default function Can({ permission, module, children, fallback = null }) {
  const { can, loading } = usePermissions();
  if (loading) return null;
  return can(permission, module) ? children : fallback;
}


