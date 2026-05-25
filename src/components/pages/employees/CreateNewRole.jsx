import Button from "@/components/ui/Button";
import CheckBox from "@/components/ui/CheckBox";
import Modal from "@/components/ui/Modal";
import SearchInput from "@/components/ui/SearchInput";
import DetailsCollapse from "@/components/ui/DetailsCollapse";
import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import CheckBoxDisable from "@/components/ui/CheckBoxDisable";
import TableCheckbox from "@/components/ui/TableCheckbox";
import { MdDone } from "react-icons/md";
import BoxCountBadge from "@/components/ui/BoxCountBadge";

const modules = [
  { name: "Dashboard" },
  { name: "GrubPacs" },
  { name: "Employees" },
  { name: "Roles" },
  { name: "Customers" },
];

const modulePermissions = {
  Roles: [
      { id: "viewRoles", label: "View roles", type: "disabled" },
      { id: "deleteRoles", label: "Delete roles", type: "checkbox" },
      { id: "addRoles", label: "Add roles", type: "checkbox" },
      { id: "editRoles", label: "Edit roles", type: "checkbox" },
  ],
  Dashboard: [
    { id: "viewDashboard", label: "View dashboard", type: "disabled" },
    { id: "exportDashboard", label: "Export dashboard", type: "checkbox" },
  ],
  Employees: [
    {
      id: "viewActiveEmployees",
      label: "View active employees",
      type: "disabled",
    },
    { id: "viewEmployeeLogs", label: "View employee logs", type: "checkbox" },
    {
      id: "viewSuspendedEmployees",
      label: "View suspended employees",
      type: "checkbox",
    },
    {
      id: "viewDismissedEmployees",
      label: "View dismissed employees",
      type: "checkbox",
    },
    { id: "addEmployees", label: "Add employees", type: "checkbox" },
    { id: "editEmployees", label: "Edit employees", type: "checkbox" },
    { id: "deleteEmployees", label: "Delete employees", type: "checkbox" },
    { id: "suspendEmployees", label: "Suspend employees", type: "checkbox" },
    { id: "activateEmployees", label: "Activate employees", type: "checkbox" },
    { id: "exportEmployees", label: "Export employees", type: "checkbox" },
  ],
};

const CreateNewRole = ({
  open,
  onClose,
  onSave,
  title,
  description,
  verticalsData = [
    { id: "delivery", label: "Delivery", color: "--color-brand-primary-btn" },
    { id: "medical", label: "Medical", color: "--color-checkbox-medical" },
    { id: "hospitality", label: "Hospitality", color: "--color-brand-default" },
    { id: "camping", label: "Camping", color: "--color-icon-camping" },
  ],
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [selected, setSelected] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [openCollapse, setOpenCollapse] = useState("");

  const toggleModule = (name) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  const togglePermission = (module, id) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [id]: !prev[module]?.[id],
      },
    }));
  };

  const toggleVertical = (id) => {
    setPermissions((prev) => ({
      ...prev,
      verticals: {
        ...prev.verticals,
        [id]: !prev.verticals?.[id],
      },
    }));
  };

  const getModuleCounts = (module) => {
    const total = modulePermissions[module]?.length || 0;
    const used = Object.values(permissions[module] || {}).filter(Boolean).length;
    return { total, used };
  };

  const getVerticalCounts = () => {
    const total = verticalsData.length;
    const used = Object.values(permissions.verticals || {}).filter(Boolean).length;
    return { total, used };
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} width="w-[80%]">
      <div className="flex flex-col gap-6">
        <Button
          variant="grayOutline"
          className="flex gap-2 w-fit items-center btn-size-md-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          GO BACK
        </Button>

        <div>
          <h1 className="text-[var(--color-neutral-primary)] font-semibold text-2xl">
            {title || `You are creating a new role`}
          </h1>
          <p className="text-[var(--color-stroke-brand)]">
            {description ||
              `Roles define what your employees can and cannot do inside the platform.`}
          </p>
        </div>

        <div className="flex justify-center items-start pt-12">
          <div className="grid grid-cols-10 gap-10 w-10/12">
            <div className="col-span-4 flex flex-col">
              <span className="text-[var(--color-neutral-secondary)] pb-3">
                Give your role a unique name
              </span>
              <SearchInput
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Role name"
                className="[&_input]:!h-8 [&_input]:!py-1"
              />

              <div className="flex flex-col pt-6">
                <span className="text-[var(--color-neutral-secondary)] pb-3">
                  Select modules for access (multiple)
                </span>
                {modules.map((module) => {
                  const { used, total } = getModuleCounts(module.name);
                  return (
                    <div key={module.name} className="flex items-center py-2">
                      <CheckBox
                        type="checkbox"
                        checked={selected.includes(module.name)}
                        onChange={() => toggleModule(module.name)}
                      />
                      <span className="text-[var(--color-neutral-secondary)] text-lg pl-3 pr-2">
                        {module.name}
                      </span>
                      <span className="text-[var(--color-stroke-brand)]">
                        ({used} of {total} permissions)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
<div className="col-span-6 flex flex-col justify-center">
  <DetailsCollapse
    title={`Verticals (${getVerticalCounts().used} of ${getVerticalCounts().total})`}
    open={openCollapse === "verticals"}
    onClick={() =>
      setOpenCollapse(openCollapse === "verticals" ? "" : "verticals")
    }
  >
    <div className="grid grid-cols-2">
      {verticalsData.map((v) => (
        <div key={v.id} className="flex items-center px-6 border-b gap-2">
          <TableCheckbox
            type="checkbox"
            checked={permissions.verticals?.[v.id] || false}
            onChange={() => toggleVertical(v.id)}
            colorVar={v.color}
          />
          <span className="text-[var(--color-neutral-secondary)] py-4">
            {v.label}
          </span>
        </div>
      ))}
    </div>
  </DetailsCollapse>
  {selected.length > 0 && selected.map((module) =>
      modulePermissions[module] ? (
        <DetailsCollapse
          key={module}
          title={`${module} (${getModuleCounts(module).used} of ${getModuleCounts(module).total})`}
          open={openCollapse === module}
          onClick={() =>
            setOpenCollapse(openCollapse === module ? "" : module)
          }
        >
          <div className="grid grid-cols-2">
            {modulePermissions[module].map((opt) => (
              <div
                key={opt.id}
                className="flex items-center px-6 border-b gap-2"
              >
                <BoxCountBadge
                  asText
                  tooltipContent={
                    opt.type === "disabled" ? (
                      <span className="text-xs text-[var(--color-stroke-brand)]">
                        Can see data in this module.
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--color-stroke-brand)]">
                        Can temporarily disable entries without deleting them.
                      </span>
                    )
                  }
                  tooltipSide="bottom"
                >
                  {opt.type === "disabled" ? (
                    <CheckBoxDisable
                      type="checkbox"
                      checked={permissions[module]?.[opt.id] || false}
                      onChange={() => togglePermission(module, opt.id)}
                    />
                  ) : (
                    <TableCheckbox
                      type="checkbox"
                      checked={permissions[module]?.[opt.id] || false}
                      onChange={() => togglePermission(module, opt.id)}
                    />
                  )}
                </BoxCountBadge>
                <span className="text-[var(--color-neutral-secondary)] py-4">
                  {opt.label}
                </span>
              </div>
            ))}
          </div>
        </DetailsCollapse>
      ) : null
    )}
</div>
          </div>
        </div>

        <hr className="border-t border-[var(--color-box-border)] w-full my-6" />

        <div className="flex itemscenter justify-between gap-4">
          <Button
            variant="grayOutline"
            onClick={onClose}
            className="px-28 py-3"
          >
            CANCEL
          </Button>
          <Button
            variant="disabledGray"
            disabled={selected.length === 0 && getVerticalCounts().used === 0}
            className="flex items-center gap-2 px-28 py-3"
            onClick={onSave}
          >
            <MdDone className="w-5 h-5" />
            SAVE ROLE
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateNewRole;