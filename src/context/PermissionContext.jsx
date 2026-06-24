"use client";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { accountService } from "@/api/services/accountService";

const PermissionContext = createContext({
  user: null,
  permissions: new Set(),
  permissionsByModule: {},
  loading: true,
  can: () => false,
  refresh: async () => { },
});

export function PermissionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [permissionsByModule, setPermissionsByModule] = useState({});

  const flattenPermissions = useCallback((permissionsJson) => {
    const set = new Set();
    if (!permissionsJson || typeof permissionsJson !== "object") return set;
    try {
      Object.values(permissionsJson).forEach((value) => {
        if (Array.isArray(value)) {
          value.forEach((perm) => {
            if (typeof perm === "string" && perm.trim()) {
              set.add(perm.trim().toLowerCase());
            }
          });
        }
      });
    } catch (_) {
      // ignore malformed values
    }
    return set;
  }, []);

  const buildPermissionsByModule = useCallback((permissionsJson) => {
    const map = {};
    if (!permissionsJson || typeof permissionsJson !== "object") return map;
    try {
      Object.entries(permissionsJson).forEach(([moduleName, value]) => {
        if (!Array.isArray(value)) return;
        const set = new Set();
        value.forEach((perm) => {
          if (typeof perm === "string" && perm.trim()) {
            set.add(perm.trim().toLowerCase());
          }
        });
        map[String(moduleName).toLowerCase()] = set;
      });
    } catch (_) {
      // ignore malformed
    }
    return map;
  }, []);

  const load = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    try {
      // Validate session directly via getProfile - returns user data if authenticated
      // This is more reliable than verifyAuthenticated as it confirms actual session
      const response = await accountService.getProfile();

      if (response?.success && response?.code === 200) {
        const u =
          response?.data?.user ||
          response?.data ||
          null;

        setUser(u);

        const sourcePermissions =
          u?.permissions_json ||
          u?.role?.permissions_json;

        const pset =
          flattenPermissions(sourcePermissions);

        setPermissions(pset);

        const byModule =
          buildPermissionsByModule(sourcePermissions);

        setPermissionsByModule(byModule);
      } else {
        setUser(null);
        setPermissions(new Set());
        setPermissionsByModule({});
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  }, [flattenPermissions, buildPermissionsByModule]);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh permissions whenever auth cookie changes (login/logout) or tab gains focus
  useEffect(() => {
    const onAuthChanged = () => { load(true); };
    const onFocus = () => { load(true); };
    if (typeof window !== 'undefined') {
      window.addEventListener('auth-changed', onAuthChanged);
      window.addEventListener('focus', onFocus);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-changed', onAuthChanged);
        window.removeEventListener('focus', onFocus);
      }
    };
  }, [load]);

const can = useCallback(
  (permission, module) => {

    // IMPORTANT:
    // Prevent false negatives while loading
    if (loading) {
      return null;
    }

    if (!permission) {
      return false;
    }

    // Super admin bypass
    if (
      user?.is_super_admin ||
      user?.role?.is_super_admin
    ) {
      return true;
    }

    const perm =
      String(permission).toLowerCase();

    if (module) {

      const mod =
        String(module).toLowerCase();

      const set =
        permissionsByModule[mod];

      return !!set && set.has(perm);
    }

    return permissions.has(perm);

  },
  [
    loading,
    permissions,
    permissionsByModule,
    user
  ]
);

  const value = useMemo(
    () => ({ user, permissions, permissionsByModule, loading, can, refresh: load }),
    [user, permissions, permissionsByModule, loading, can, load]
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissions() {
  return useContext(PermissionContext);
}

export default PermissionContext;


