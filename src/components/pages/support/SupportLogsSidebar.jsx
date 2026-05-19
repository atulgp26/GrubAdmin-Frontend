import { useEffect, useState } from "react";
import { usePermissions } from "@/context/PermissionContext";
import { faqService } from "@/api/services/faqService";
import { customerService } from "@/api/services/customerService";
import { useRouter, useSearchParams } from "next/navigation";

const normalizeVerticalOption = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number") {
    const id = String(value);
    return { id, label: id.charAt(0).toUpperCase() + id.slice(1).toLowerCase() };
  }
  if (typeof value === "object") {
    const id = value.id ?? value.value ?? value.code ?? value.name;
    if (id === undefined || id === null) return null;
    const labelSource = value.name ?? value.label ?? id;
    return {
      id: String(id),
      label: typeof labelSource === "string" ? labelSource : String(labelSource),
    };
  }
  return null;
};

const buildVisibleLabel = (mapping, raw) => {
  const toTitle = (s) => (typeof s === "string" ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s);
  if (!raw || (Array.isArray(raw) && raw.length === 0)) return "All verticals";
  if (Array.isArray(raw)) {
    const names = raw
      .map((value) => {
        if (typeof value === "string") return mapping[value] || toTitle(value);
        if (typeof value === "number") return mapping[value] || value;
        return value?.name || value;
      })
      .filter(Boolean);
    return names.length ? names.join(", ") : "All verticals";
  }
  if (typeof raw === "string" || typeof raw === "number") {
    return mapping[raw] || mapping[String(raw)] || toTitle(String(raw));
  }
  return raw?.name || "All verticals";
};

export default function SupportLogsSidebar({ currentId }) {
  const { can } = usePermissions();
  const canView = can("view active resources", "support") || can("view support", "support") || true;
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategoryId = searchParams?.get("category_id");

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, verts] = await Promise.all([
          faqService.getCategories(),
          customerService.getVerticals().catch(() => null),
        ]);
        const list = cats?.data?.faq_categories || cats?.data?.data?.faq_categories || [];
        const src = verts?.data?.verticals || verts?.data?.data?.verticals || [];
        const verticalMapping = {};
        const verticalOptions = src.map(normalizeVerticalOption).filter(Boolean);
        verticalOptions.forEach((opt) => {
          verticalMapping[opt.id] = opt.label;
        });

        const mappedCategories = list.map((category) => ({
          id: category.id,
          name: category.name,
          description: buildVisibleLabel(verticalMapping, category.verticals || category.vertical_ids || category.vertical_id || category.verticalId),
        }));

        setCategories(mappedCategories);
      } catch (_) {
        setCategories([]);
      }
    };
    load();
  }, []);

  if (!canView) return null;
  return (
    <div className="flex h-full w-60 flex-col bg-white">
      <div className="flex-1 overflow-y-auto border-r border-[var(--color-stroke-neutral)]">
        {categories.map((category) => {
          const isActive = String(currentCategoryId || currentId) === String(category.id);
          return (
            <button
              key={category.id}
              onClick={() => {
                router.push(`/support/supportdefaultlogs?category_id=${category.id}`);
              }}
              className={`block w-full cursor-pointer border-b border-[var(--color-stroke-neutral)] px-4 py-4 text-left transition-all ${isActive ? "bg-[var(--sidebar-active-bg)]" : "hover:bg-[var(--color-alert-warm-bg)]"
                }`}
            >
              <div className="flex w-full justify-between">
                <div className="flex-1 leading-tight">
                  <div className="flex items-center text-base font-semibold text-[var(--color-neutral-secondary)]">
                    {category.name}
                  </div>
                  <div className="flex pt-1 text-sm text-[var(--color-stroke-brand)]">
                    {category.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
