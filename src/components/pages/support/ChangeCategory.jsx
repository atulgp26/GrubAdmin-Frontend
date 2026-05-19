"use client";
import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import { IoChevronBack } from "react-icons/io5";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import { faqService } from "@/api/services/faqService";
import { customerService } from "@/api/services/customerService";

const normalizeVerticalId = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    if (value.id !== undefined) return String(value.id);
    if (value.value !== undefined) return String(value.value);
    if (value.code !== undefined) return String(value.code);
    if (value.name !== undefined) return String(value.name);
  }
  return "";
};

const toVerticalOption = (v) => {
  if (typeof v === "string" || typeof v === "number") {
    const id = String(v);
    return {
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1).toLowerCase(),
    };
  }
  const rawId = v?.id ?? v?.value ?? v?.code ?? v;
  const id = rawId !== undefined ? String(rawId) : "";
  const labelSource = v?.name ?? v?.label ?? id;
  const label =
    typeof labelSource === "string"
      ? labelSource
      : labelSource !== undefined
        ? String(labelSource)
        : id;
  return { id, label };
};

const normalizeSelectedRoles = (roles) => {
  if (!Array.isArray(roles)) return [];
  return roles
    .map((role) => normalizeVerticalId(role))
    .filter((roleId) => roleId !== "");
};

export default function ChangeCategory({
  open,
  onClose,
  onConfirm,
  title,
  description,
  backHidden
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedRole, setSelectedRole] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [verticalIdToName, setVerticalIdToName] = useState({});

  const handleSelectedRolesChange = (value) => {
    if (typeof value === "function") {
      setSelectedRole((prev) => {
        const next = value(prev);
        return Array.isArray(next)
          ? next.map((item) => normalizeVerticalId(item)).filter((id) => id !== "")
          : [];
      });
      return;
    }
    if (Array.isArray(value)) {
      setSelectedRole(value.map((item) => normalizeVerticalId(item)).filter((id) => id !== ""));
      return;
    }
    setSelectedRole([]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      if (dateOnly.getTime() === today.getTime()) return "Today";
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = String(date.getFullYear()).slice(-2);
      return `${day} ${month} '${year}`;
    } catch (_) {
      return "—";
    }
  };

  const getFaqCount = (cat) => {
    const possible = cat?.faqs_count ?? cat?.faq_count ?? cat?.faqsCount ?? cat?.faqCount;
    if (typeof possible === 'number') return possible;
    if (Array.isArray(cat?.faqs)) return cat.faqs.length;
    return null;
  };

  const getCategoryVerticalIds = (cat) => {
    const v = cat?.verticals || cat?.vertical_ids || cat?.verticals_json || cat?.vertical || [];
    if (Array.isArray(v)) return v.map((x) => {
      if (typeof x === 'string') return x.toLowerCase();
      return (x?.id || x?.name || x)?.toString().toLowerCase();
    });
    if (v) return [String(v).toLowerCase()];
    return [];
  };

  const buildVisibility = (cat) => {
    const ids = getCategoryVerticalIds(cat);
    if (ids.length) {
      const labelsById = Object.fromEntries((roleOptions || []).map(o => [String(o.id).toString().toLowerCase(), o.label]));
      const names = ids.map(id => labelsById[id] || (id.charAt(0).toUpperCase() + id.slice(1)));
      return `(Visible to ${names.join(', ')})`;
    }
    const singleId = cat?.vertical_id || cat?.verticalId;
    if (singleId !== undefined && singleId !== null) {
      const name = verticalIdToName[singleId] || singleId;
      return `(Visible to ${name})`;
    }
    return "(Visible to All verticals)";
  };

  const verticalFilterMatches = (cat) => {
    if (!selectedRole || selectedRole.length === 0) return true;
    if (roleOptions?.length && selectedRole.length === roleOptions.length) return true;
    const selectedIds = new Set(selectedRole.map((r) => (typeof r === 'string' ? r.toLowerCase() : String(r).toLowerCase())));

    const ids = getCategoryVerticalIds(cat);
    if (ids.length && ids.some((id) => selectedIds.has(id))) return true;

    const rawId = cat?.vertical_id || cat?.verticalId;
    const idKey = rawId !== undefined && rawId !== null ? String(rawId).toLowerCase() : '';
    if (idKey && selectedIds.has(idKey)) return true;
    const name = rawId !== undefined ? verticalIdToName[rawId] : '';
    const nameKey = name ? String(name).toLowerCase() : '';
    if (nameKey && selectedIds.has(nameKey)) return true;

    return false;
  };

  const fetchCategories = async () => {
    const catsRes = await faqService.getCategories();
    const rawCats = catsRes?.data?.faq_categories || catsRes?.data?.data?.faq_categories || catsRes?.data?.categories || [];
    const mapped = rawCats
      .filter((c) => c && (c.id || c.category_id))
      .map((c) => ({
        id: c.id || c.category_id,
        name: c.name || 'Category',
        updated_at: c.updated_at || c.updatedAt || c.updated || null,
        raw: c,
      }));
    setCategories(mapped);
  };

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        await fetchCategories();
        const vertsRes = await customerService.getVerticals();
        const apiVerticals = vertsRes?.data?.verticals || vertsRes?.data?.data?.verticals || [];
        const verticalOptions = (Array.isArray(apiVerticals) ? apiVerticals : [])
          .map(toVerticalOption)
          .filter(opt => opt.id);
        setRoleOptions(verticalOptions);
        const map = {};
        (Array.isArray(apiVerticals) ? apiVerticals : []).forEach((v) => {
          if (typeof v === 'string') map[String(v)] = v;
          else if (v && (v.id !== undefined)) map[v.id] = v.name;
        });
        setVerticalIdToName(map);
        setSelectedRole((prev) => normalizeSelectedRoles(prev));
      } catch (_) {
        setCategories([]);
        setRoleOptions([]);
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        await fetchCategories();
      } catch (_) { }
    })();
  }, [selectedRole, open]);

  const filteredGroups = useMemo(() => {
    const q = String(searchTerm || '').toLowerCase();
    return categories
      .filter((c) => (q ? (c.name || '').toLowerCase().includes(q) : true))
      .filter((c) => verticalFilterMatches(c.raw || c))
      .map((c) => ({
        id: c.id,
        name: c.name,
        visiblity: buildVisibility(c.raw || c),
        status: (() => {
          const count = getFaqCount(c.raw || c);
          return typeof count === 'number' ? `${count} FAQs` : '—';
        })(),
        updated: formatDate((c.raw && (c.raw.updated_at || c.raw.updatedAt)) || c.updated_at),
        categoryIdRaw: (c.raw && (c.raw.id || c.raw.category_id)) || c.id,
        raw: c.raw || c,
      }));
  }, [categories, searchTerm, selectedRole, roleOptions]);

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
  };

  const handleConfirm = () => {
    if (selectedGroup) {
      onConfirm(selectedGroup);
      setSelectedGroup(null);
      setSearchTerm("");
    }
  };

  const handleClose = () => {
    setSelectedGroup(null);
    setSearchTerm("");
    onClose();
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleClose} width="w-[920px]">
      <div className={`${backHidden ? "hidden" : ""}`}>
        <Button
          variant="skip"
          size="mdLg"
          className="flex gap-2 group"
          onClick={onClose}
        >
          <IoChevronBack className="w-6 h-6 text-[var(--color-stroke-brand)]" />
          BACK
        </Button>
      </div>
      <div className="flex flex-col h-full px-6 py-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-2">
            {title}
          </h2>
          <p className="text-[var(--color-stroke-brand)] text-base">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search category"
              clearable={true}
              onClear={() => setSearchTerm("")}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-stroke-brand)]">
              Showing {filteredGroups.length} of {categories.length}
            </span>
            <div className="w-48">
              <MultiSelectDropdown
                options={roleOptions}
                selected={selectedRole}
                setSelected={handleSelectedRolesChange}
                placeholder="All verticals"
                hideComponent={true}
                notificationIcon={true}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-lg">
          <div className=" p-4 border-b border-[var(--color-stroke-neutral)]">
            <div className="grid grid-cols-2 text-sm font-medium text-[var(--color-stroke-brand)]">
              <span>Categories</span>
              <div className="grid grid-cols-3">
                <span>FAQs</span>
                <span>Updated</span>
                <span></span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredGroups.map((group) => (
              <div key={group.id} className="p-4 border-b border-[var(--color-stroke-neutral)] last:border-b-0 hover:bg-gray-50">
                <div className="grid grid-cols-2 items-center">
                  <div className="flex flex-col gap-1">
                    <div className="text-[var(--color-neutral-secondary)] font-semibold">
                      {group.name}
                    </div>
                    <div className="text-sm text-[var(--color-stroke-brand)]">
                      {group.visiblity}
                    </div>
                  </div>
                  <div className="grid grid-cols-3">
                    <div className="text-[var(--color-neutral-secondary)] text-base">
                      {group.status}
                    </div>
                    <div className="text-[var(--color-neutral-secondary)]">
                      {group.updated}
                    </div>
                    <div className="flex">
                      <p
                        onClick={() => handleSelectGroup(group)}
                        className={`cursor-pointer px-4 py-1.5 ${selectedGroup?.id === group.id
                            ? "!bg-[var(--sidebar-active-bg)] text-sm rounded-lg !text-[var(--color-filter-text)] underline !font-medium shadow-[0_0_0_2px_var(--color-shadow-select)] border !border-[var(--color-filter-text)]"
                            : "!text-[var(--info-panel-view-bg)] hover:underline hover:bg-[var(--sidebar-active-bg)] hover:border-[var(--color-filter-text)] hover:text-[var(--color-filter-text)] active:bg-[var(--color-admin-profile-border)] active:border-[var(--info-panel-view-bg)] active:shadow-[0_0_0_2px_var(--color-shadow-select)] text-sm rounded-lg !font-medium border !border-[var(--info-panel-view-bg)]"
                          }`}
                      >
                        {selectedGroup?.id === group.id ? "SELECTED" : "SELECT"}
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-stroke-neutral)]">
          <div className="text-lg text-[var(--color-neutral-secondary)]">
            {selectedGroup ? (
              <span>{selectedGroup.name} selected.</span>
            ) : (
              <span>No category selected yet!</span>
            )}
          </div>
          <Button
            variant="outline"
            size="mdLg"
            disabled={!selectedGroup}
            onClick={handleConfirm}
            className="w-1/2"
          >
            CONFIRM CHANGE
          </Button>
        </div>
      </div>
    </Modal>
  );
} 