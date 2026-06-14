"use client";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { FiCheck } from "react-icons/fi";
import { GrAttachment } from "react-icons/gr";
import { RxCross2 } from "react-icons/rx";
import { faqService } from "@/api/services/faqService";
import { showSuccess, showError } from "@/components/ui/toast";

const AddFaq = ({ open, onClose, mode = "add", faqData = null, onSuccess, initialCategoryId = null }) => {
  const statusOptions = [
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
  ];
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [addQuestion, setAddQuestion] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [files, setFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const hasChanges = faqData
    ? addQuestion !== (faqData.question || "") ||
    description !== (faqData.answer || "") ||
    (selectedStatus[0]?.value || "") !== (faqData.status || "")
    : true;

  const handleConfirm = async () => {
    const enabled = mode === "edit" ? isFormValid && hasChanges : isFormValid;
    if (!enabled) return;

    const categoryToUse = selectedCategoryId || (mode === "edit" && faqData?.originalCategoryId) || "";
    if (!categoryToUse) {
      showError("Please select a category");
      return;
    }

    const publishingStatus = selectedStatus[0]?.value;
    if (!publishingStatus) {
      showError("Please select a publishing status");
      return;
    }

    try {
      const payload = {
        question: addQuestion.trim(),
        answer: description.trim(),
        categories: [categoryToUse],
        publishing_status: publishingStatus,
      };

      let res;
      let originalCategoryId = null;
      if (mode === "edit" && faqData?.id) {
        originalCategoryId = faqData.originalCategoryId || faqData.categoryId;
        const formData = new FormData();
        formData.append('question', payload.question);
        formData.append('answer', payload.answer);
        formData.append('categories', JSON.stringify(payload.categories));
        formData.append('publishing_status', payload.publishing_status);
        if (existingAttachments && existingAttachments.length) {
          const keep = existingAttachments.map(a => a?.name || a?.url).filter(Boolean);
          formData.append('attachments', JSON.stringify(keep));
        }
        (files || []).forEach((file, idx) => {
          if (!file) return;
          formData.append('files', file);
          formData.append('files[]', file);
          formData.append(`files[${idx}]`, file);
        });
        res = await faqService.updateFaq(faqData.id, formData);
      } else {
        const formData = new FormData();
        formData.append('question', payload.question);
        formData.append('answer', payload.answer);
        formData.append('categories', JSON.stringify(payload.categories));
        formData.append('publishing_status', payload.publishing_status);
        (files || []).forEach((file, idx) => {
          if (!file) return;
          formData.append('files', file);
          formData.append('files[]', file);
          formData.append(`files[${idx}]`, file);
        });
        res = await faqService.createFaq(formData);
      }

      if (res?.success && res?.code === 200) {
        if (mode === "edit") {
          showSuccess("FAQ updated successfully", "The FAQ has been updated in the category.");
        } else {
          showSuccess("FAQ created successfully", "The FAQ has been added to the category.");
        }
        setAddQuestion("");
        setDescription("");
        setSelectedStatus([]);
        setFiles([]);
        if (onSuccess) {
          await onSuccess(originalCategoryId, categoryToUse);
        } else {
          if (onClose) onClose();
          router.push("/support/supportdefaultlogs");
        }
      } else {
        showError(res?.message || res?.error || "Failed to save FAQ");
      }
    } catch (err) {
      showError(err?.response?.data?.message || err?.response?.data?.error || err?.message || "Failed to save FAQ");
    }
  };

  const onAddFilesClick = (e) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const allowedTypes = ['.png', '.jpg', '.jpeg', '.csv', '.pdf', '.avif', '.webp'];
  const maxSize = 10 * 1024 * 1024; // 10 MB

  const onFilesSelected = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const validFiles = [];
    for (const f of selected) {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(ext)) {
        showError(`"${f.name}" has an unsupported file type. Allowed: png, jpg, csv, pdf, avif, webp`);
        continue;
      }
      if (f.size > maxSize) {
        showError(`"${f.name}" exceeds the 10 MB limit`);
        continue;
      }
      validFiles.push(f);
    }

    if (!validFiles.length) return;

    setFiles((prev) => {
      const existingNames = new Set((prev || []).map((f) => `${f.name}-${f.size}-${f.lastModified}`));
      const merged = [...(prev || [])];
      validFiles.forEach((f) => {
        const key = `${f.name}-${f.size}-${f.lastModified}`;
        if (!existingNames.has(key)) {
          merged.push(f);
          existingNames.add(key);
        }
      });
      return merged;
    });
    if (e.target) e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles((prev) => (prev || []).filter((_, i) => i !== index));
  };

  useEffect(() => {
    const isValid =
      addQuestion.trim() !== "" &&
      description.trim() !== "" &&
      selectedStatus.length > 0 &&
      !!selectedCategoryId;

    setIsFormValid(isValid);
  }, [addQuestion, description, selectedStatus, selectedCategoryId]);

  useEffect(() => {
    if (!open) {
      setAddQuestion("");
      setDescription("");
      setSelectedStatus([]);
      setSelectedCategoryId("");
      return;
    }
    const load = async () => {
      try {
        const res = await faqService.getCategories();
        if (res?.success && res?.code === 200) {
          const list = res.data?.faq_categories || res.data?.data?.faq_categories || [];
          const opts = list.map(c => ({ value: c.id, label: c.name }));
          setCategories(opts);

          if (mode === "edit" && faqData) {
            setAddQuestion(faqData.question || "");
            setDescription(faqData.answer || "");
            const statusVal = (faqData.status || "").toLowerCase();
            const statusOpt = statusOptions.find(o => o.value === statusVal);
            if (statusOpt) setSelectedStatus([statusOpt]);
            const categoryToUse = faqData.categoryId || faqData.originalCategoryId;
            if (categoryToUse) {
              const foundCategory = opts.find(c => c.value === categoryToUse);
              if (foundCategory) {
                setSelectedCategoryId(categoryToUse);
              } else if (opts.length) {
                setSelectedCategoryId(opts[0].value);
              }
            } else if (opts.length) {
              setSelectedCategoryId(opts[0].value);
            }

            try {
              const raw = faqData.raw || faqData;
              let atts = raw?.attachments || raw?.files || raw?.documents || raw?.attachments_urls || [];
              if (atts && !Array.isArray(atts)) atts = [atts];
              const normalized = (atts || []).map((a) => {
                if (!a) return null;
                if (typeof a === 'string') {
                  const name = a.split('/').pop() || 'attachment';
                  return { name, url: a };
                }
                if (typeof a === 'object') {
                  const name = a.name || (a.url ? (a.url.split('/').pop() || 'attachment') : 'attachment');
                  const url = a.url || a.href || a.link || null;
                  return { name, url };
                }
                return null;
              }).filter(Boolean);
              setExistingAttachments(normalized);
            } catch (_) {
              setExistingAttachments([]);
            }
          } else {
            if (!selectedCategoryId) {
              const preferred = initialCategoryId && opts.find(o => o.value === initialCategoryId);
              if (preferred) {
                setSelectedCategoryId(preferred.value);
              } else if (opts.length) {
                setSelectedCategoryId(opts[0].value);
              }
            }
          }
        }
      } catch (_) { }
    };
    load();
  }, [open, mode, faqData, initialCategoryId]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[604px]"
      customClass="overflow-auto"
    >
      <div className="space-y-6">
        <div className="space-y-2 mt-2">
          <h1 className="text-[var(--color-neutral-primary)] font-semibold text-2xl">
            {mode === "edit" ? "Edit FAQ" : "Add new FAQ"}
          </h1>
          <p className="text-[var(--color-stroke-brand)] text-base">
            Once published, it will appear in the client’s Help section.
          </p>
        </div>
        <div className="overflow-y-auto max-h-[70vh] space-y-2  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="flex flex-col space-y-4">
              <h3 className="text-[var(--color-neutral-secondary)] text-base">
                Category
              </h3>
              <div className="w-full flex gap-4">
                <Select
                  value={selectedCategoryId}
                  onChange={(v) => setSelectedCategoryId(v)}
                  options={categories}
                  placeholder="Select category"
                  padding="!py-3 !px-6 !w-full !h-12"
                  dropdownwidth="!w-full !text-base"
                  fontSize="!text-base"
                />
              </div>
            </div>
            <div className="w-full flex flex-col space-y-4 px-1">
              <h3 className="text-[var(--color-neutral-secondary)] text-base">
                Status
              </h3>
              <div className="w-full flex gap-4">
                <Select
                  value={selectedStatus[0]?.value || ""}
                  onChange={(value) => {
                    const statusOpt = statusOptions.find(o => o.value === value);
                    if (statusOpt) setSelectedStatus([statusOpt]);
                  }}
                  options={statusOptions}
                  placeholder="Mark status"
                  padding="!py-3 !px-6 !w-full !h-12"
                  dropdownwidth="!w-full !text-base"
                  fontSize="!text-base"
                />

              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3 px-1">
            <h3 className="text-[var(--color-neutral-secondary)] text-base">
              Question
            </h3>
            <div>
              <TextArea
                placeholder="Add question"
                value={addQuestion}
                onChange={(e) => setAddQuestion(e.target.value)}
                width="!w-full"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-3 px-1">
            <h3 className="text-[var(--color-neutral-secondary)] text-base">
              Answer
            </h3>
            <div>
              <TextArea
                placeholder="Add answer"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                width="!w-full"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-3 mb-6 px-1">
            <h3 className="text-[var(--color-neutral-secondary)] text-base">
              Attachment <span className="text-sm">(optional)</span>
            </h3>
            <div className="flex gap-4 items-start flex-wrap">
          {/* ✅ Label wraps hidden input — click on button naturally triggers file picker */}
<label className="cursor-pointer shrink-0">
  <Button variant="grayOutline" className="flex btn-size-md-lg items-center gap-3">
    <GrAttachment className="w-6 h-6" />
    ADD FILES
  </Button>
  <input
    ref={fileInputRef}
    type="file"
    multiple
    className="hidden"
    accept=".png,.jpg,.jpeg,.csv,.pdf,.avif,.webp"
    onChange={onFilesSelected}
  />
</label>
              {(existingAttachments?.length > 0 || files?.length > 0) && (
                <div className="flex gap-2 flex-wrap max-w-full">
                  {existingAttachments.map((f, idx) => (
                    f?.url ? (
                      <a key={`ex-${idx}`} href={f.url} target="_blank" rel="noopener noreferrer" className="flex leading-none items-center gap-2 rounded-full py-1.5 px-2 bg-[var(--color-stroke-neutral)] text-[var(--color-stroke-brand)] text-sm max-w-[240px] truncate">
                        {f.name || 'attachment'}
                      </a>
                    ) : (
                      <span key={`ex-${idx}`} className="flex leading-none items-center gap-2 rounded-full py-1.5 px-2 bg-[var(--color-stroke-neutral)] text-[var(--color-stroke-brand)] text-sm max-w-[240px] truncate">{f.name || 'attachment'}</span>
                    )
                  ))}
                  {files.map((f, idx) => (
                    <span key={`${f.name}-${idx}`} className="flex leading-none items-center gap-2 rounded-full py-1.5 px-2 bg-[var(--color-stroke-neutral)] text-[var(--color-stroke-brand)] text-sm max-w-[240px] truncate">
                      <button type="button" onClick={() => removeFile(idx)} aria-label="Remove file" className="shrink-0">
                        <RxCross2 className="w-5 h-5" />
                      </button>
                      <span className="truncate">{f.name}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 mb-2 px-1 pt-6 border-t border-[var(--color-box-border)]">
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
              {mode === "edit" ? (
                isFormValid && hasChanges ? (
                  <span className="flex items-center justify-center gap-2">
                    <FiCheck className="w-5 h-5" />
                    SAVE
                  </span>
                ) : (
                  "SAVE CHANGES"
                )
              ) : isFormValid ? (
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

export default AddFaq;