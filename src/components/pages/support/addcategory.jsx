"use client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import React, { useState, useEffect } from "react";
import { FiCheck } from "react-icons/fi";
import { commonService } from "@/api/services/commonService";
import { faqService } from "@/api/services/faqService";
import { showError, showSuccess } from "@/components/ui/toast";
import { fetchVerticalOptions } from "@/utils/verticals";

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

const AddCategory = ({ open, onClose, mode = "add", initialValues = null }) => {
  const [iconBaseUrl, setIconBaseUrl] = useState("");
  const [iconOptions, setIconOptions] = useState([]);
  const [verticalOptions, setVerticalOptions] = useState([]);

  const [selectedIcon, setSelectedIcon] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const [selectedRole, setSelectedRole] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectMountKey, setSelectMountKey] = useState(0);
  const [multiCloseSignal, setMultiCloseSignal] = useState(0);

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

  const handleFocus = (field) => setFocusedField(field);
  const handleBlur = () => setFocusedField("");

  const countCharacters = (text) => {
    return text ? text.length : 0;
  };

  const truncateToCharLimit = (text, maxChars) => {
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars);
  };

  const MAX_NAME_CHARS = 15;
  const MAX_DESC_CHARS = 30;

  const nameCharCount = countCharacters(categoryName);
  const descCharCount = countCharacters(description);

  useEffect(() => {
    const nameValid = categoryName.trim().length > 0 && nameCharCount <= MAX_NAME_CHARS;
    const roleValid = selectedRole.length > 0;
    setIsFormValid(nameValid && roleValid);
  }, [categoryName, selectedRole, nameCharCount]);

  useEffect(() => {
    if (!open) return;
    setSelectedIcon(initialValues?.icon ?? "");
    const loadIcons = async () => {
      try {
        const configRes = await commonService.getConfig();
        if (configRes?.success && configRes?.code === 200) {
          const baseCfg = (configRes.data?.configs || []).find(c => c.key === "icon_base_url");
          if (baseCfg?.value) setIconBaseUrl(baseCfg.value);
        }

        const iconsRes = await commonService.getIcons();
        if (iconsRes?.success && iconsRes?.code === 200) {
          const icons = iconsRes.data?.icons || [];
          const rawBase = (configRes?.data?.configs?.find(c => c.key === 'icon_base_url')?.value) || iconBaseUrl || '';
          const base = `${rawBase}`.replace(/\/+$/, '');
          const opts = icons.map(ic => {
            const src = `${base}/${ic.bucket_key}`;
            return {
              value: ic.id,
              label: (
                <img
                  src={src}
                  alt={ic.name}
                  className="w-6 h-6"
                />
              )
            };
          });
          setIconOptions(opts);
          const initial = initialValues?.icon ?? (opts.length > 0 ? opts[0].value : "");
          setSelectedIcon(initial);
        }
      } catch (e) {
      }
    };

    loadIcons();

    const loadVerticals = async () => {
      try {
        const { options } = await fetchVerticalOptions();
        setVerticalOptions(options);
        setSelectedRole((prev) => normalizeSelectedRoles(prev));
      } catch (err) {
      }
    };

    loadVerticals();

    setCategoryName(initialValues?.name ?? "");
    handleSelectedRolesChange(normalizeSelectedRoles(initialValues?.roles));
    setDescription(initialValues?.description ?? "");
  }, [open]);

  const hasChanges = React.useMemo(() => {
    if (mode !== "edit") return true;
    const initialIcon = initialValues?.icon ?? (iconOptions && iconOptions.length ? iconOptions[0].value : "");
    const initialName = initialValues?.name ?? "";
    const initialDesc = initialValues?.description ?? "";
    const initialRoles = normalizeSelectedRoles(initialValues?.roles);
    return (
      selectedIcon !== initialIcon ||
      categoryName !== initialName ||
      description !== initialDesc ||
      JSON.stringify(selectedRole) !== JSON.stringify(initialRoles)
    );
  }, [mode, selectedIcon, categoryName, description, selectedRole, initialValues]);

  const handleConfirm = async () => {
    const enabled = mode === "edit" ? isFormValid && hasChanges : isFormValid;
    if (!enabled) return;

    try {
      const payload = {
        name: categoryName.trim(),
        icon: selectedIcon,
        vertical: normalizeVerticalId(selectedRole?.[0]),
      };
      if (description && description.trim()) {
        payload.description = description.trim();
      }

      let res;
      if (mode === "edit" && initialValues?.id) {
        res = await faqService.updateCategory({ id: initialValues.id, ...payload });
      } else {
        res = await faqService.createCategory(payload);
      }

      if (res?.success && res?.code === 200) {
        showSuccess(mode === "edit" ? "Category updated successfully" : "Category created successfully");
        if (onClose) onClose();
      } else {
        const rawMsg = res?.message || res?.error || "";
        const msg = /too long/i.test(rawMsg) && /name/i.test(rawMsg)
          ? "Category name is too long. Please use a shorter name."
          : rawMsg || (mode === "edit" ? "Failed to update category" : "Failed to create category");
        showError(msg);
      }
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "";
      const msg = /too long/i.test(serverMsg) && /name/i.test(serverMsg)
        ? "Category name is too long. Please use a shorter name."
        : serverMsg || (mode === "edit" ? "Failed to update category" : "Failed to create category");
      showError(msg);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[604px]"
      customClass="overflow-auto"
    >
      <div className="space-y-6">
        <div className="space-y-2 mt-2 px-1">
          <h1 className="text-[var(--color-neutral-primary)] font-semibold text-2xl">
            {mode === "edit" ? "Edit category details" : "Add new category"}
          </h1>
          <p className="text-[var(--color-stroke-brand)] text-base">
            {mode === "edit"
              ? "Any change made will take effect immediately."
              : "Create a new category to organize FAQs."}
          </p>
        </div>

        <div className="overflow-y-auto max-h-[70vh] px-1 space-y-2  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex flex-col space-y-4">
            <h3 className="text-[var(--color-neutral-secondary)] text-base">
              Category name
            </h3>
            <div className="w-full flex gap-4">
              <Select
                key={selectMountKey}
                value={selectedIcon}
                onChange={(value) => setSelectedIcon(value)}
                options={iconOptions}
                padding="!py-3 !px-6 !h-12"
                className="!w-28"
                onOpenChange={(isOpen) => {
                  if (isOpen) {
                    setMultiCloseSignal(v => v + 1);
                  }
                }}
              />
              <Input
                placeholder="Category name"
                padding="!py-3 !px-6"
                value={categoryName}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.length <= MAX_NAME_CHARS) {
                    setCategoryName(newValue);
                  } else {
                    setCategoryName(truncateToCharLimit(newValue, MAX_NAME_CHARS));
                  }
                }}
                onFocus={() => handleFocus("Category name")}
                onBlur={handleBlur}
                width="!w-full"
                isFocused={focusedField === "Category name"}
              />
            </div>

          </div>

          <div className="flex flex-col space-y-4">
            <h3 className="text-[var(--color-neutral-secondary)] text-base">
              Verticals
            </h3>
            <MultiSelectDropdown
              options={verticalOptions}
              selected={selectedRole}
              setSelected={handleSelectedRolesChange}
              placeholder="Select which vertical can see this category"
              hideComponent={true}
              padding="!h-12 !w-full"
              fontsize="!text-base"
              placeholderColor="!text-[var(--color-neutral-light)]"
              dropdownwidth="!w-full"
              closeSignal={multiCloseSignal}
              onOpenChange={(isOpen) => {
                if (isOpen) {
                  setSelectMountKey(k => k + 1);
                }
              }}
            />
          </div>

          <div className="flex flex-col space-y-4 pb-3">
            <h3 className="text-[var(--color-neutral-secondary)] text-base">
              Description <span className="text-sm">(Optional)</span>
            </h3>
            <TextArea
              placeholder="Add a short note about what this category covers. Customers will see this description."
              value={description}
              onChange={(e) => {
                const newValue = e.target.value;
                if (newValue.length <= MAX_DESC_CHARS) {
                  setDescription(newValue);
                } else {
                  setDescription(truncateToCharLimit(newValue, MAX_DESC_CHARS));
                }
              }}
            />

          </div>

          <div className="flex gap-4 pt-6 border-t border-[var(--color-box-border)]">
            <Button
              variant="grayOutline"
              size="mdLg"
              onClick={onClose}
              className="w-1/2"
            >
              CANCEL
            </Button>

            <Button
              variant="primary"
              size="mdLg"
              disabled={mode === "edit" ? !(isFormValid && hasChanges) : !isFormValid}
              className="w-1/2"
              onClick={handleConfirm}
            >
              {mode === "edit"
                ? "SAVE CHANGES"
                : isFormValid ? (
                  <span className="flex items-center justify-center gap-2">
                    <FiCheck className="w-5 h-5" />
                    CONFIRM
                  </span>
                ) : (
                  "CONFIRM"
                )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddCategory;