"use client";
import { useState } from "react";
import HelpCard from "@/components/pages/help/HelpCard";
import HelpSearchInput from "../HelpSearchInput";
import HelpWriteToUs from "@/components/pages/help/HelpWriteToUs";
import FeedbackModal from "../FeedbackModal";
import { FiSettings } from "react-icons/fi";
import {
  MdMedicalServices,
  MdBluetooth,
  MdOutlineNotificationsNone,
  MdOutlineSupportAgent,
  MdOutlineHelpOutline,
} from "react-icons/md";
import Link from "next/link";
import Image from "next/image";
import DetailsCollapse from "@/components/ui/DetailsCollapse";
import { IoChevronBack } from "react-icons/io5";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";

const helpSearchData = [
  {
    title: "How can I delete my account?",
    subtitle: "Setup & Installation",
    href: "#",
  },
  {
    title: "How can I reconnect my box?",
    subtitle: "Troubleshoot",
    href: "#",
  },
];

const faqs = [
  {
    href: "/help/troubleshooting",
    icon: (
      <Icon
        name="users"
        className="w-7 h-7 text-[var(--color-admin-profile-border)] opacity-100"
      />
    ),
    title: "Employees & Roles",
    className: "!h-[300px] !py-auto",
  },
  {
    href: "/help/troubleshooting",
    icon: (
      <Icon
        name="inventory"
        className="w-8 h-8 text-[var(--color-admin-profile-border)]"
      />
    ),
    title: "GrubPac boxes",
    className: "!h-[300px] !py-auto",
  },
  {
    href: "/help/troubleshooting",
    icon: (
      <Icon name="crown" className="text-[var(--color-admin-profile-border)]" />
    ),
    title: "Customers",
    className: "!h-[300px] !py-auto",
  },
];

export default function HelpPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [openCollapse, setOpenCollapse] = useState("medical");
  const router = useRouter();

  function handleSearchSelect(item) {
    if (item.href) {
      window.location.href = item.href;
    } else {
      window.alert(item.title);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-120px)]">
      <div className="pb-20">
        <div className="flex items-center gap-3 mb-6">
          <Button
          variant="cancel"
            onClick={() => router.back()}
            className="!p-2 rounded-lg transition-colors mb-8"
            aria-label="Go back"
          >
            <IoChevronBack className="w-4 h-4 text-[var(--color-stroke-brand)]" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-[var(--color-neutral-primary)] mb-1">
              Platform FAQs
            </h1>
            <p className="text-base text-[var(--color-stroke-brand)]">
              Learn how to manage employees, roles, clients, and box assignments.
            </p>
          </div>
        </div>
        <HelpSearchInput
          data={helpSearchData}
          onSelect={handleSearchSelect}
          placeholder="Search FAQs"
          helpSearch={true}
        />

        {/* Collapsible category filters */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {faqs.map((faq) => (
              <HelpCard href={faq.href}>
                  <span className="mb-4 text-[56px] text-[var(--color-brand-icon)] opacity-100">
                    {faq.icon}
                  </span>
                  <span className="font-semibold text-base text-[var(--color-neutral-primary)] text-center">
                    {faq.title}
                  </span>
                  <span className="mt-2 text-sm font-normal leading-5 text-[var(--color-stroke-brand)] text-center max-w-[90%]">
                    {faq.subtitle}
                  </span>
              </HelpCard>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <HelpWriteToUs
          title="Need quick help?"
          body={
            <>Email the support team at <span className="underline">support@grubpac.com</span> and they'll forward your request to the right team.</>
          }
          buttonLabel="EMAIL"
          onClick={() => setModalOpen(true)}
        />
      </div>
      <FeedbackModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onFeedback={() => setModalOpen(false)}
      />
    </div>
  );
}
