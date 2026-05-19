"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import HelpCard from "@/components/pages/help/HelpCard";
import HelpWriteToUs from "@/components/pages/help/HelpWriteToUs";
import HelpSearchInput from "@/app/help/HelpSearchInput";
import Icon from "@/components/ui/Icon";
import { IoIosTrendingUp } from "react-icons/io";
import { MdTrendingUp } from "react-icons/md";
import { FiTrendingUp } from "react-icons/fi";

const searchData = [
  {
    title: "Customer FAQs",
    subtitle: "Delivery, Medical, Hospitality, Camping",
    href: "/help/customer-faqs",
  },
  {
    title: "Platform FAQs",
    subtitle: "Employees, roles, clients, assignments",
    href: "#",
  },
  {
    title: "Client Guidelines",
    subtitle: "Onboarding, assignments, ownership transfers",
    href: "#",
  },
  {
    title: "Escalation Protocols",
    subtitle: "Correct path to forward unresolved issues",
    href: "#",
  },
];

const helpSupportData = [
  {
    href: "/help/customer-faqs",
    icon: (
      <Icon
        name="two_users"
        className="text-[var(--color-admin-profile-border)]"
      />
    ),
    title: "Customer FAQs",
    subtitle:
      "See the same FAQs clients use (Delivery, Medical, Hospitality, and Camping).",
  },
  {
    href: "/help/platform-faqs",
    icon: (
      <Icon
        name="windows_plus"
        className="text-[var(--color-admin-profile-border)]"
      />
    ),
    title: "Platform FAQs",
    subtitle:
      "Learn how to manage employees, roles, clients, and box assignments.",
  },
  {
    href: "/help/client-guidelines",
    icon: (
      <Icon name="note" className="text-[var(--color-admin-profile-border)]" />
    ),
    title: "Client Guidelines",
    subtitle:
      "Step-by-step playbooks for onboarding, assignments, and ownership transfers.",
  },
  {
    href: "/help/escalation-protocols",
    icon: (
      <FiTrendingUp className="w-7 h-7 text-[var(--color-admin-profile-border)]" />
    ),
    title: "Escalation Protocols",
    subtitle:
      "Not sure what to do? Follow the right path to forward unresolved issues.",
  },
];

export default function HelpSupport() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  function handleSelect(item) {
    if (item?.href) {
      window.location.href = item.href;
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-120px)] px-3">
      <div className="pb-20">
        <h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-4">
          Help & Support
        </h1>
        <HelpSearchInput
          data={searchData}
          onSelect={handleSelect}
          placeholder="Search FAQs, guidelines, etc."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 px-4 py-6 gap-6">
          {
            helpSupportData.map((data)=>(
              <HelpCard href={data.href}>
                <div className={`flex flex-col items-center justify-center`}>
                  <span className="mb-4 text-[56px] text-[var(--color-brand-icon)] opacity-100">{data.icon}</span>
                  <span className="font-semibold text-base text-[var(--color-neutral-primary)] text-center">{data.title}</span>
                  <span className="mt-2 text-sm font-normal leading-5 text-[var(--color-stroke-brand)] text-center max-w-[90%]">
                    {data.subtitle}
                  </span>
                </div>
              </HelpCard>
            ))
          }
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <HelpWriteToUs
          title="Need quick help?"
          body={
            <>Email the support team at <span className="underline">support@grubpac.com</span> and they'll forward your request to the right team.</>
          }
          buttonLabel="EMAIL"
          onClick={() => setFeedbackOpen(true)}
        />
      </div>
    </div>
  );
}
