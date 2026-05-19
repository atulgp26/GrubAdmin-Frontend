"use client";
import HelpSearchInput from "../HelpSearchInput";
import Link from "next/link";
import HelpFaqAccordion from "@/components/pages/help/HelpFaqAccordion";
import { MdOutlineHelpOutline } from "react-icons/md";
import Button from "@/components/ui/Button";
import { FiEdit2 } from "react-icons/fi";
import Icon from "@/components/ui/Icon";
import { LuPencilLine } from "react-icons/lu";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const troubleshootingSearchData = [
  {
    title: "How do I reconnect my box?",
    subtitle: "Troubleshooting",
    href: "#",
  },
  {
    title: "Why am I not receiving alerts?",
    subtitle: " ",
    href: "#",
  },
  {
    title: "How to reset my device?",
    subtitle: "Troubleshooting",
    href: "#",
  },
];

const faqs = [
  {
    icon: (
      <span className="flex items-center justify-center w-8 h-8 rounded-md">
        <Icon name="question_mark" />
      </span>
    ),
    question: "How do I reconnect my box?",
    answer: `If you are not receiving alerts, follow the following steps:\n\n1. Check Your Connection:\nEnsure your phone has a stable internet connection and that the app's notifications are enabled in your device settings.\n2. Review Alert Preferences:\nOpen the app's Settings and verify that your Alert Preferences are configured to receive alerts.\n3. Reconnect or Restart:\nTry reconnecting your box or restarting the app to refresh the connection.\n\nIf you still aren't receiving alerts, please reach out to support for further assistance.`,
  },
  {
    icon: (
      <span className="flex items-center justify-center w-8 h-8 rounded-md ">
        <Icon name="question_mark" />
      </span>
    ),
    question: "How do I reconnect my box?",
    answer: "...",
  },
  {
    icon: (
      <span className="flex items-center justify-center w-8 h-8 rounded-md ">
        <Icon name="question_mark" />
      </span>
    ),
    question: "How do I reconnect my box?",
    answer: "...",
  },
];

function TroubleshootingContent() {
  function handleSearchSelect(item) {
    if (item.href) {
      window.location.href = item.href;
    } else {
      window.alert(item.title);
    }
  }

  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  return (
    <div className="bg-[var(--color-help-bg)] min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-7">
          <Link href="/help" className="text-[var(--color-stroke-brand)]">
          <Button variant="cancel" className="btn-size-md-sm !p-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
              </Button>
          </Link>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-primary)]">{from === "client" ? "Category Name" : "Troubleshooting"}</h1>
        </div>
        <Button
        variant="cancel"
          className="cursor-pointer btn-size-md-sm text-[var(--color-stroke-brand)] text-sm font-medium flex items-center gap-2"
          size="md"
        >
          <LuPencilLine className="w-5 h-5" /> WRITE TO SUPPORT
        </Button>
      </div>
      <div className="mb-4">
        <HelpSearchInput data={troubleshootingSearchData} onSelect={handleSearchSelect} />
      </div>
      <HelpFaqAccordion items={faqs} />
    </div>
  );
}

export default function TroubleshootingPage() {
  return (
    <Suspense fallback={<div className="bg-[var(--color-help-bg)] min-h-screen p-6 flex items-center justify-center">Loading...</div>}>
      <TroubleshootingContent />
    </Suspense>
  );
}
