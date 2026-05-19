"use client";
import { FiEdit2 } from "react-icons/fi";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export default function QuestionDetails({
  open,
  onClose,
  onEdit,
  logsData = [],
}) {
  const viewableExtensions = [
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".svg",
    ".txt",
    ".csv",
    ".json",
    ".md",
  ];

  const isViewableInBrowser = (urlOrName = "") => {
    const lower = (urlOrName || "").toLowerCase();
    return viewableExtensions.some((ext) => lower.endsWith(ext));
  };

  const getFilenameFromDisposition = (disposition) => {
    if (!disposition) return null;
    const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match && match[1]) return match[1].replace(/['"]/g, "").trim();
    return null;
  };

  const normalizeAttachments = (raw) => {
    let files = raw?.attachments || raw?.files || raw?.documents || raw?.attachments_urls || [];
    if (!files) return [];
    if (!Array.isArray(files)) files = [files];
    return files
      .map((file) => {
        if (!file) return null;
        if (typeof file === "string") {
          const name = file.split("/").pop() || "attachment";
          return { name, url: file };
        }
        if (typeof file === "object") {
          const name =
            file.name ||
            (file.url ? file.url.split("/").pop() || "attachment" : "attachment");
          const url = file.url || file.href || file.link || null;
          return { name, url };
        }
        return null;
      })
      .filter(Boolean);
  };

  const primaryLog = Array.isArray(logsData) ? logsData[0] : logsData;
  const attachments = normalizeAttachments(primaryLog?.raw || primaryLog);
  const status = primaryLog?.status || "Unknown";

  const handleDownload = async (url, fallbackName = "attachment") => {
    try {
      if (isViewableInBrowser(url) || isViewableInBrowser(fallbackName)) {
        window.open(url, "_blank", "noopener");
        return;
      }
      const res = await fetch(url, { credentials: "include" });
      const blob = await res.blob();
      const nameFromHdr = getFilenameFromDisposition(res.headers.get("content-disposition"));
      const filename = nameFromHdr || fallbackName;
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (_) {
      window.open(url, "_blank", "noopener");
    }
  };

  return (
    <Modal noBlur={true} open={open} onClose={onClose} width="w-[604px]">
      <div className="bg-white">
        <div className="space-y-6">
          {Array.isArray(logsData) && logsData.length > 0 ? (
            logsData.map((log, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div className="text-lg text-[var(--color-neutral-primary)] font-semibold">
                  {log.question}
                </div>
                <div className="text-lg text-[var(--color-neutral-secondary)]">
                  {log.answer}
                </div>
              </div>
            ))
          ) : (
            <div className="text-[var(--color-neutral-secondary)] font-semibold">
              {primaryLog?.question}
            </div>
          )}
        </div>

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-4 my-6">
            {attachments.map((file, idx) => (
              <Button
                key={`${file.name}-${idx}`}
                onClick={() => file.url && handleDownload(file.url, file.name || "attachment")}
                variant="textSecondary"
                className="flex items-center gap-2 px-2 py-1 text-sm leading-none rounded-full btn-size-md-lg bg-[var(--color-stroke-neutral)] text-[var(--color-stroke-brand)]"
                disabled={!file.url}
              >
                {file.name}
              </Button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-4 px-3 pt-4 mt-6 border-t border-[var(--color-box-border)]">
          <span className="text-lg text-[var(--color-neutral-secondary)]">
            {`This FAQ is in ${status}.`}
          </span>
          <Button
            onClick={() => {
              if (typeof onEdit === "function") {
                onEdit(primaryLog || null);
              } else if (typeof onClose === "function") {
                onClose();
              }
            }}
            variant="secondary"
            className="flex items-center gap-3 px-8 btn-size-md-lg"
          >
            <FiEdit2 className="w-4 h-4" />
            EDIT
          </Button>
        </div>
      </div>
    </Modal>
  );
}
