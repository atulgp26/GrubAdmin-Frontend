"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import Modal from "@/components/ui/Modal";
import CheckBoxAdmin from "@/components/ui/checkBoxAdmin";
import Button from "@/components/ui/Button";
const RolePermissionsModal = ({ open, onClose, roleData = {} }) => {
  const permissionsJson = roleData?.role?.permissions_json || {};
  const roleName = roleData?.role?.name || "";
  const verticals = roleData?.role?.verticals || roleData?.role?.verticals_json || [];
  const sectionsData = useMemo(() => {
    const sections = {};
    if (!permissionsJson || Object.keys(permissionsJson).length === 0) {
      return sections;
    }
    Object.keys(permissionsJson).forEach((sectionKey) => {
      const permissionList = permissionsJson[sectionKey] || [];
      if (Array.isArray(permissionList) && permissionList.length > 0) {
        sections[sectionKey] = permissionList
          .filter((perm) => perm && perm.trim())
          .map((perm) => ({
            key: perm.toLowerCase().trim(),
            displayName: perm,
            checked: true,
          }));
      }
    });
    return sections;
  }, [permissionsJson]);
  const topLevelCategories = useMemo(() => {
    if (!verticals || !Array.isArray(verticals) || verticals.length === 0) {
      return [];
    }
    return verticals.map((vertical) => {
      const id = typeof vertical === 'string' ? vertical.toLowerCase() : (vertical?.id || vertical?.name || '').toLowerCase();
      const label = typeof vertical === 'string'
        ? vertical.charAt(0).toUpperCase() + vertical.slice(1)
        : (vertical?.name || vertical?.id || '');
      return { id, label };
    });
  }, [verticals]);
  const [openSections, setOpenSections] = useState({});
  const sectionsDataRef = useRef(JSON.stringify(sectionsData));
  useEffect(() => {
    // Only update if sectionsData actually changed
    const currentSectionsDataStr = JSON.stringify(sectionsData);
    if (sectionsDataRef.current === currentSectionsDataStr) {
      return; // Skip if no change
    }
    sectionsDataRef.current = currentSectionsDataStr;
    const sections = {};
    const sectionKeys = Object.keys(sectionsData);
    sectionKeys.forEach((key, index) => {
      sections[key] = index === 0;
    });
    setOpenSections(sections);
  }, [sectionsData]);
  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  const getCheckedCount = (sectionKey) => {
    return sectionsData[sectionKey]?.length || 0;
  };
  const getTotalCount = (sectionKey) => {
    return sectionsData[sectionKey]?.length || 0;
  };
  const getTotalCheckedPermissions = () => {
    let total = 0;
    Object.keys(sectionsData).forEach((sectionKey) => {
      total += getCheckedCount(sectionKey);
    });
    return total;
  };
  const getTotalPermissions = () => {
    let total = 0;
    Object.keys(sectionsData).forEach((sectionKey) => {
      total += getTotalCount(sectionKey);
    });
    return total;
  };
  const getSectionDisplayName = (sectionKey) => {
    if (!sectionKey) return "";
    return sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[814px]"
      height="h-auto"
      customClass="!z-50"
      positionClass="items-center justify-center"
    >
      <div className="flex flex-col h-full">
        <div className="pb-4">
          <h2 className="text-lg font-semibold text-[var(--color-neutral-primary)]">
            {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
          </h2>
        </div>
        <div className="flex-1 pt-4 pb-6 space-y-3 max-h-96 overflow-y-auto">
          {topLevelCategories.length > 0 && (
            <div className={`grid gap-3 ${topLevelCategories.length === 4 ? 'grid-cols-4' : topLevelCategories.length === 3 ? 'grid-cols-3' : topLevelCategories.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {topLevelCategories.map((category) => (
                <label key={category.id} className="flex items-center gap-3 cursor-pointer">
                  <CheckBoxAdmin checked={false} disabled />
                  <span className="text-sm text-[var(--color-neutral-secondary)]">
                    {category.label}
                  </span>
                </label>
              ))}
            </div>
          )}
          {Object.keys(sectionsData).length > 0 ? (
            Object.keys(sectionsData).map((sectionKey) => {
              const sectionPermissions = sectionsData[sectionKey] || [];
              if (!sectionPermissions || sectionPermissions.length === 0) {
                return null;
              }
              const isOpen = openSections[sectionKey] || false;
              return (
                <div key={sectionKey} className="">
                  <button
                    className={`w-full flex justify-between items-center px-4 py-2 text-left font-normal text-base text-[var(--color-neutral-secondary)] bg-[var(--color-neutral-secondary-bg)] hover:bg-[var(--color-neutral-secondary-bg)] transition focus:outline-none`}
                    onClick={() => toggleSection(sectionKey)}
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm text-[var(--color-neutral-secondary)] font-normal">
                      {getSectionDisplayName(sectionKey)} ({getCheckedCount(sectionKey)} of {getTotalCount(sectionKey)})
                    </span>
                    <svg
                      className={`w-4 h-4  ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="var(--color-neutral-light)"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-4 py-4 bg-white">
                      <div className="grid grid-cols-2 gap-4">
                        {sectionPermissions.map((permission, index) => (
                          <label key={permission.key} className="flex items-center gap-3 cursor-pointer">
                            <CheckBoxAdmin
                              checked={permission.checked}
                              disabled
                            />
                            <span className={`text-base ${open ? "text-[var(--color-neutral-secondary)]" : "text-[var(--color-stroke-brand)]"}`}>
                              {permission.displayName}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-[var(--color-neutral-secondary)]">
              No permissions found for this role.
            </div>
          )}
        </div>
        <div className="pt-6 border-t border-[var(--color-box-border)] flex items-center justify-between">
          <div className="text-lg text-[var(--color-neutral-secondary)]">
            {getTotalCheckedPermissions()} of {getTotalPermissions()} permissions
          </div>
          <Button
            variant="secondary"
            className="py-3 btn-size-md-lg font-medium w-1/2 "
            onClick={onClose}
          >
           CLOSE
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default RolePermissionsModal;