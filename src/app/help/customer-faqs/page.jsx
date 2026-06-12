"use client";
import { useState, useEffect } from "react";
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
      <FiSettings className="w-7 h-7 text-[var(--color-help-icon)] opacity-100" />
    ),
    title: "Setup & Installation",
  },
  {
    href: "/help/troubleshooting",
    icon: (
      <Icon name="medical_suitcase" className="text-[var(--color-help-icon)]" />
    ),
    title: "Troubleshooting",
  },
  {
    href: "/help/troubleshooting",
    icon: (
      <MdBluetooth className="w-8 h-8 text-[var(--color-help-icon)] opacity-100" />
    ),
    title: "Device Connection",
  },
  {
    href: "/help/troubleshooting",
    icon: (
      <Icon
        name="warning_light_blue"
        className="text-[var(--color-help-icon)]"
      />
    ),
    title: "Alert & Notification",
  },
  {
    href: "/help/troubleshooting",
    icon: (
      <Icon
        name="user_shield"
        className="text-[var(--color-help-icon)]"
      />
    ),
    title: "Account & App Support",
  },
  {
    href: "/help/troubleshooting",
    icon: (
      <MdOutlineHelpOutline className="w-8 h-8 text-[var(--color-help-icon)] opacity-100" />
    ),
    title: "Others",
  },
];

export default function HelpPage() {
	const [modalOpen, setModalOpen] = useState(false);
	const [openCollapse, setOpenCollapse] = useState("medical");
	const router = useRouter();

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const vertical = params.get("vertical");
		if (vertical) {
			setOpenCollapse(vertical.toLowerCase());
		}
	}, []);

  function handleSearchSelect(item) {
    if (item.href) {
      window.location.href = item.href;
    } else {
      window.alert(item.title);
    }
  }

  return (
    <div className="">
      <div className="flex items-center gap-3 mb-6">
        <Button
        variant="cancel"
          onClick={() => router.back()}
          className="p-2 mb-8 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <IoChevronBack className="w-4 h-4 text-[var(--color-stroke-brand)]" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-primary)] mb-1">
            Customer FAQs
          </h1>
          <p className="text-base text-[var(--color-stroke-brand)]">
            See the same FAQs clients use (Delivery, Medical, Hospitality, and
            Camping).
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
      <div className="mt-4">
        <DetailsCollapse
          title="Delivery"
          open={openCollapse === "delivery"}
          onClick={() => setOpenCollapse(openCollapse === "delivery" ? "" : "delivery")}
          exportModal={true}
        >
          {/* Intentionally left blank for now */}
        </DetailsCollapse>
        <DetailsCollapse
          title="Medical"
          open={openCollapse === "medical"}
          onClick={() =>
            setOpenCollapse(openCollapse === "medical" ? "" : "medical")
          }
          exportModal={true}
        >
          <div className="px-4 pt-2 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </DetailsCollapse>
        <DetailsCollapse
          title="Hospitality"
          open={openCollapse === "hospitality"}
          onClick={() =>
            setOpenCollapse(openCollapse === "hospitality" ? "" : "hospitality")
          }
          exportModal={true}
        >
          {/* Intentionally left blank for now */}
        </DetailsCollapse>
        <DetailsCollapse
          title="Camping"
          open={openCollapse === "Camping"}
          onClick={() =>
            setOpenCollapse(openCollapse === "Camping" ? "" : "Camping")
          }
          exportModal={true}
        >
          {/* Intentionally left blank for now */}
        </DetailsCollapse>
      </div>
      <HelpWriteToUs
        className="mt-2 w-full"
        title="Need quick help?"
        body={
          "Email the support team at support@grubpac.com and they'll forward your request to the right team."
        }
        buttonLabel="EMAIL"
        onClick={() => setModalOpen(true)}
      />
      <FeedbackModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onFeedback={() => setModalOpen(false)}
      />
    </div>
  );
}
