"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { LuPencilLine } from "react-icons/lu";
import SearchWithSuggestions from "@/components/ui/SearchWithSuggestions";
import { RiLoopRightLine } from "react-icons/ri";
import Button from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { usePathname } from "next/navigation";
import { RxCrossCircled } from "react-icons/rx";
import ExportListModal from "../employees/ExportListModal";
import TableCheckbox from "@/components/ui/TableCheckbox";
import { FiInfo, FiPlus } from "react-icons/fi";
import LogDetails from "./LogDetails";
import SupportActionBar from "./SupportActionbar";
import ActivateEmployeeModal from "../employees/ActivateEmployeeModal";
import Select from "@/components/ui/Select";
import QuestionDetails from "./QuestionDetails";
import AddFaq from "./AddFaq";
import ChangeCategory from "./ChangeCategory";
import DeleteCategoryModal from "./DeleteCategoryModal";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import SuspendCategoryModal from "./SuspendCategoryModal";
import AddCategory from "./addcategory";
import { faqService } from "@/api/services/faqService";
import { usePermissions } from "@/context/PermissionContext";

import { showSuccess, showError } from "@/components/ui/toast";
import InfoPanel from "@/components/common/InfoPanel";
import { fetchVerticalOptions } from "@/utils/verticals";

const faqOptions = [
  {
    value: "All FAQs",
    label: "All FAQs",
  },
  {
    value: "Draft FAQs",
    label: "Draft FAQs",
  },
  {
    value: "Published FAQs",
    label: "Published FAQs",
  },
];
const exportOptions = [
  {
    group: "scope",
    title: "Details",
    items: [
      {
        id: "Only published FAQs",
        label: "Only published FAQs",
        type: "radio",
      },
      {
        id: "Only draft FAQs",
        label: "Only draft FAQs",
        type: "radio",
      },
      {
        id: "All FAQs",
        label: "All FAQs",
        type: "radio",
      },
    ],
  },
];

export default function SupportDefaultLogs() {
  const { can } = usePermissions();
  const [search, setSearch] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [allFaqs, setAllFaqs] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [openRowMenu, setOpenRowMenu] = useState(false);
  const menuRef = useRef(null);
  const [exportListModal, setExportListModal] = useState(false);
  const [openLogDetails, setOpenLogDetails] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState("All FAQs");
  const pathname = usePathname();
  const [faqCount, setFaqCount] = useState(0);
  const [modalType, setModalType] = useState("publish");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openQuestionDetails, setOpenQuestionDetails] = useState(false);
  const [logsData, setLogsData] = useState([]);
  const [addFaqOpen, setAddFaqOpen] = useState(false);
  const [selectedFaqData, setSelectedFaqData] = useState(null);
  const [openChangeCategory, setOpenChangeCategory] = useState(false)
  const [openDeleteCategory, setOpenDeleteCategoryModal] = useState(false)
  const [isDeleteCategory, setIsDeleteCategory] = useState(false)
  const [selectedFaqs, setSelectedFaqs] = useState([]);
  const [deleteCategoryTitle, setDeleteCategoryTitle] = useState("")
  const [deleteCategoryDescription, setDeleteCategoryDescription] = useState("")
  const [deleteCategoryCta, setDeleteCategoryCta] = useState("")
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editInitial, setEditInitial] = useState(null);
  const [deleteIds, setDeleteIds] = useState([]);
  const [midLevelData, setMidLevelData] = useState([]);

  const [selectedLogs, setSelectedLogs] = useState([]);
  const router = useRouter();


  let status = "Active";
  if (pathname === "/employees/suspendedlogs") status = "Suspended";
  if (pathname === "/employees/dismissedlogs") status = "Dismissed";

  const isDismissPage =
    pathname === "/employees/dismissedlogs" ||
    pathname === "/employees/suspendedlogs";

  const canAddFaq = (can("add new question", "support") || can("add new question"));
  const canEditCategory = (can("edit category", "support") || can("edit category"));
  const canExportFaqs = (can("export active resources", "support") || can("export suspended_categories", "support") || can("export active resources") || can("export suspended_categories"));
  const canSuspendCategory = (can("suspend categories", "support") || can("suspend categories"));
  const canDeleteCategory = (can("delete categories", "support") || can("delete categories"));
  const canEditFaq = (can("edit questions", "support") || can("edit questions"));
  const canDeleteFaq = (can("delete question", "support") || can("delete question"));
  const canChangeCategory = (can("change faq category", "support") || can("change faq category"));
  const canToggleFaq = (can("allow publishing", "support") || can("allow publishing"));

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
      const insideRowMenu = (event.target && (event.target.closest && event.target.closest('.row-menu-container')));
      if (!insideRowMenu) {
        setOpenRowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const refreshCategoryById = async (categoryId, publishingStatus = null) => {
    try {
      const res = await faqService.getFaqsByCategory(categoryId, publishingStatus);
      const faqs = res?.data?.faqs || res?.data?.data?.faqs || [];
      const filteredFaqs = faqs;

      const mapped = filteredFaqs.map(f => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        status: (f.publishing_status || "").charAt(0).toUpperCase() + (f.publishing_status || "").slice(1),
        updated: (f.updated_at || "").slice(0, 10),
        icon: "",
        categoryId: categoryId,
        raw: f,
      }));

      return mapped;
    } catch (err) {
      console.error(`[refreshCategoryById] Error refreshing category ${categoryId}:`, err);
      return [];
    }
  };

  const refreshFAQs = async (specificCategoryId = null, publishingStatus = null) => {
    try {
      const requestedId = searchParams?.get ? searchParams.get("category_id") : null;
      const targetId = specificCategoryId || requestedId || selectedCategoryId;
      const statusToUse = publishingStatus || selectedFaq;
      if (!targetId) {
        const cats = await faqService.getCategories();
        const list = cats?.data?.faq_categories || cats?.data?.data?.faq_categories || [];
        setCategoriesList(list);
        if (list.length) {
          const firstId = list[0].id;
          setSelectedCategoryId(firstId);
          const mapped = await refreshCategoryById(firstId, statusToUse);
          setAllFaqs(mapped);
          setFilteredLogs(mapped);
        }
        return;
      }
      const mapped = await refreshCategoryById(targetId, statusToUse);
      setAllFaqs(mapped);
      setFilteredLogs(mapped);
    } catch (err) {
      console.error("Error refreshing FAQs:", err);
      showError("Failed to refresh FAQs");
    }
  };

  const [categoriesList, setCategoriesList] = useState([]);

  const [verticalIdToName, setVerticalIdToName] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const requestedId = searchParams?.get ? searchParams.get("category_id") : null;
        const [cats, verticalData] = await Promise.all([
          faqService.getCategories(),
          fetchVerticalOptions(),
        ]);
        const list = cats?.data?.faq_categories || cats?.data?.data?.faq_categories || [];
        setCategoriesList(list);
        const map = verticalData?.map || {};
        const verticalOptions = verticalData?.options || [];
        setVerticalIdToName(map);
        setMidLevelData(verticalOptions);
        if (list.length) {
          const targetId = requestedId || list[0].id;
          setSelectedCategoryId(targetId);
          const res = await faqService.getFaqsByCategory(targetId, selectedFaq);
          const faqs = res?.data?.faqs || res?.data?.data?.faqs || [];
          const mapped = faqs.map(f => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
            status: (f.publishing_status || "").charAt(0).toUpperCase() + (f.publishing_status || "").slice(1),
            updated: (f.updated_at || "").slice(0, 10),
            icon: "",
            categoryId: targetId,
            raw: f,
          }));
          setAllFaqs(mapped);
          setFilteredLogs(mapped);
        } else {
          setAllFaqs([]);
          setFilteredLogs([]);
        }
      } catch (_) {
        setAllFaqs([]);
        setFilteredLogs([]);
        setVerticalIdToName({});
        setMidLevelData([]);
      }
    };
    load();
  }, [searchParams]);

  const currentCategory = categoriesList.find(c => String(c.id) === String(selectedCategoryId));
  const categoryName = currentCategory?.name || "Category 1";
  const toTitle = (s) => (typeof s === 'string' ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s);
  const buildVisibleTo = (cat) => {
    if (!cat) return "(Visible to All verticals)";
    const raw = cat.verticals || cat.vertical_ids || cat.vertical_id || cat.verticalId;
    if (!raw || (Array.isArray(raw) && raw.length === 0)) return "(Visible to All verticals)";
    if (Array.isArray(raw)) {
      const names = raw.map((v) => {
        if (typeof v === 'string') {
          return verticalIdToName[v] || toTitle(v);
        }
        if (typeof v === 'number') {
          return verticalIdToName[v] || v;
        }
        return v?.name || v;
      }).filter(Boolean);
      return names.length ? `(Visible to ${names.join(', ')})` : "(Visible to All verticals)";
    }
    if (typeof raw === 'string' || typeof raw === 'number') {
      const mapped = verticalIdToName[raw] || verticalIdToName[String(raw)];
      return `(Visible to ${mapped || toTitle(String(raw))})`;
    }
    return `(Visible to ${raw?.name || raw})`;
  };
  const categoryDescription = buildVisibleTo(currentCategory);

  useEffect(() => {
    if (selectedCategoryId) {
      refreshFAQs(null, selectedFaq);
    }
  }, [selectedFaq]);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) { setFilteredLogs(allFaqs); return; }
    setFilteredLogs(allFaqs.filter(l => (l.question || "").toLowerCase().includes(q) || (l.answer || "").toLowerCase().includes(q)));
  }, [search, allFaqs]);

  const searchSuggestions = useMemo(() => {
    return filteredLogs.map((faq) => ({
      id: `logs-${faq.question.toLowerCase()}`,
      name: faq.question,
      code: faq.answer,
      type: "logs",
    }));
  }, [filteredLogs]);

  const handleEditDetails = () => {
    setOpenLogDetails(false);
    if (currentCategory) {
      setEditInitial({
        id: currentCategory.id,
        name: currentCategory.name,
        icon: currentCategory.icon_id,
        description: currentCategory.description,
        roles: currentCategory.vertical_id ? [currentCategory.vertical_id] : [],
      });
    }
    setEditOpen(true);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearch(suggestion.name);
  };

  const handleSearchClear = () => {
    setSearch("");
  };
  const handleQuestionDetails = (logs) => {
    setLogsData([logs]);
    setOpenQuestionDetails(true);
  };

  const handleSingleDelete = (log) => {
    setDeleteCategoryTitle("Delete this FAQ?");
    setDeleteCategoryDescription(
      "This will permanently remove the question and its answer from the system. This action cannot be undone."
    );
    setDeleteCategoryCta("YES, DELETE FAQ");
    if (log?.id) setDeleteIds([log.id]);
    setOpenDeleteCategoryModal(true);
  };

  const handleMultipleDelete = () => {
    const count = selectedLogs.length;
    setDeleteCategoryTitle(`Delete selected FAQ${count === 1 ? "" : "s"}?`);
    setDeleteCategoryDescription(
      `This will permanently remove the ${count === 1 ? "question and its answer" : `${count} questions and their answers`} from the system. This action cannot be undone.`
    );
    setDeleteCategoryCta(`YES, DELETE ${count} FAQ${count === 1 ? "" : "S"}`);
    const ids = selectedLogs.map(i => (filteredLogs[i] ? filteredLogs[i].id : null)).filter(Boolean);
    setDeleteIds(ids);
    setOpenDeleteCategoryModal(true);
  };

  const handleChangeCategoryConfirm = async (category) => {
    try {
      const ids = selectedLogs
        .map((index) => filteredLogs[index]?.id)
        .filter(Boolean);
      const rawId = category?.categoryIdRaw || category?.id || category?.category_id || category?.raw?.id;
      const categoryId = isNaN(Number(rawId)) ? rawId : Number(rawId);
      if (!ids.length || !rawId) {
        showError("Please select FAQs and a category.");
        return;
      }
      const oldCategoryId = selectedCategoryId;
      const res = await faqService.changeFaqCategoryBulk(ids, oldCategoryId, categoryId);
      if (res?.success && res?.code === 200) {
        const count = ids.length;
        showSuccess(
          `FAQ${count === 1 ? '' : 's'} moved successfully`,
          `${count === 1 ? 'The FAQ has' : `${count} FAQs have`} been moved to the selected category.`
        );
        await refreshFAQs();
        setSelectedLogs([]);
        setOpenChangeCategory(false);
      } else {
        showError(res?.message || res?.error || "Failed to move FAQs");
      }
    } catch (e) {
      showError(e?.response?.data?.message || e?.message || "Failed to move FAQs");
    }
  };

  const handleDeleteCategory = () => {
    setDeleteCategoryTitle(null);
    setDeleteCategoryDescription(
      null
    );
    setDeleteCategoryCta(null);
    setOpenDeleteCategoryModal(true)
  }

  const details = [
    { label: "Status", value: (currentCategory?.status || "—").toString().charAt(0).toUpperCase() + (currentCategory?.status || "—").toString().slice(1) },
    {
      label: "Description",
      value: (
        <div className=" text-[var(--color-neutral-secondary)]">
          <p>
            {currentCategory?.description || "—"}
          </p>
        </div>
      ),
    },
    { label: "Created on", value: currentCategory?.created_at ? String(currentCategory.created_at).slice(0, 10) : "—" },
    { label: "Last updated", value: currentCategory?.updated_at ? String(currentCategory.updated_at).slice(0, 10) : "—" },
  ];

  return (
    <>
      <div className="flex flex-col gap-6 p-6 w-full">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Button variant="cancel" className="py-2 px-2" onClick={() => setOpenLogDetails(true)}>
              <FiInfo className="w-5 h-5" />
            </Button>
            <h1 className="text-[var(--color-neutral-primary)] flex items-center font-semibold text-2xl">
              {categoryName}{" "}
              <span className="text-[var(--color-stroke-brand)] text-sm pl-4">
                {categoryDescription}
              </span>
            </h1>
          </div>
          <div className={`flex gap-4 ${isDismissPage ? "hidden" : ""} `}>
            {canAddFaq && (
              <Button
                variant="secondary"
                className="leading-none btn-size-md-cancel gap-3 flex items-center space-x-2 w-max cursor-pointer"
                onClick={() => setAddFaqOpen(true)}
              >
                <FiPlus />
                ADD QUESTION
              </Button>
            )}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen((prev) => !prev)}
                className={`p-2 cursor-pointer ${open
                  ? "bg-[var(--color-neutral-secondary-bg)] shadow-[0_0_0_2px_var(--color-shadow-actionmenu)] rounded-lg"
                  : ""
                  }`}
              >
                <BsThreeDotsVertical className="w-5 h-5 text-[var(--color-stroke-brand)]" />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] rounded-lg shadow-[4px_4px_8px_0_var(--color-notif-shadow-soft),0px_0px_4px_0_var(--color-notif-shadow-strong)] z-50">
                  {canEditCategory && (
                    <Button
                      variant="profile"
                      className="w-full text-left px-4 py-2 !rounded-b-none flex items-center gap-2 text-[var(--color-neutral-secondary)] !text-sm"
                      onClick={() => {
                        if (currentCategory) {
                          setEditInitial({
                            id: currentCategory.id,
                            name: currentCategory.name,
                            icon: currentCategory.icon_id,
                            description: currentCategory.description,
                            roles: currentCategory.vertical_id ? [currentCategory.vertical_id] : [],
                          });
                        }
                        setEditOpen(true);
                      }}
                    >
                      <LuPencilLine className="w-5 h-5 !text-[var(--color-neutral-light)]" />
                      Edit category
                    </Button>
                  )}
                  {canExportFaqs && (
                    <Button
                      variant="profile"
                      className="w-full text-left px-4 py-2 !rounded-none flex items-center gap-2 text-[var(--color-neutral-secondary)] !text-sm"
                      onClick={() => setExportListModal(true)}
                    >
                      <Icon
                        name="download"
                        className="w-5 h-5 !text-[var(--color-neutral-light)]"
                      />
                      Export FAQs
                    </Button>
                  )}
                  {canSuspendCategory && (
                    <Button
                      variant="profile"
                      className="w-full text-left px-4 py-2 !rounded-none flex items-center gap-2 text-[var(--color-neutral-secondary)] !text-sm"
                      onClick={() => {
                        setSuspendOpen(true);
                      }}
                    >
                      <RxCrossCircled className="w-5 h-5 !text-[var(--color-neutral-light)]" />
                      Suspend Category
                    </Button>
                  )}
                  {canDeleteCategory && (
                    <Button
                      variant="profile"
                      className="w-full text-left px-4 py-2 !rounded-t-none flex items-center gap-2 text-[var(--color-neutral-secondary)] !text-sm"
                      onClick={() => {
                        setIsDeleteCategory(true);
                        setDeleteCategoryTitle("Delete this category?");
                        setDeleteCategoryDescription("This will permanently remove this category. This action cannot be undone.");
                        setDeleteCategoryCta("YES, DELETE CATEGORY");
                        handleDeleteCategory();
                      }}
                    >
                      <Trash2 className="w-5 h-5 text-[var(--notif-error)]" />
                      Delete category
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {allFaqs.length > 0 && (
          <div className="flex justify-between items-center">
            <SearchWithSuggestions
              data={searchSuggestions || []}
              value={search}
              onChange={handleSearchChange}
              onSelect={handleSuggestionSelect}
              onClear={handleSearchClear}
              placeholder="Search FAQs"
              clearable={true}
              className="!w-64"
              getLabel={(item) => item.name}
              getSubLabel={(item) => item.code}
              openOnFocus={false}
              minChars={1}
            />
            <div className=" flex items-center gap-4">
              <div>
                <span className="text-sm whitespace-nowrap text-[var(--color-stroke-brand)]">
                  Showing {filteredLogs.length} of {allFaqs.length}
                </span>
              </div>
              <Select
                value={selectedFaq}
                onChange={(value) => setSelectedFaq(value)}
                options={faqOptions}
                padding="!h-8 !w-50"
                dropdownwidth="!w-50 !text-base"
              />
            </div>
          </div>
        )}

        {categoriesList.length === 0 ? (
          <div className="py-8">
            <InfoPanel
              description="Create your first category to organize client-facing support content."
              image={null}
              name="No FAQs or categories added yet."
              buttons={[
                {
                  text: "ADD CATEGORY",
                  icon: "plus",
                  className:
                    "!px-4 !py-2 rounded-lg font-medium !text-base flex items-center justify-center uppercase",
                  variant: "primary",
                  onClick: () => {
                    router.push("/support/categories");
                  },
                },
              ]}
            />
          </div>
        ) : allFaqs.length === 0 ? (
          <div className="py-8">
            <InfoPanel
              description="Add your first question to start building this category."
              image={null}
              name="No FAQs yet :("
              buttons={canAddFaq ? [
                {
                  text: "ADD QUESTION",
                  icon: "plus",
                  className:
                    "!px-4 !py-2 rounded-lg font-medium !text-base flex items-center justify-center uppercase",
                  variant: "primary",
                  onClick: () => setAddFaqOpen(true),
                },
              ] : []}
            />
          </div>
        ) : (
          <div className="rounded-lg w-full">
            <Table className="w-full">
              <TableHead>
                <TableRow>
                  <TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)] w-10">
                    <TableCheckbox
                      checked={
                        selectedLogs.length === filteredLogs.length &&
                        filteredLogs.length > 0
                      }
                      indeterminate={
                        selectedLogs.length > 0 &&
                        selectedLogs.length < filteredLogs.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLogs(filteredLogs.map((_, i) => i));
                        } else {
                          setSelectedLogs([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
                    Frequently Asked Question
                  </TableCell>
                  <TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
                    Status
                  </TableCell>
                  <TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
                    Updated
                  </TableCell>
                  <TableCell className="p-4 w-12"></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredLogs.map((log, index) => (
                  <TableRow key={index} className="hover:bg-[var(--color-neutral-bg)]">
                    {/* Checkbox */}
                    <TableCell className="p-4">
                      <TableCheckbox
                        checked={selectedLogs.includes(index)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLogs((prev) => [...prev, index]);
                          } else {
                            setSelectedLogs((prev) => prev.filter((i) => i !== index));
                          }
                        }}
                      />
                    </TableCell>

                    {/* Question & Answer */}
                    <TableCell className="p-4 cursor-pointer">
                      <div
                        onClick={() => handleQuestionDetails(log)}
                        className="font-semibold flex justify-between items-center gap-6 text-[var(--color-neutral-secondary)]"
                      >
                        {log.question}
                        <Icon name={log.icon} className="w-4 h-4 text-[var(--color-stroke-brand)]" />
                      </div>
                      <div className="text-sm text-[var(--color-stroke-brand)]">
                        {log.answer}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="p-4 text-[var(--color-neutral-secondary)]">
                      {log.status}
                    </TableCell>

                    {/* Updated */}
                    <TableCell className="p-4 !whitespace-nowrap text-[var(--color-neutral-secondary)]">
                      {log.updated}
                    </TableCell>

                    {/* Row Menu */}
                    <TableCell className="p-4 w-12 text-right relative">
                      <div className="row-menu-container inline-block">
                        <button
                          onClick={() =>
                            setOpenRowMenu((prev) => (prev === index ? null : index))
                          }
                          className={`p-2 rounded ${openRowMenu === index
                            ? "bg-[var(--color-neutral-secondary-bg)] shadow-[0_0_0_2px_var(--color-shadow-actionmenu)]"
                            : "hover:bg-[var(--color-neutral-secondary-bg)]"
                            }`}
                        >
                          <BsThreeDotsVertical className="w-5 h-5 text-[var(--color-stroke-brand)]" />
                        </button>

                        {openRowMenu === index && (
                          <div className="absolute right-0 mt-2 w-52 bg-white border border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] rounded-lg shadow-[4px_4px_8px_0_var(--color-notif-shadow-soft),0px_0px_4px_0_var(--color-notif-shadow-strong)] z-50">
                            {canEditFaq && (
                              <Button
                                variant="profile"
                                className="w-full text-left px-4 py-2 !rounded-b-none flex items-center gap-2 text-[var(--color-neutral-secondary)] !text-sm"
                                onClick={() => {
                                  setSelectedFaqData(log);
                                  setAddFaqOpen(true);
                                }}
                              >
                                <LuPencilLine className="w-5 h-5 !text-[var(--color-neutral-light)]" />
                                Edit FAQ
                              </Button>
                            )}
                            {canChangeCategory && (
                              <Button
                                variant="profile"
                                className="w-full text-left px-4 py-2 !rounded-none flex items-center gap-2 text-[var(--color-neutral-secondary)] !text-sm"
                                onClick={() => { setSelectedLogs([index]); setOpenChangeCategory(true); }}
                              >
                                <RiLoopRightLine className="w-5 h-5 !text-[var(--color-neutral-light)]" />
                                Change Category
                              </Button>
                            )}
                            {canDeleteFaq && (
                              <Button
                                variant="profile"
                                className="w-full text-left px-4 py-2 !rounded-t-none flex items-center gap-2 text-[var(--color-neutral-secondary)] !text-sm"
                                onClick={() => handleSingleDelete(log)}
                              >
                                <Trash2 className="w-5 h-5 text-[var(--notif-error)]" />
                                Delete FAQ
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <SupportActionBar
              selectedCount={selectedLogs.length}
              onClearSelection={() => setSelectedLogs([])}
              onPublishFAQs={canToggleFaq ? () => {
                setFaqCount(selectedLogs.length);
                setModalType("publish");
                setIsModalOpen(true);
              } : undefined}
              onUnpublishFAQs={canToggleFaq ? () => {
                setFaqCount(selectedLogs.length);
                setModalType("unpublish");
                setIsModalOpen(true);
              } : undefined}
              onDelete={canDeleteFaq ? handleMultipleDelete : undefined}
              onChange={canChangeCategory ? () => setOpenChangeCategory(true) : undefined}
              allowDelete={canDeleteFaq}
              allowChange={canChangeCategory}
              allowToggle={canToggleFaq}
            />
          </div>
        )}
        <LogDetails
          open={openLogDetails}
          details={details}
          onClose={() => setOpenLogDetails(false)}
          onDelete={() => { setOpenLogDetails(false); handleDeleteCategory(); }}
          onEdit={handleEditDetails}
        />
        <ActivateEmployeeModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={async () => {
            try {
              const selectedIds = selectedLogs
                .map(index => filteredLogs[index]?.id)
                .filter(Boolean);

              if (selectedIds.length === 0) {
                showError("No FAQs selected");
                setIsModalOpen(false);
                return;
              }

              const publishingStatus = modalType === "publish" ? "published" : "draft";

              const res = await faqService.toggleFaqStatus(selectedIds, publishingStatus);

              if (res?.success && res?.code === 200) {
                const count = selectedIds.length;
                const actionText = modalType === "publish" ? "published" : "unpublished";
                showSuccess(
                  `FAQ${count === 1 ? "" : "s"} ${actionText} successfully`,
                  `${count === 1 ? "The FAQ has been" : `${count} FAQs have been`} ${actionText} and ${modalType === "publish" ? "will be visible" : "will be hidden"} in the client Help section.`
                );

                await refreshFAQs();

                setSelectedLogs([]);

                setIsModalOpen(false);
              } else {
                showError(res?.message || res?.error || "Failed to update FAQ status");
              }
            } catch (err) {
              showError(err?.response?.data?.message || err?.message || "Failed to update FAQ status");
            }
          }}
          custom={true}
          title={
            modalType === "publish"
              ? "Publish selected FAQs?"
              : "Unpublish selected FAQs?"
          }
          description={
            modalType === "publish"
              ? "This will make the FAQs visible in the client Help section under its category WHEN THE CATEGORY GETS ACTIVATED."
              : "This will hide the FAQs from client platforms, but it will remain saved as a draft WHEN THE CATEGORY GETS ACTIVATED."
          }
          confirmText={
            modalType === "publish"
              ? `YES, PUBLISH ${faqCount} FAQ${faqCount === 1 ? "" : "S"}`
              : `YES, UNPUBLISH ${faqCount} FAQ${faqCount === 1 ? "" : "S"}`
          }
        />
        <ExportListModal
          open={exportListModal}
          onClose={() => setExportListModal(false)}
          options={exportOptions}
          title="Customise your export"
          description="Select the scope, and details you’d like to include in the exportfile."
          onConfirm={async ({ scope }) => {
            try {
              const params = { category_id: selectedCategoryId, include_questions: true };
              if (scope === 'Only published FAQs') params.publishing_status = 'published';
              else if (scope === 'Only draft FAQs') params.publishing_status = 'draft';
              else if (!scope) {
                if (selectedFaq === 'Published FAQs') params.publishing_status = 'published';
                else if (selectedFaq === 'Draft FAQs') params.publishing_status = 'draft';
              }

              const res = await faqService.exportFaqs(params);
              if (res && res.blob) {
                const url = window.URL.createObjectURL(res.blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = (res.filename || 'faqs_export.csv');
                document.body.appendChild(link);
                link.click();
                window.URL.revokeObjectURL(url);
                if (document.body.contains(link)) document.body.removeChild(link);
                showSuccess("Export started", "Your CSV download should begin shortly.");
              } else {
                showError("Failed to export FAQs");
              }
            } catch (e) {
              showError(e?.response?.data?.message || e?.message || "Failed to export FAQs");
            } finally {
              setExportListModal(false);
            }
          }}
        />
        <QuestionDetails
          open={openQuestionDetails}
          onClose={() => setOpenQuestionDetails(false)}
          onEdit={(log) => {
            setOpenQuestionDetails(false);
            if (log) {
              setSelectedFaqData({
                ...log,
                originalCategoryId: log.categoryId || selectedCategoryId,
              });
            } else {
              setSelectedFaqData(null);
            }
            setAddFaqOpen(true);
          }}
          logsData={logsData}
        />
        <AddFaq
          open={addFaqOpen}
          onClose={() => {
            setAddFaqOpen(false);
            setSelectedFaqData(null);
          }}
          mode={selectedFaqData ? "edit" : "add"}
          faqData={selectedFaqData ? {
            ...selectedFaqData,
            originalCategoryId: selectedFaqData.categoryId || selectedCategoryId
          } : null}
          initialCategoryId={selectedCategoryId}
          onSuccess={async (originalCategoryId, newCategoryId) => {
            setAddFaqOpen(false);
            setSelectedFaqData(null);

            if (originalCategoryId && newCategoryId && originalCategoryId !== newCategoryId) {
              const currentCategoryId = selectedCategoryId;

              const oldCategoryData = await refreshCategoryById(originalCategoryId, selectedFaq);

              if (currentCategoryId === originalCategoryId) {
                setAllFaqs(oldCategoryData);
                setFilteredLogs(oldCategoryData);
              } else {
                setSelectedCategoryId(newCategoryId);
                await refreshFAQs(newCategoryId, selectedFaq);
                const searchParams = new URLSearchParams(window.location.search);
                searchParams.set('category_id', newCategoryId);
                window.history.replaceState({}, '', `${window.location.pathname}?${searchParams.toString()}`);
              }
            } else {
              let retryCount = 0;
              const maxRetries = 3;

              const retryRefresh = async () => {
                const refreshed = await refreshCategoryById(selectedCategoryId, selectedFaq);
                setAllFaqs(refreshed);
                setFilteredLogs(refreshed);

                if (refreshed.length === 0 && retryCount < maxRetries) {
                  retryCount++;
                }
              };

              setTimeout(retryRefresh, 500);
            }
          }}
        />
        <ChangeCategory
          open={openChangeCategory}
          onConfirm={handleChangeCategoryConfirm}
          onClose={() => setOpenChangeCategory(false)}
          title={`Move [${selectedLogs.length}] FAQ to a different category?`}
          description="After confirming, the clients will see selected FAQ in the updated category."
        />
        <DeleteCategoryModal
          open={openDeleteCategory}
          onClose={() => setOpenDeleteCategoryModal(false)}
          titleProp={deleteCategoryTitle}
          descriptionProp={deleteCategoryDescription}
          ctaProp={deleteCategoryCta}
          categoryTitle={categoryName}
          faqCount={allFaqs.length}
          onConfirm={async () => {
            try {
              if (isDeleteCategory) {
                if (!selectedCategoryId) { setOpenDeleteCategoryModal(false); return; }
                const res = await faqService.deleteCategories([selectedCategoryId]);
                if (res?.success && res?.code === 200) {
                  showSuccess("Deleted!", "Category deleted successfully.");
                  try {
                    const catsRes = await faqService.getCategories();
                    const list = catsRes?.data?.faq_categories || catsRes?.data?.data?.faq_categories || [];
                    setCategoriesList(list);

                    if (list.length === 0) {
                      router.push("/support/categories");
                    } else {
                      router.push("/support/categories");
                    }
                  } catch (err) {
                    router.push("/support/categories");
                  }
                } else {
                  showError(res?.message || res?.error || "Failed to delete category");
                }
              } else if (deleteIds && deleteIds.length) {
                await faqService.deleteFaqs(deleteIds);
                const count = deleteIds.length;
                showSuccess(
                  `FAQ${count === 1 ? "" : "s"} deleted successfully`,
                  `${count === 1 ? "The FAQ has been" : `${count} FAQs have been`} permanently removed from the system.`
                );
                await refreshFAQs();
                setSelectedLogs([]);
              }
            } catch (e) {
              showError(e?.response?.data?.message || e?.message || "Failed to delete FAQ");
            }
            setOpenDeleteCategoryModal(false);
            setDeleteIds([]);
            setIsDeleteCategory(false);
          }}
        />
        <SuspendCategoryModal
          open={suspendOpen}
          onClose={() => setSuspendOpen(false)}
          categoryTitle={categoryName}
          faqCount={allFaqs.length}
          onConfirm={async () => {
            try {
              if (!selectedCategoryId) { setSuspendOpen(false); return; }
              const res = await faqService.suspendCategories([selectedCategoryId]);
              if (res?.success && res?.code === 200) {
                showSuccess("Category suspended", "This category has been suspended.");
              } else {
                showError(res?.message || res?.error || "Failed to suspend category");
              }
            } catch (e) {
              showError(e?.response?.data?.message || e?.message || "Failed to suspend category");
            } finally {
              setSuspendOpen(false);
            }
          }}
        />
        <AddCategory
          open={editOpen}
          onClose={async () => {
            setEditOpen(false);
            setEditInitial(null);
            try {
              const catsRes = await faqService.getCategories();
              const list = catsRes?.data?.faq_categories || catsRes?.data?.data?.faq_categories || [];
              setCategoriesList(list);

              if (selectedCategoryId) {
                const currentCat = list.find(c => String(c.id) === String(selectedCategoryId));
                if (currentCat) {
                  await refreshFAQs(selectedCategoryId, selectedFaq);
                } else {
                  router.push("/support/categories");
                }
              }
            } catch (err) {
              if (selectedCategoryId) {
                await refreshFAQs(selectedCategoryId, selectedFaq);
              }
            }
          }}
          mode="edit"
          initialValues={{
            id: editInitial?.id,
            name: editInitial?.name,
            icon: editInitial?.icon,
            description: editInitial?.description,
            roles: editInitial?.roles,
          }}
        />
      </div>
    </>
  );
}
