"use client";
import HelpSearchInput from "../HelpSearchInput";
import Link from "next/link";
import HelpFaqAccordion from "@/components/pages/help/HelpFaqAccordion";
import { MdOutlineHelpOutline } from "react-icons/md";
import Button from "@/components/ui/Button";
import { FiEdit2 } from "react-icons/fi";
import Icon from "@/components/ui/Icon";
import { LuPencilLine } from "react-icons/lu";

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
        <Icon name="notes_info" className="text-[var(--color-admin-profile-border)] w-8 h-8"/>
      </span>
    ),
    question: "Box malfunction (Technical issue)",
    subject:<>Box ID <span className="text-[var(--color-stroke-brand)] text-base italic">[XXXX]</span> – Malfunction Report</>,
    body:<>Box ID: <span className="text-[var(--color-stroke-brand)] text-base italic">[Enter Box Serial Number]</span><br />
Reported Issue: <span className="text-[var(--color-stroke-brand)] text-base italic">[Briefly describe issue]</span><br />
Steps already taken: <span className="text-[var(--color-stroke-brand)] text-base italic">[Any troubleshooting done]</span> <br />
Urgency Level: <span className="text-[var(--color-stroke-brand)] text-base italic">[Low / Medium / High]</span> <br />
Supporting documents/screenshots: <span className="text-[var(--color-stroke-brand)] text-base italic">[Attach if available]</span> </>,
  },
  {
    icon: (
      <span className="flex items-center justify-center w-8 h-8 rounded-md ">
        <Icon name="notes_info" className="text-[var(--color-admin-profile-border)] w-8 h-8"/>
      </span>
    ),
    question: "Client assignment (Reassignment issue)",
    answer: "...",
  },
  {
    icon: (
      <span className="flex items-center justify-center w-8 h-8 rounded-md ">
        <Icon name="notes_info" className="text-[var(--color-admin-profile-border)] w-8 h-8"/>
      </span>
    ),
    question: "Repair request (Escalate to repair center)",
    answer: "...",
  },
  {
    icon: (
      <span className="flex items-center justify-center w-8 h-8 rounded-md ">
        <Icon name="notes_info" className="text-[var(--color-admin-profile-border)] w-8 h-8"/>
      </span>
    ),
    question: "Employee access (Permission issue)",
    answer: "...",
  },
  {
    icon: (
      <span className="flex items-center justify-center w-8 h-8 rounded-md ">
        <Icon name="notes_info" className="text-[var(--color-admin-profile-border)] w-8 h-8"/>
      </span>
    ),
    question: "Box malfunction (Technical issue)",
    answer: "...",
  },
];

export default function EscalationTemplate() {
  function handleSearchSelect(item) {
    if (item.href) {
      window.location.href = item.href;
    } else {
      window.alert(item.title);
    }
  }

  return (
    <div className="bg-[var(--color-help-bg)] min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-7">
          <Link href="/help" className="text-[var(--color-stroke-brand)] hover:text-[var(--info-panel-view-bg)]">
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
          </Link>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-primary)]">Escalation templates</h1>
        </div>
        <p
          className="cursor-pointer text-[var(--color-stroke-brand)] text-sm font-medium flex items-center gap-2"
          size="md"
        >
          <LuPencilLine className="w-5 h-5" /> WRITE TO SUPPORT
        </p>
      </div>
      <div className="mb-4">
        <HelpSearchInput data={troubleshootingSearchData} placeholder="Search templates" onSelect={handleSearchSelect} />
      </div>
      <HelpFaqAccordion items={faqs} escalation={true}/>
    </div>
  );
}
